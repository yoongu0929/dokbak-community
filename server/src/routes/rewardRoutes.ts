import { Router } from 'express';
import * as rewardController from '../controllers/rewardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/my', rewardController.getMyRewards);

export default router;
