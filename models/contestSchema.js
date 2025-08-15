import mongoose from 'mongoose';

const ContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  prize: {
    type: Number,
    required: [true, 'Please add a prize amount'],
    min: [0, 'Prize cannot be negative']
  },
  rules: {
    type: [String],
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for registrations
ContestSchema.virtual('registrations', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'contest',
  justOne: false
});

// Cascade delete registrations when a contest is deleted
ContestSchema.pre('deleteOne', { document: true }, async function(next) {
  await this.model('Registration').deleteMany({ contest: this._id });
  next();
});

// Static method to get contests by status
ContestSchema.statics.getByStatus = function(status) {
  const now = new Date();
  let query = {};

  if (status === 'upcoming') {
    query = { startTime: { $gt: now } };
  } else if (status === 'ongoing') {
    query = { startTime: { $lte: now }, endTime: { $gte: now } };
  } else if (status === 'past') {
    query = { endTime: { $lt: now } };
  }

  return this.find(query).populate({
    path: 'registrations',
    select: 'user'
  });
};

export default mongoose.model('Contest', ContestSchema);