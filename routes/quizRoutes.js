import express from 'express';
import {
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
} from '../controllers/quizControllers.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getQuizzes);
router.get('/featured', getFeaturedQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/results', protect, submitQuizResults);

// ✅ POST /api/quizzess -> create quiz
router.route('/')
  .post(protect, admin, createQuiz);

router.route('/admin/all')
  .get(protect, admin, getAdminQuizzes);

router.route('/:id')
  .put(protect, admin, updateQuiz)
  .delete(protect, admin, deleteQuiz);

router.route('/:id/featured')
  .put(protect, admin, toggleFeaturedStatus);

export default router;
