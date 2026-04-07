import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalAuthMiddleware, dashboardController.getDashboard);

export default router;
