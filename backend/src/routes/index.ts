import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);

export default router;
