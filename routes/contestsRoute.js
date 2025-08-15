// backend/routes/contestRoutes.js
import express from 'express';
import {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
  toggleBookmark
} from '../controllers/contestControllers.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Base routes
router.route('/')
  .get(getContests)
  .post(protect, admin, createContest);

router.route('/:id')
  .get(getContest)
  .put(protect, admin, updateContest)
  .delete(protect, admin, deleteContest);

router.route('/:id/register')
  .post(protect, registerForContest);

router.route('/:id/bookmark')
  .put(protect, toggleBookmark);

export default router;
