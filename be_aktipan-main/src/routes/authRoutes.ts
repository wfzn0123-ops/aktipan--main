import { Router } from 'express';
import { register, login, getMe, logout, updateProfile, changePassword } from '../controllers/authController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', optionalAuth, logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;
