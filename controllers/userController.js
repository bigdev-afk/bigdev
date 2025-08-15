import asyncHandler from 'express-async-handler';
import QuizResult from '../models/quizResultSchema.js';
import Bookmark from '../models/bookmarkSchema.js';

// @desc    Get user's quiz results
// @route   GET /api/users/results
// @access  Private
const getUserResults = asyncHandler(async (req, res) => {
  const results = await QuizResult.find({ user: req.user._id })
    .populate('quiz')
    .sort({ createdAt: -1 });

  res.json(results);
});

// @desc    Get user's bookmarked quizzes
// @route   GET /api/users/bookmarks
// @access  Private
const getUserBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate('quiz')
    .sort({ createdAt: -1 });

  res.json(bookmarks);
});

export { getUserResults, getUserBookmarks };