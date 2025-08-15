import express from 'express';
import {
  getProfile,
  updateProfile,
  updateProfileVisibility,
  updateEmailPreferences,
} from '../controllers/profileControllers.js';
import { protect, checkBlacklist } from '../middleware/auth.js';
import {
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillControllers.js';
import {
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experienceControllers.js';
import { getActivities, addActivity } from '../controllers/activityControllers.js';


const router = express.Router();

// Skill routes
router
  .route('/skills')
  .get(protect, getSkills)
  .post(protect, addSkill);
router
  .route('/skills/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

// Experience routes
router
  .route('/experiences')
  .get(protect, getExperiences)
  .post(protect, addExperience);
router
  .route('/experiences/:id')
  .put(protect, updateExperience)
  .delete(protect, deleteExperience);

// Activity routes
router
  .route('/activities')
  .get(protect, getActivities)
  .post(protect, addActivity);


// All routes are protected + check blacklist
router.use(checkBlacklist);

router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route('/visibility')
  .put(protect, updateProfileVisibility);

router.route('/email-preferences')
  .put(protect, updateEmailPreferences);

export default router;
