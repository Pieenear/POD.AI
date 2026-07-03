import { Router } from 'express';
import { ForumController } from '../controllers/forum.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Retrieve all posts (public access allowed so guests/recruiters can read)
router.get('/', ForumController.getPosts);

// Actions requiring login session
router.post('/', requireAuth, ForumController.createPost);
router.post('/:id/replies', requireAuth, ForumController.createReply);
router.post('/:id/upvote', requireAuth, ForumController.toggleUpvote);

export default router;
