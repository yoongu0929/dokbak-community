import { Router } from 'express';
import * as rankingController from '../controllers/rankingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/current', rankingController.getCurrentRanking);
router.get('/archive/:yearMonth', rankingController.getArchivedRanking);
router.get('/my', rankingController.getMyRanking);

export default router;
