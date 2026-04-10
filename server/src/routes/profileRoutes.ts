import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/me', profileController.getProfile);
router.put('/me/kakao-id', profileController.updateKakaoId);

export default router;
