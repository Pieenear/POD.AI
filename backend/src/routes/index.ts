import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import employerRoutes from './employer.routes';
import officerRoutes from './officer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/employer', employerRoutes);
router.use('/officer', officerRoutes);

export default router;
