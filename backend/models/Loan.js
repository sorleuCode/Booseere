import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  loanAmount: {
    type: Number,
    required: [true, 'Please add loan amount'],
    min: 0,
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: [true, 'Please add loan purpose'],
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  approvalDate: {
    type: Date,
  },
  disbursementDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'repaying', 'completed', 'defaulted'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  outstandingBalance: {
    type: Number,
  },
  repayments: [{
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    receiptNumber: {
      type: String,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
  }],
  guarantors: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
  }],
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate outstanding balance before saving
loanSchema.pre('save', function (next) {
  this.outstandingBalance = this.totalAmount - this.amountPaid;
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Loan', loanSchema);
