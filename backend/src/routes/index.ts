import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import employerRoutes from './employer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/employer', employerRoutes);

export default router;
