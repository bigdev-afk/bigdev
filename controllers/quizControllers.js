import asyncHandler from 'express-async-handler';
import Quiz from '../models/quizSchema.js';
import Question from '../models/questionSchema.js';
import Bookmark from '../models/bookmarkSchema.js';
import QuizResult from '../models/quizResultSchema.js';

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = asyncHandler(async (req, res) => {
  const { search, difficulty, category, sort } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  if (category) {
    query.category = category;
  }

  let sortOption = {};
  switch (sort) {
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    default:
      sortOption = { enrolled: -1 }; // Default: popular
  }

  const quizzes = await Quiz.find(query)
    .sort(sortOption)
    .populate('questions');

  res.json(quizzes);
});

// @desc    Get featured quizzes
// @route   GET /api/quizzes/featured
// @access  Public
const getFeaturedQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ isFeatured: true })
    .sort({ enrolled: -1 })
    .limit(3)
    .populate('questions');

  res.json(quizzes);
});

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('questions');

  if (quiz) {
    res.json(quiz);
  } else {
    res.status(404);
    throw new Error('Quiz not found');
  }
});

// @desc    Toggle bookmark
// @route   POST /api/quizzes/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const quizId = req.params.id;

  const existingBookmark = await Bookmark.findOne({ user: userId, quiz: quizId });

  if (existingBookmark) {
    await Bookmark.deleteOne({ _id: existingBookmark._id });
    res.json({ message: 'Bookmark removed' });
  } else {
    const bookmark = await Bookmark.create({ user: userId, quiz: quizId });
    res.status(201).json(bookmark);
  }
});

// @desc    Submit quiz results
// @route   POST /api/quizzes/:id/results
// @access  Private
const submitQuizResults = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;
  const quizId = req.params.id;
  const userId = req.user._id;

  const quiz = await Quiz.findById(quizId).populate('questions');
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Calculate score
  let score = 0;
  const results = answers.map(answer => {
    const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
    const isCorrect = question.correctAnswer === answer.selectedOption;
    if (isCorrect) score++;
    
    return {
      question: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect
    };
  });

  // Update quiz stats
  quiz.enrolled += 1;
  await quiz.save();

  // Save results
  const quizResult = await QuizResult.create({
    user: userId,
    quiz: quizId,
    score,
    totalQuestions: quiz.questions.length,
    timeTaken,
    answers: results
  });

  res.status(201).json(quizResult);
});

export {
  getQuizzes,
  getFeaturedQuizzes,
  getQuizById,
  toggleBookmark,
  submitQuizResults
};