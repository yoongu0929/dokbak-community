import { Router } from 'express';
import * as postController from '../controllers/postController';
import { authMiddleware } from '../middleware/authMiddleware';
import { ownershipMiddleware } from '../middleware/ownershipMiddleware';

const router = Router();

// All post routes require authentication
router.use(authMiddleware);

router.get('/', postController.listPosts);
router.post('/', postController.createPost);
router.get('/:id', postController.getPost);
router.put('/:id', ownershipMiddleware, postController.updatePost);
router.delete('/:id', ownershipMiddleware, postController.deletePost);
router.post('/:id/like', postController.toggleLike);

export default router;
