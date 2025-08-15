import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    website: String,
    github: String,
    twitter: String,
    linkedin: String,
    stats: {
      level: {
        type: Number,
        default: 1,
      },
      points: {
        type: Number,
        default: 0,
      },
      rank: Number,
      accuracy: Number,
      streak: {
        type: Number,
        default: 0,
      },
      quizzesCompleted: {
        type: Number,
        default: 0,
      },
      contestsJoined: {
        type: Number,
        default: 0,
      },
    },
    settings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
      },
      emailPreferences: {
        newsletter: {
          type: Boolean,
          default: true,
        },
        jobOpportunities: {
          type: Boolean,
          default: true,
        },
        productUpdates: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;