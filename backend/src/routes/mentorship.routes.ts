import { Router } from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Read alumni logs (public access allowed)
router.get('/experiences', MentorshipController.getExperiences);

// Write experiences logs (requires login session)
router.post('/experiences', requireAuth, MentorshipController.createExperience);

export default router;
