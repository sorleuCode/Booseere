import mongoose from 'mongoose';

const adminNoteSchema = mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient sorting
adminNoteSchema.index({ createdAt: -1 });

const AdminNote = mongoose.model('AdminNote', adminNoteSchema);

export default AdminNote;