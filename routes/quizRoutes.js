import express from 'express';
import {
  getQuizzes,
  getFeaturedQuizzes,
  getQuizById,
  toggleBookmark,
  submitQuizResults
} from '../controllers/quizControllers.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getQuizzes);
router.get('/featured', getFeaturedQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/results', protect, submitQuizResults);

export default router;