import { Router } from 'express';
import * as noticeController from '../controllers/noticeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// 공개
router.get('/', noticeController.listNotices);
router.get('/:id', noticeController.getNotice);

// 관리자 전용
router.post('/', authMiddleware, adminMiddleware, noticeController.createNotice);
router.put('/:id', authMiddleware, adminMiddleware, noticeController.updateNotice);
router.delete('/:id', authMiddleware, adminMiddleware, noticeController.deleteNotice);

export default router;
