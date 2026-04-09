import { Router } from 'express';
import * as meetupController from '../controllers/meetupController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', meetupController.listMeetups);
router.post('/', meetupController.createMeetup);
router.get('/:id', meetupController.getMeetup);
router.post('/:id/rsvp', meetupController.toggleRsvp);
router.get('/:id/comments', meetupController.getComments);
router.post('/:id/comments', meetupController.createComment);
router.delete('/:id/comments/:commentId', meetupController.deleteComment);
router.delete('/:id', meetupController.deleteMeetup);

export default router;
