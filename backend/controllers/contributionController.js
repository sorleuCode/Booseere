import asyncHandler from 'express-async-handler';
import Contribution from '../models/Contribution.js';
import Member from '../models/Member.js';
import mongoose from 'mongoose';

// @desc    Get all contributions
// @route   GET /api/contributions
// @access  Private
const getContributions = asyncHandler(async (req, res) => {
  const { memberId, type, status, startDate, endDate } = req.query;
  
  let query = {};

  if (memberId) query.memberId = memberId;
  if (type) query.contributionType = type;
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = new Date(startDate);
    if (endDate) query.paymentDate.$lte = new Date(endDate);
  }

  const contributions = await Contribution.find(query)
    .populate('memberId', 'fullName membershipNumber')
    .populate('recordedBy', 'username')
    .sort({ paymentDate: -1 });

  res.json({
    success: true,
    count: contributions.length,
    data: contributions,
  });
});

// @desc    Get single contribution
// @route   GET /api/contributions/:id
// @access  Private
const getContribution = asyncHandler(async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
    console.error('getContribution: invalid id param:', req.params.id);
    res.status(400);
    throw new Error('Invalid contribution id');
  }

  const contribution = await Contribution.findById(req.params.id)
    .populate('memberId', 'fullName membershipNumber phone')
    .populate('recordedBy', 'username email');

  if (!contribution) {
    res.status(404);
    throw new Error('Contribution not found');
  }

  res.json({
    success: true,
    data: contribution,
  });
});

// @desc    Create contribution
// @route   POST /api/contributions
// @access  Private/Admin
const createContribution = asyncHandler(async (req, res) => {
  const { memberId, amount, contributionType, paymentMethod, paymentDate, notes } = req.body;

  // Check if member exists
  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  // Generate unique receipt number with retry logic for duplicates
  let receiptNumber;
  let retryCount = 0;
  const maxRetries = 5;

  while (retryCount < maxRetries) {
    try {
      // Get the current year and find the highest receipt number for this year
      const currentYear = new Date().getFullYear();
      const lastContribution = await Contribution.findOne(
        { receiptNumber: { $regex: `^RCP${currentYear}` } },
        { receiptNumber: 1 },
        { sort: { receiptNumber: -1 } }
      );

      let nextNumber = 1;
      if (lastContribution && lastContribution.receiptNumber) {
        const lastNumber = parseInt(lastContribution.receiptNumber.slice(9));
        nextNumber = lastNumber + 1;
      }

      receiptNumber = `RCP${currentYear}${String(nextNumber).padStart(5, '0')}`;

      // Try to create the contribution to check for duplicates
      const testContribution = new Contribution({
        receiptNumber,
        memberId,
        amount,
        contributionType,
        paymentMethod,
        paymentDate: paymentDate || Date.now(),
        notes,
        recordedBy: req.user._id,
        status: 'verified',
      });

      await testContribution.validate();
      break; // Success, exit the retry loop
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.receiptNumber) {
        // Duplicate key error, retry with next number
        retryCount++;
        if (retryCount >= maxRetries) {
          res.status(409);
          throw new Error('Unable to generate unique receipt number after multiple attempts');
        }
        continue;
      } else {
        // Other validation errors
        throw error;
      }
    }
  }

  const contribution = await Contribution.create({
    memberId,
    amount,
    contributionType,
    paymentMethod,
    paymentDate: paymentDate || Date.now(),
    receiptNumber,
    notes,
    recordedBy: req.user._id,
    status: 'verified',
  });

  // Update member's total contributions
  member.totalContributions += amount;
  await member.save();

  res.status(201).json({
    success: true,
    data: contribution,
  });
});

// @desc    Update contribution
// @route   PUT /api/contributions/:id
// @access  Private/Admin
const updateContribution = asyncHandler(async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
    console.error('updateContribution: invalid id param:', req.params.id);
    res.status(400);
    throw new Error('Invalid contribution id');
  }

  let contribution = await Contribution.findById(req.params.id);

  if (!contribution) {
    res.status(404);
    throw new Error('Contribution not found');
  }

  const oldAmount = contribution.amount;
  const newAmount = req.body.amount || oldAmount;

  contribution = await Contribution.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Update member's total if amount changed
  if (oldAmount !== newAmount) {
    const member = await Member.findById(contribution.memberId);
    member.totalContributions = member.totalContributions - oldAmount + newAmount;
    await member.save();
  }

  res.json({
    success: true,
    data: contribution,
  });
});

// @desc    Delete contribution
// @route   DELETE /api/contributions/:id
// @access  Private/Admin
const deleteContribution = asyncHandler(async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
    console.error('deleteContribution: invalid id param:', req.params.id);
    res.status(400);
    throw new Error('Invalid contribution id');
  }

  const contribution = await Contribution.findById(req.params.id);

  if (!contribution) {
    res.status(404);
    throw new Error('Contribution not found');
  }

  // Update member's total contributions
  const member = await Member.findById(contribution.memberId);
  member.totalContributions -= contribution.amount;
  await member.save();

  await contribution.deleteOne();

  res.json({
    success: true,
    message: 'Contribution deleted',
  });
});

// @desc    Get member contributions
// @route   GET /api/contributions/member/:memberId
// @access  Private
const getMemberContributions = asyncHandler(async (req, res) => {
  // Accept either an ObjectId or a membershipNumber/phone; resolve to ObjectId
  let memberId;
  const incoming = req.params.memberId;
  if (!incoming || incoming === 'undefined') {
    res.status(400);
    throw new Error('Invalid memberId');
  }
  // Prefer explicit validation first
  try {
    const valid = mongoose.isValidObjectId(incoming);
    if (valid) {
      memberId = new mongoose.Types.ObjectId(incoming);
    } else {
      // Not a valid ObjectId string — try to resolve by membershipNumber, phone, or parse JSON
      let member = null;
      // If incoming looks like JSON, try to parse it
      try {
        const parsed = JSON.parse(incoming);
        if (parsed && (parsed._id || parsed.membershipNumber || parsed.phone)) {
          if (parsed._id && mongoose.isValidObjectId(parsed._id)) {
            memberId = new mongoose.Types.ObjectId(parsed._id);
          }
          if (!memberId && parsed.membershipNumber) member = await Member.findOne({ membershipNumber: parsed.membershipNumber });
          if (!memberId && !member && parsed.phone) member = await Member.findOne({ phone: parsed.phone });
        }
      } catch (parseErr) {
        // not JSON, ignore
      }

      if (!memberId) {
        // Try direct lookup by membershipNumber or phone
        member = member || await Member.findOne({ $or: [ { membershipNumber: incoming }, { phone: incoming } ] });
        if (!member && !memberId) {
          console.error('getMemberContributions: unable to resolve incoming member identifier:', incoming);
          res.status(400);
          throw new Error('Invalid memberId');
        }
        if (member) memberId = member._id;
      }
    }
  } catch (err) {
    console.error('getMemberContributions: error while resolving memberId:', err);
    res.status(400);
    throw new Error('Invalid memberId');
  }
  

  const contributions = await Contribution.find({ memberId })
    .populate('recordedBy', 'username')
    .sort({ paymentDate: -1 });

  const total = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);

  res.json({
    success: true,
    count: contributions.length,
    total,
    data: contributions,
  });
});

export {
  getContributions,
  getContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getMemberContributions,
};
