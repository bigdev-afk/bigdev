import Contest from '../models/contestSchema.js';
import Registration from '../models/registrationSchema.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
export const getContests = async (req, res, next) => {
  try {
    const { status, search, difficulty, prize, sort } = req.query;
    const now = new Date();
    
    // Build query
    let query = {};
    
    // Filter by status
    if (status === 'upcoming') {
      query.startTime = { $gt: now };
    } else if (status === 'ongoing') {
      query.startTime = { $lte: now };
      query.endTime = { $gte: now };
    } else if (status === 'past') {
      query.endTime = { $lt: now };
    }
    
    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Filter by prize
    if (prize) {
      if (prize === 'lt500') query.prize = { $lt: 500 };
      else if (prize === '500-1000') query.prize = { $gte: 500, $lte: 1000 };
      else if (prize === 'gt1000') query.prize = { $gt: 1000 };
    }
    
    // Build sort
    let sortOption = {};
    if (sort === 'prize') sortOption = { prize: -1 };
    else if (sort === 'popularity') sortOption = { 'registrations': -1 };
    else sortOption = { startTime: 1 }; // Default sort by date
    
    const contests = await Contest.find(query)
      .sort(sortOption)
      .populate({
        path: 'registrations',
        select: 'user'
      });
    
    res.status(200).json({
      success: true,
      count: contests.length,
      data: contests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Public
export const getContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id).populate({
      path: 'registrations',
      select: 'user score'
    });
    
    if (!contest) {
      return next(new ErrorResponse(`Contest not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new contest
// @route   POST /api/contests
// @access  Private/Admin
export const createContest = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    const contest = await Contest.create(req.body);
    
    res.status(201).json({
      success: true,
      data: contest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
export const updateContest = async (req, res, next) => {
  try {
    let contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return next(new ErrorResponse(`Contest not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is contest creator or admin
    if (contest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this contest`, 401));
    }
    
    contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
export const deleteContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return next(new ErrorResponse(`Contest not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is contest creator or admin
    if (contest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this contest`, 401));
    }
    
    await contest.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
export const registerForContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return next(new ErrorResponse(`Contest not found with id of ${req.params.id}`, 404));
    }
    
    // Check if contest has already started
    if (contest.startTime < new Date()) {
      return next(new ErrorResponse(`Contest has already started`, 400));
    }
    
    // Check if already registered
    const existingRegistration = await Registration.findOne({
      contest: req.params.id,
      user: req.user.id
    });
    
    if (existingRegistration) {
      return next(new ErrorResponse(`User already registered for this contest`, 400));
    }
    
    const registration = await Registration.create({
      contest: req.params.id,
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: registration
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle bookmark
// @route   PUT /api/contests/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({
      contest: req.params.id,
      user: req.user.id
    });
    
    if (!registration) {
      return next(new ErrorResponse(`Not registered for this contest`, 400));
    }
    
    registration.isBookmarked = !registration.isBookmarked;
    await registration.save();
    
    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (err) {
    next(err);
  }
};