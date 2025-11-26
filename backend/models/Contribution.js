import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add contribution amount'],
    min: 0,
  },
  contributionType: {
    type: String,
    enum: ['monthly', 'special', 'registration', 'fine', 'other'],
    default: 'monthly',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mobile_money'],
    default: 'cash',
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  receiptNumber: {
    type: String,
    unique: true,
  },
  receiptImage: {
    type: String,
  },
  notes: {
    type: String,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'verified',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Contribution', contributionSchema);
