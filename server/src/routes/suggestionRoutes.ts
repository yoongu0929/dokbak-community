import { Router } from 'express';
import * as suggestionController from '../controllers/suggestionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();
router.use(authMiddleware);

// 일반 유저
router.post('/', suggestionController.createSuggestion);
router.get('/my', suggestionController.getMySuggestions);

// 관리자 전용
router.get('/all', adminMiddleware, suggestionController.getAllSuggestions);
router.put('/:id/status', adminMiddleware, suggestionController.updateStatus);

export default router;
