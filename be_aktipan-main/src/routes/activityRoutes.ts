import { Router } from 'express';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getSavedActivities,
  toggleSaveActivity
} from '../controllers/activitiesController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public / optional auth
router.get('/', optionalAuth, getActivities);
router.get('/saved', verifyToken, getSavedActivities);
router.post('/saved/:id', verifyToken, toggleSaveActivity);
router.get('/:id', optionalAuth, getActivityById);

// Protected routes (create/update/delete)
router.post('/', verifyToken, createActivity);
router.put('/:id', verifyToken, updateActivity);
router.delete('/:id', verifyToken, deleteActivity);

export default router;
