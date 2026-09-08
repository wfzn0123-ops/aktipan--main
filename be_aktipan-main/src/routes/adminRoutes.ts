import { Router } from 'express';
import { 
  getStats, 
  getUsers, 
  createUser, 
  updateUserRole, 
  deleteUser, 
  getAuditLogs, 
  resetDatabaseSeed 
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with JWT and Admin role check
router.use(verifyToken);
router.use(requireRole(['Admin']));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/audit-logs', getAuditLogs);
router.post('/seed-reset', resetDatabaseSeed);

export default router;
