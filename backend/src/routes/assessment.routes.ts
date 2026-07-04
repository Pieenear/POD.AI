import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Assessments listings and taking
router.post('/', requireAuth, AssessmentController.createAssessment);
router.get('/', requireAuth, AssessmentController.getAssessments);
router.get('/jobs', requireAuth, AssessmentController.getJobsList);
router.get('/:id', requireAuth, AssessmentController.getAssessmentDetails);
router.post('/:id/submit', requireAuth, AssessmentController.submitAssessment);

export default router;
