import { Router } from 'express';
import { getPacks, createPack, updatePack, deletePack } from '../controllers/packsController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getPacks);

// Pack management protected for Admin
router.post('/', verifyToken, requireRole(['Admin']), createPack);
router.put('/:id', verifyToken, requireRole(['Admin']), updatePack);
router.delete('/:id', verifyToken, requireRole(['Admin']), deletePack);

export default router;
