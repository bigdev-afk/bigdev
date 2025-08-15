import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
  contest: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contest',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  submission: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0
  },
  isBookmarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent duplicate registrations
RegistrationSchema.index({ contest: 1, user: 1 }, { unique: true });

export default mongoose.model('Registration', RegistrationSchema);