import express from 'express';
import {
  getUserResults,
  getUserBookmarks
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/results', protect, getUserResults);
router.get('/bookmarks', protect, getUserBookmarks);

export default router;