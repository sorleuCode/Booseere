import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add full name'],
    trim: true,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    enum: ['President', 'Vice President', 'Secretary', 'Treasurer', 'Member'],
    default: 'Member',
  },
  membershipNumber: {
    type: String,
    unique: true,
    required: true,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  profileImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  totalContributions: {
    type: Number,
    default: 0,
  },
  totalLoans: {
    type: Number,
    default: 0,
  },
  outstandingLoan: {
    type: Number,
    default: 0,
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

// Update timestamp on save
memberSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Member', memberSchema);