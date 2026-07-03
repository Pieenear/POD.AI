import { Router } from 'express';
import { EmployerController } from '../controllers/employer.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Gate routes to Employers and Recruiters only
router.use(requireAuth);
router.use(requireRoles(UserRole.EMPLOYER, UserRole.RECRUITER));

router.get('/company', EmployerController.getCompanyProfile);
router.put('/company', EmployerController.updateCompanyProfile);

router.get('/jobs', EmployerController.getJobs);
router.post('/jobs', EmployerController.createJob);
router.put('/jobs/:id', EmployerController.updateJob);
router.delete('/jobs/:id', EmployerController.deleteJob);

router.get('/drives', EmployerController.getDrives);
router.post('/drives', EmployerController.createDrive);

router.get('/jobs/:jobId/applications', EmployerController.getJobApplications);
router.put('/applications/:id/status', EmployerController.updateApplicationStatus);
router.post('/interviews', EmployerController.scheduleInterview);

export default router;
