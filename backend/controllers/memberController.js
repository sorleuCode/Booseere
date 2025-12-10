import asyncHandler from 'express-async-handler';
import Member from '../models/Member.js';
import Contribution from '../models/Contribution.js';
import Loan from '../models/Loan.js';

// @desc    Get all members (Admin only)
// @route   GET /api/members
// @access  Private/Admin
const getMembers = asyncHandler(async (req, res) => {
  const { position, status, search } = req.query;
  
  let query = {};

  if (position) {
    query.position = position;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { membershipNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const members = await Member.find(query)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: members.length,
    data: members,
  });
});

// @desc    Get single member (Admin only)
// @route   GET /api/members/:id
// @access  Private/Admin
const getMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  // Get member's contributions
  const contributions = await Contribution.find({ memberId: req.params.id })
    .sort({ paymentDate: -1 })
    .limit(10);

  // Get member's loans
  const loans = await Loan.find({ memberId: req.params.id })
    .sort({ applicationDate: -1 });

  res.json({
    success: true,
    data: {
      member,
      contributions,
      loans,
    },
  });
});

// @desc    Create new member (Admin only)
// @route   POST /api/members
// @access  Private/Admin
const createMember = asyncHandler(async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      position,
      profileImage,
    } = req.body;

    // Validate required fields
    if (!fullName) {
      res.status(400);
      throw new Error('Full name is required');
    }

    // Check if member already exists
    const existingMember = await Member.findOne({ phone });

    if (existingMember) {
      res.status(400);
      throw new Error('Member with this phone already exists');
    }

    // Generate unique membership number
    let membershipNumber;
    let isUnique = false;
    let attempt = 0;
    const maxAttempts = 10;

    try {
      // First, find the highest existing membership number
      const highestMember = await Member.findOne()
        .sort({ membershipNumber: -1 })
        .select('membershipNumber');

      let nextNumber = 1;
      if (highestMember && highestMember.membershipNumber) {
        const highestNum = parseInt(highestMember.membershipNumber.replace('COOP', ''));
        nextNumber = highestNum + 1;
      }

      while (!isUnique && attempt < maxAttempts) {
        membershipNumber = `COOP${String(nextNumber + attempt).padStart(4, '0')}`;

        try {
          // Check if this membership number already exists
          const existingMember = await Member.findOne({ membershipNumber });
          if (!existingMember) {
            isUnique = true;
          } else {
            attempt++;
          }
        } catch (error) {
          console.error('Error checking membership number uniqueness:', error);
          attempt++;
        }
      }

      if (!isUnique) {
        res.status(500);
        throw new Error('Unable to generate unique membership number after multiple attempts');
      }
    } catch (error) {
      console.error('Error generating membership number:', error);
      res.status(500);
      throw new Error('Failed to generate membership number due to database error');
    }

    // Create member (profileImage comes from frontend Cloudinary upload)
    const member = await Member.create({
      fullName,
      phone,
      address,
      position: position || 'Member',
      membershipNumber,
      profileImage: profileImage || '',
      status: 'active',
      joinDate: new Date(),
    });

    // Check if initial contribution amount was provided
    if (req.body.totalContributions && req.body.totalContributions > 0) {
      // Generate unique receipt number for the initial contribution using the same logic as createContribution
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
            memberId: member._id,
            amount: req.body.totalContributions,
            contributionType: 'registration',
            paymentMethod: 'cash',
            paymentDate: new Date(),
            notes: 'Initial contribution upon member registration',
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
              console.error('Unable to generate unique receipt number for initial contribution after multiple attempts');
              // Don't throw error here, just skip the initial contribution
              break;
            }
            continue;
          } else {
            // Other validation errors
            throw error;
          }
        }
      }
  
      // Only create the contribution if we have a valid receipt number
      if (receiptNumber) {
        // Create initial contribution record
        const contribution = await Contribution.create({
          memberId: member._id,
          amount: req.body.totalContributions,
          contributionType: 'registration', // Initial contribution is typically a registration fee
          paymentMethod: 'cash', // Default payment method
          paymentDate: new Date(),
          receiptNumber,
          notes: 'Initial contribution upon member registration',
          recordedBy: req.user._id,
          status: 'verified',
        });

      // Update member's total contributions
      member.totalContributions = req.body.totalContributions;
      await member.save();
    }
  }

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('Error in createMember:', error);
    if (error.name === 'ValidationError') {
      res.status(400);
      throw new Error('Invalid member data provided');
    } else if (error.code === 11000) {
      res.status(409);
      throw new Error('Duplicate membership number - please try again');
    } else {
      res.status(500);
      throw new Error('Failed to create member due to server error');
    }
  }
});

