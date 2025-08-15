import Activity from '../models/activitySchema.js';

// @desc    Get all activities for a user
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new activity
// @route   POST /api/activities
// @access  Private
export const addActivity = async (req, res) => {
  try {
    const { type, title, score, rank } = req.body;

    const activity = new Activity({
      user: req.user._id,
      type,
      title,
      score,
      rank,
    });

    const createdActivity = await activity.save();
    res.status(201).json(createdActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};