import Profile from '../models/profileSchema.js';
import User from '../models/userSchema.js';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email');

    // Lazy-create profile if missing
    if (!profile) {
      profile = new Profile({
        user: req.user._id,
        name: req.user.name,
        title: 'New User',            // required
        bio: 'This is my bio',        // required
        location: 'Unknown',          // required
        website: '',
        github: '',
        twitter: '',
        linkedin: '',
        settings: {
          profileVisibility: 'public',   // must be 'public' or 'private'
          emailPreferences: {
            newsletter: true,
            jobOpportunities: true,
            productUpdates: true
          }
        }
      });
      await profile.save();
    }

    res.json(profile);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, title, bio, location, website, github, twitter, linkedin, stats, settings } = req.body;

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.name = name || profile.name;
    profile.title = title || profile.title;
    profile.bio = bio || profile.bio;
    profile.location = location || profile.location;
    profile.website = website || profile.website;
    profile.github = github || profile.github;
    profile.twitter = twitter || profile.twitter;
    profile.linkedin = linkedin || profile.linkedin;

    if (stats) profile.stats = { ...profile.stats, ...stats };
    if (settings) profile.settings = { ...profile.settings, ...settings };

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile visibility
// @route   PUT /api/profile/visibility
// @access  Private
export const updateProfileVisibility = async (req, res) => {
  try {
    const { profileVisibility } = req.body;
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.settings.profileVisibility = profileVisibility; // must be 'public' or 'private'
    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update email preferences
// @route   PUT /api/profile/email-preferences
// @access  Private
export const updateEmailPreferences = async (req, res) => {
  try {
    const { newsletter, jobOpportunities, productUpdates } = req.body;
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.settings.emailPreferences = {
      newsletter: newsletter !== undefined ? newsletter : profile.settings.emailPreferences.newsletter,
      jobOpportunities: jobOpportunities !== undefined ? jobOpportunities : profile.settings.emailPreferences.jobOpportunities,
      productUpdates: productUpdates !== undefined ? productUpdates : profile.settings.emailPreferences.productUpdates
    };

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