// @desc    Update member (Admin only)
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Update member (profileImage comes from frontend Cloudinary upload)
    const updateData = { ...req.body };

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    console.error('Error in updateMember:', error);
    if (error.name === 'ValidationError') {
      res.status(400);
      throw new Error('Invalid member data provided');
    } else {
      res.status(500);
      throw new Error('Failed to update member due to server error');
    }
  }
});

// @desc    Delete member (Admin only)
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  // Check if member has active loans
  const activeLoans = await Loan.countDocuments({
    memberId: req.params.id,
    status: { $in: ['pending', 'approved', 'disbursed', 'repaying'] }
  });

  if (activeLoans > 0) {
    res.status(400);
    throw new Error('Cannot delete member with active loans');
  }

  await member.deleteOne();

  res.json({
    success: true,
    message: 'Member deleted successfully',
  });
});

// @desc    Get member statistics (Admin only)
// @route   GET /api/members/stats
// @access  Private/Admin
const getMemberStats = asyncHandler(async (req, res) => {
  const totalMembers = await Member.countDocuments({ status: 'active' });
  const totalContributions = await Contribution.aggregate([
    { $match: { status: 'verified' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  const totalLoans = await Loan.aggregate([
    { $match: { status: { $in: ['disbursed', 'repaying'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const outstandingLoans = await Loan.aggregate([
    { $match: { status: { $in: ['disbursed', 'repaying'] } } },
    { $group: { _id: null, total: { $sum: '$outstandingBalance' } } },
  ]);

  res.json({
    success: true,
    data: {
      totalMembers,
      totalContributions: totalContributions[0]?.total || 0,
      totalLoans: totalLoans[0]?.total || 0,
      outstandingLoans: outstandingLoans[0]?.total || 0,
    },
  });
});

// @desc    Get statistics for specific member (Admin only)
// @route   GET /api/members/:id/stats
// @access  Private/Admin
const getMemberStatsById = asyncHandler(async (req, res) => {
  const memberId = req.params.id;

  // Verify member exists
  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  // Get member's total contributions
  const contributions = await Contribution.aggregate([
    { $match: { memberId, status: 'verified' } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);

  // Get member's loans
  const loans = await Loan.find({ memberId }).sort({ applicationDate: -1 });
  
  const totalLoans = loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
  const outstandingBalance = loans.reduce((sum, loan) => sum + (loan.outstandingBalance || 0), 0);

  // Get last contribution
  const lastContribution = await Contribution.findOne({ memberId })
    .sort({ paymentDate: -1 });

  res.json({
    success: true,
    data: {
      totalContributions: contributions[0]?.total || 0,
      contributionCount: contributions[0]?.count || 0,
      totalLoans,
      outstandingBalance,
      loanCount: loans.length,
      lastContribution: lastContribution?.paymentDate,
      memberStatus: member.status,
      joinDate: member.joinDate,
    },
  });
});


// @desc    Add loan to a member (Admin only)
// @route   POST /api/members/:id/loans
// @access  Private/Admin
const addLoanToMember = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  const {
    loanAmount,
    interestRate = 0,
    purpose,
    dueDate,
    guarantors = [],
    notes
  } = req.body;

  // 1. Validate member
  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  // 2. Calculate totals
  const totalAmount = loanAmount + (loanAmount * (interestRate / 100));

  // 3. Create loan record
  const loan = await Loan.create({
    memberId,
    loanAmount,
    interestRate,
    totalAmount,
    purpose,
    dueDate,
    guarantors,
    notes,
    status: 'approved', // Auto-approve for admin
    approvalDate: new Date()
  });

  // 4. Update member financials 
  member.totalLoans += totalAmount;
  member.outstandingLoan += totalAmount;
  await member.save();

  res.status(201).json({
    success: true,
    message: 'Loan added successfully',
    data: loan
  });
});


// @desc    Get public members list (no authentication required)
// @route   GET /api/members/public
// @access  Public
const getPublicMembers = asyncHandler(async (req, res) => {
  const { position, search } = req.query;
  
  let query = { status: 'active' };

  if (position) {
    if (position === 'exco') {
      query.position = { $ne: 'Member' };
    } else {
      query.position = position;
    }
  }

  // ✅ Search filter
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { membershipNumber: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
    ];
  }

  const members = await Member.find(query)
    .select('fullName position phone address profileImage membershipNumber status')
    .sort({ position: 1, fullName: 1 });

  const publicMembers = members.map(member => ({
    fullName: member.fullName,
    position: member.position,
    profileImage: member.profileImage || '',
    membershipNumber: member.membershipNumber,
    status: member.status,
    joinDate: member.joinDate,
    phone: member.phone,
    address: member.address
  }));

  res.json({
    success: true,
    count: publicMembers.length,
    data: publicMembers
  });
});

export {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats,
  getMemberStatsById,
  addLoanToMember,
  getPublicMembers,
};