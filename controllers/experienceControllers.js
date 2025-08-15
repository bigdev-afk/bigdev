import Experience from '../models/experienceSchema.js';

// @desc    Get all experiences for a user
// @route   GET /api/experiences
// @access  Private
export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ user: req.user._id });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new experience
// @route   POST /api/experiences
// @access  Private
export const addExperience = async (req, res) => {
  try {
    const { role, company, period, description } = req.body;

    const experience = new Experience({
      user: req.user._id,
      role,
      company,
      period,
      description,
    });

    const createdExperience = await experience.save();
    res.status(201).json(createdExperience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an experience
// @route   PUT /api/experiences/:id
// @access  Private
export const updateExperience = async (req, res) => {
  try {
    const { role, company, period, description } = req.body;

    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (experience.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    experience.role = role || experience.role;
    experience.company = company || experience.company;
    experience.period = period || experience.period;
    experience.description = description || experience.description;

    const updatedExperience = await experience.save();
    res.json(updatedExperience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an experience
// @route   DELETE /api/experiences/:id
// @access  Private
export const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (experience.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await experience.remove();
    res.json({ message: 'Experience removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};