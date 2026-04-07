import { Router } from 'express';
import * as noticeController from '../controllers/noticeController';

const router = Router();

router.get('/', noticeController.listNotices);
router.get('/:id', noticeController.getNotice);

export default router;
