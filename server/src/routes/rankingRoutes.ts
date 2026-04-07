import { Router } from 'express';
import * as rankingController from '../controllers/rankingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// 공개 API
router.get('/current', rankingController.getCurrentRanking);
router.get('/archive/:yearMonth', rankingController.getArchivedRanking);

// 인증 필요
router.get('/my', authMiddleware, rankingController.getMyRanking);

export default router;
