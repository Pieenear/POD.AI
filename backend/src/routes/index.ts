import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import employerRoutes from './employer.routes';
import officerRoutes from './officer.routes';
import forumRoutes from './forum.routes';
import mentorshipRoutes from './mentorship.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/employer', employerRoutes);
router.use('/officer', officerRoutes);
router.use('/forum', forumRoutes);
router.use('/mentorship', mentorshipRoutes);

export default router;
