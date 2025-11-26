import asyncHandler from 'express-async-handler';
import Member from '../models/Member.js';
import Contribution from '../models/Contribution.js';
import Loan from '../models/Loan.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Member statistics
  const totalMembers = await Member.countDocuments();
  const activeMembers = await Member.countDocuments({ status: 'active' });
  const newMembersThisMonth = await Member.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  // Financial statistics
  const totalContributions = await Contribution.aggregate([
    { $match: { status: 'verified' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const contributionsThisMonth = await Contribution.aggregate([
    {
      $match: {
        status: 'verified',
        paymentDate: { $gte: new Date(new Date().setDate(1)) },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Loan statistics
  const totalLoansIssued = await Loan.aggregate([
    { $match: { status: { $in: ['approved', 'disbursed', 'repaying', 'completed'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const activeLoans = await Loan.countDocuments({ status: { $in: ['disbursed', 'repaying'] } });

  const outstandingLoans = await Loan.aggregate([
    { $match: { status: { $in: ['disbursed', 'repaying'] } } },
    { $group: { _id: null, total: { $sum: '$outstandingBalance' } } },
  ]);

  const pendingLoans = await Loan.countDocuments({ status: 'pending' });

  res.json({
    success: true,
    data: {
      members: {
        total: totalMembers,
        active: activeMembers,
        newThisMonth: newMembersThisMonth,
      },
      contributions: {
        total: totalContributions[0]?.total || 0,
        thisMonth: contributionsThisMonth[0]?.total || 0,
      },
      loans: {
        totalIssued: totalLoansIssued[0]?.total || 0,
        active: activeLoans,
        outstanding: outstandingLoans[0]?.total || 0,
        pending: pendingLoans,
      },
    },
  });
});

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private/Admin
const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  // Recent contributions
  const recentContributions = await Contribution.find()
    .populate('memberId', 'fullName')
    .sort({ createdAt: -1 })
    .limit(limit);

  // Recent loans
  const recentLoans = await Loan.find()
    .populate('memberId', 'fullName')
    .sort({ applicationDate: -1 })
    .limit(limit);

  // Recent members
  const recentMembers = await Member.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    data: {
      contributions: recentContributions,
      loans: recentLoans,
      members: recentMembers,
    },
  });
});

// @desc    Get financial report
// @route   GET /api/admin/financial-report
// @access  Private/Admin
const getFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.paymentDate = {};
    if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
    if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
  }

  // Contributions by type
  const contributionsByType = await Contribution.aggregate([
    { $match: { ...dateFilter, status: 'verified' } },
    {
      $group: {
        _id: '$contributionType',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Monthly contributions trend
  const monthlyContributions = await Contribution.aggregate([
    { $match: { status: 'verified' } },
    {
      $group: {
        _id: {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  // Loan statistics
  const loanStats = await Loan.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      contributionsByType,
      monthlyContributions,
      loanStats,
    },
  });
});

// @desc    Create admin user
// @route   POST /api/admin/create-admin
// @access  Private/Admin
const createAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, fullName, phone } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create admin user
  const user = await User.create({
    username,
    email,
    password,
    role: 'admin',
  });

  // Generate membership number
  const memberCount = await Member.countDocuments();
  const membershipNumber = `COOP${String(memberCount + 1).padStart(4, '0')}`;

  // Create member profile
  await Member.create({
    userId: user._id,
    fullName: fullName || username,
    phone: phone || '',
    membershipNumber,
    position: 'President', // Default admin position
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Export data as CSV
// @route   GET /api/admin/export/:type
// @access  Private/Admin
const exportData = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  let data;
  let filename;
  let headers;

  switch (type) {
    case 'members':
      data = await Member.find(dateFilter)
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });
      
      filename = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
      headers = 'Membership Number,Full Name,Phone,Email,Address,Position,Status,Join Date\n';
      
      const memberCSV = data.map(member => 
        `${member.membershipNumber},"${member.fullName}",${member.phone},${member.userId?.email || 'N/A'},"${member.address || 'N/A'}",${member.position},${member.status},${member.joinDate?.toISOString().split('T')[0] || 'N/A'}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(headers + memberCSV);

    case 'contributions':
      data = await Contribution.find(dateFilter)
        .populate('memberId', 'fullName membershipNumber')
        .populate('recordedBy', 'username')
        .sort({ paymentDate: -1 });
      
      filename = `contributions_export_${new Date().toISOString().split('T')[0]}.csv`;
      headers = 'Receipt Number,Member Name,Membership Number,Amount,Type,Payment Date,Status,Recorded By\n';
      
      const contributionCSV = data.map(contrib => 
        `${contrib.receiptNumber},"${contrib.memberId?.fullName || 'N/A'}",${contrib.memberId?.membershipNumber || 'N/A'},${contrib.amount},${contrib.contributionType},${contrib.paymentDate?.toISOString().split('T')[0]},${contrib.status},${contrib.recordedBy?.username || 'N/A'}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(headers + contributionCSV);

    case 'loans':
      data = await Loan.find(dateFilter)
        .populate('memberId', 'fullName membershipNumber phone')
        .populate('approvedBy', 'username')
        .sort({ applicationDate: -1 });
      
      filename = `loans_export_${new Date().toISOString().split('T')[0]}.csv`;
      headers = 'Member Name,Membership Number,Loan Amount,Interest Rate,Total Amount,Status,Application Date,Approval Date,Outstanding Balance\n';
      
      const loanCSV = data.map(loan => 
        `"${loan.memberId?.fullName || 'N/A'}",${loan.memberId?.membershipNumber || 'N/A'},${loan.loanAmount},${loan.interestRate}%,${loan.totalAmount},${loan.status},${loan.applicationDate?.toISOString().split('T')[0]},${loan.approvalDate?.toISOString().split('T')[0] || 'N/A'},${loan.outstandingBalance}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(headers + loanCSV);

    default:
      res.status(400);
      throw new Error('Invalid export type. Use: members, contributions, or loans');
  }
});

export {
  getDashboardStats,
  getRecentActivities,
  getFinancialReport,
  createAdmin,
  exportData,
};
