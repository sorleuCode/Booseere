import asyncHandler from 'express-async-handler';
import Loan from '../models/Loan.js';
import Member from '../models/Member.js';

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
const getLoans = asyncHandler(async (req, res) => {
  const { status, memberId } = req.query;
  
  let query = {};
  if (status) query.status = status;
  if (memberId) query.memberId = memberId;

  const loans = await Loan.find(query)
    .populate('memberId', 'fullName membershipNumber phone')
    .populate('approvedBy', 'username')
    .sort({ applicationDate: -1 });

  res.json({
    success: true,
    count: loans.length,
    data: loans,
  });
});

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Private
const getLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id)
    .populate('memberId', 'fullName membershipNumber phone email')
    .populate('approvedBy', 'username email')
    .populate('guarantors.memberId', 'fullName phone');

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  res.json({
    success: true,
    data: loan,
  });
});

// @desc    Apply for loan (members) or create loan (admin)
// @route   POST /api/loans
// @access  Private
const applyLoan = asyncHandler(async (req, res) => {
  const { loanAmount, purpose, interestRate, guarantors, memberId } = req.body;

  let member;

  // If memberId is provided (admin creating loan for member), use that
  if (memberId) {
    member = await Member.findById(memberId);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }
  } else {
    // Regular member applying for loan
    member = await Member.findOne({ userId: req.user._id });
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }
  }

  // Calculate total amount with interest
  const rate = interestRate || 0;
  const totalAmount = loanAmount + (loanAmount * rate / 100);

  const loan = await Loan.create({
    memberId: member._id,
    loanAmount,
    interestRate: rate,
    totalAmount,
    purpose,
    guarantors: guarantors || [],
    outstandingBalance: totalAmount,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    data: loan,
  });
});

// @desc    Approve loan
// @route   PUT /api/loans/:id/approve
// @access  Private/Admin
const approveLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.status !== 'pending') {
    res.status(400);
    throw new Error('Loan is not pending approval');
  }

  loan.status = 'approved';
  loan.approvalDate = Date.now();
  loan.approvedBy = req.user._id;

  await loan.save();

  res.json({
    success: true,
    data: loan,
  });
});

// @desc    Reject loan
// @route   PUT /api/loans/:id/reject
// @access  Private/Admin
const rejectLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.status !== 'pending') {
    res.status(400);
    throw new Error('Loan is not pending approval');
  }

  loan.status = 'rejected';
  loan.notes = req.body.notes || loan.notes;

  await loan.save();

  res.json({
    success: true,
    data: loan,
  });
});

// @desc    Disburse loan
// @route   PUT /api/loans/:id/disburse
// @access  Private/Admin
const disburseLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.status !== 'approved') {
    res.status(400);
    throw new Error('Loan must be approved before disbursement');
  }

  loan.status = 'disbursed';
  loan.disbursementDate = Date.now();
  loan.dueDate = req.body.dueDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default

  await loan.save();

  // Update member's total loans
  const member = await Member.findById(loan.memberId);
  member.totalLoans += loan.totalAmount;
  member.outstandingLoan += loan.outstandingBalance;
  await member.save();

  res.json({
    success: true,
    data: loan,
  });
});

// @desc    Add loan repayment
// @route   POST /api/loans/:id/repayment
// @access  Private/Admin
const addRepayment = asyncHandler(async (req, res) => {
  const { amount, paymentDate, receiptNumber, notes } = req.body;

  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.status !== 'disbursed' && loan.status !== 'repaying') {
    res.status(400);
    throw new Error('Loan is not active for repayment');
  }

  if (amount > loan.outstandingBalance) {
    res.status(400);
    throw new Error('Repayment amount exceeds outstanding balance');
  }

  // Add repayment record
  loan.repayments.push({
    amount,
    paymentDate: paymentDate || Date.now(),
    receiptNumber,
    recordedBy: req.user._id,
    notes,
  });

  loan.amountPaid += amount;
  // Note: outstandingBalance will be recalculated by the pre-save hook

  // Update status - use a small threshold to handle floating point precision
  const newOutstandingBalance = loan.totalAmount - (loan.amountPaid + amount);
  console.log(`Loan repayment: amount=${amount}, totalAmount=${loan.totalAmount}, amountPaid=${loan.amountPaid}, newOutstandingBalance=${newOutstandingBalance}`);

  if (newOutstandingBalance <= 0.01) {  // Consider anything <= 0.01 as fully repaid
    console.log('Loan fully repaid - setting status to completed');
    loan.status = 'completed';
    loan.outstandingBalance = 0;  // Ensure it's exactly 0
  } else {
    loan.status = 'repaying';
  }

  await loan.save();

  // Update member's outstanding loan
  const member = await Member.findById(loan.memberId);
  member.outstandingLoan -= amount;
  await member.save();

  res.json({
    success: true,
    data: loan,
  });
});

// @desc    Get member loans
// @route   GET /api/loans/member/:memberId
// @access  Private
const getMemberLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ memberId: req.params.memberId })
    .populate('approvedBy', 'username')
    .sort({ applicationDate: -1 });

  const totalBorrowed = loans
    .filter(loan => loan.status !== 'rejected')
    .reduce((sum, loan) => sum + loan.loanAmount, 0);

  const totalOutstanding = loans
    .filter(loan => ['disbursed', 'repaying'].includes(loan.status))
    .reduce((sum, loan) => sum + loan.outstandingBalance, 0);

  res.json({
    success: true,
    count: loans.length,
    totalBorrowed,
    totalOutstanding,
    data: loans,
  });
});
// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Private/Admin
const updateLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  // Only allow updates for pending or approved loans
  if (!['pending', 'approved'].includes(loan.status)) {
    res.status(400);
    throw new Error('Cannot update loan that has been disbursed or completed');
  }

  const {
    loanAmount,
    purpose,
    interestRate,
    guarantors,
    dueDate,
  } = req.body;

  // Update fields
  if (loanAmount !== undefined) {
    loan.loanAmount = loanAmount;
    const rate = interestRate || loan.interestRate;
    loan.totalAmount = loanAmount + (loanAmount * rate / 100);
    loan.outstandingBalance = loan.totalAmount - loan.amountPaid;
  }

  if (interestRate !== undefined) {
    loan.interestRate = interestRate;
    loan.totalAmount = loan.loanAmount + (loan.loanAmount * interestRate / 100);
    loan.outstandingBalance = loan.totalAmount - loan.amountPaid;
  }

  if (purpose !== undefined) loan.purpose = purpose;
  if (guarantors !== undefined) loan.guarantors = guarantors;
  if (dueDate !== undefined) loan.dueDate = dueDate;

  const updatedLoan = await loan.save();

  res.json({
    success: true,
    data: updatedLoan,
  });
});

// @desc    Delete loan
// @route   DELETE /api/loans/:id
// @access  Private/Admin
const deleteLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  // Only allow deletion of pending or rejected loans
  if (!['pending', 'rejected'].includes(loan.status)) {
    res.status(400);
    throw new Error('Cannot delete loan that has been approved or disbursed');
  }

  await loan.deleteOne();

  res.json({
    success: true,
    message: 'Loan deleted successfully',
  });
});

export {
  getLoans,
  getLoan,
  applyLoan,
  updateLoan,
  deleteLoan,
  approveLoan,
  rejectLoan,
  disburseLoan,
  addRepayment,
  getMemberLoans,
};
