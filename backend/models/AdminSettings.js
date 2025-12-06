import mongoose from 'mongoose';

const adminSettingsSchema = mongoose.Schema({
  cooperativeName: {
    type: String,
    default: 'Unity Cooperative Society'
  },
  contactEmail: {
    type: String,
    default: 'admin@unitycooperative.com'
  },
  contactPhone: {
    type: String,
    default: '+1-234-567-8900'
  },
  address: {
    type: String,
    default: '123 Main Street, City, State 12345'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  interestRate: {
    type: Number,
    default: 5.0
  },
  maxLoanAmount: {
    type: Number,
    default: 10000
  },
  minContribution: {
    type: Number,
    default: 50
  },
  allowPublicRegistration: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
adminSettingsSchema.pre('save', async function(next) {
  const count = await mongoose.model('AdminSettings').countDocuments();
  if (count > 0 && !this.isNew) {
    // Allow updates to existing document
    return next();
  }
  if (count > 0 && this.isNew) {
    const error = new Error('Only one settings document can exist');
    return next(error);
  }
  next();
});

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

export default AdminSettings;