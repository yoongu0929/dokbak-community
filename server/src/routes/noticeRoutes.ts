import { Router } from 'express';
import * as noticeController from '../controllers/noticeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', noticeController.listNotices);
router.get('/:id', noticeController.getNotice);

export default router;
