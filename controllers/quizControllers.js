import asyncHandler from "express-async-handler";
import Quiz from "../models/quizSchema.js";
import Question from "../models/questionSchema.js";
import Bookmark from "../models/bookmarkSchema.js";
import QuizResult from "../models/quizResultSchema.js";

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = asyncHandler(async (req, res) => {
  const { search, difficulty, category, sort } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
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
    case "rating":
      sortOption = { rating: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    default:
      sortOption = { enrolled: -1 }; // Default: popular
  }

  const quizzes = await Quiz.find(query).sort(sortOption).populate("questions");

  res.json(quizzes);
});

// @desc    Get featured quizzes
// @route   GET /api/quizzes/featured
// @access  Public
const getFeaturedQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ isFeatured: true })
    .sort({ enrolled: -1 })
    .limit(3)
    .populate("questions");

  res.json(quizzes);
});

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate("questions");

  if (quiz) {
    res.json(quiz);
  } else {
    res.status(404);
    throw new Error("Quiz not found");
  }
});

// @desc    Toggle bookmark
// @route   POST /api/quizzes/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const quizId = req.params.id;

  const existingBookmark = await Bookmark.findOne({
    user: userId,
    quiz: quizId,
  });

  if (existingBookmark) {
    await Bookmark.deleteOne({ _id: existingBookmark._id });
    res.json({ message: "Bookmark removed" });
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

  const quiz = await Quiz.findById(quizId).populate("questions");
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Calculate score
  let score = 0;
  const results = answers.map((answer) => {
    const question = quiz.questions.find(
      (q) => q._id.toString() === answer.questionId
    );
    const isCorrect = question.correctAnswer === answer.selectedOption;
    if (isCorrect) score++;

    return {
      question: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect,
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
    answers: results,
  });

  res.status(201).json(quizResult);
});

// @desc    Create a new quiz (Admin)
// @route   POST /api/quizzes
// @access  Private/Admin
const createQuiz = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    difficulty,
    timeLimit,
    isFeatured,
    questions,
  } = req.body;

  // Validate required fields
  if (
    !title ||
    !description ||
    !category ||
    !difficulty ||
    !questions ||
    questions.length === 0
  ) {
    res.status(400);
    throw new Error(
      "Please include all required fields and at least one question"
    );
  }

  // Create questions first
  const createdQuestions = await Question.create(questions);

  // Create quiz with references to questions
  const quiz = await Quiz.create({
    title,
    description,
    category,
    difficulty,
    timeLimit: timeLimit || 15,
    isFeatured: isFeatured || false,
    questions: createdQuestions.map((q) => q._id),
    createdBy: req.user._id,
  });

  res.status(201).json({
    ...quiz._doc,
    questions: createdQuestions,
  });
});

// @desc    Update a quiz (Admin)
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
const updateQuiz = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    difficulty,
    timeLimit,
    isFeatured,
    questions,
  } = req.body;
  const quizId = req.params.id;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Update basic quiz info
  quiz.title = title || quiz.title;
  quiz.description = description || quiz.description;
  quiz.category = category || quiz.category;
  quiz.difficulty = difficulty || quiz.difficulty;
  quiz.timeLimit = timeLimit || quiz.timeLimit;
  quiz.isFeatured = isFeatured !== undefined ? isFeatured : quiz.isFeatured;

  // Handle question updates if provided
  if (questions && questions.length > 0) {
    // Delete existing questions
    await Question.deleteMany({ _id: { $in: quiz.questions } });

    // Create new questions
    const createdQuestions = await Question.create(questions);
    quiz.questions = createdQuestions.map((q) => q._id);
  }

  const updatedQuiz = await quiz.save();
  const populatedQuiz = await Quiz.findById(updatedQuiz._id).populate(
    "questions"
  );

  res.json(populatedQuiz);
});

// @desc    Delete a quiz (Admin)
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Delete associated questions
  await Question.deleteMany({ _id: { $in: quiz.questions } });

  // Delete quiz results
  await QuizResult.deleteMany({ quiz: quiz._id });

  // Delete bookmarks
  await Bookmark.deleteMany({ quiz: quiz._id });

  // Finally delete the quiz
  await quiz.deleteOne();

  res.json({ message: "Quiz removed" });
});

// @desc    Toggle featured status (Admin)
// @route   PUT /api/quizzes/:id/featured
// @access  Private/Admin
const toggleFeaturedStatus = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  quiz.isFeatured = !quiz.isFeatured;
  await quiz.save();

  res.json({
    _id: quiz._id,
    isFeatured: quiz.isFeatured,
    message: `Quiz ${quiz.isFeatured ? "added to" : "removed from"} featured`,
  });
});

// @desc    Get all quizzes (Admin view with more details)
// @route   GET /api/quizzes/admin/all
// @access  Private/Admin
const getAdminQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({})
    .sort({ createdAt: -1 })
    .populate("questions")
    .populate("createdBy", "name email");

  res.json(quizzes);
});
export {
  getQuizzes,
  getFeaturedQuizzes,
  getQuizById,
  toggleBookmark,
  submitQuizResults,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleFeaturedStatus,
  getAdminQuizzes
};