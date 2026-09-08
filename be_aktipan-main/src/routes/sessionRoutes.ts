import { Router } from 'express';
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
} from '../controllers/sessionsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/', getSessions);
router.post('/', createSession);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
