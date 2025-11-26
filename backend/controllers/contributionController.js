import asyncHandler from 'express-async-handler';
import Contribution from '../models/Contribution.js';
import Member from '../models/Member.js';

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

  // Generate receipt number
  const contributionCount = await Contribution.countDocuments();
  const receiptNumber = `RCP${new Date().getFullYear()}${String(contributionCount + 1).padStart(5, '0')}`;

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
  const contributions = await Contribution.find({ memberId: req.params.memberId })
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
