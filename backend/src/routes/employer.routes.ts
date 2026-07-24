import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { EmployerController } from '../controllers/employer.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/verification-docs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only PDF, PNG, and JPG files are allowed') as any, false);
    }
    cb(null, true);
  }
});

// Gate routes to Employers and Recruiters only
router.use(requireAuth);
router.use(requireRoles(UserRole.EMPLOYER, UserRole.RECRUITER));

router.get('/company', EmployerController.getCompanyProfile);
router.put('/company', EmployerController.updateCompanyProfile);
router.post('/company/verification-doc', upload.single('doc'), EmployerController.uploadVerificationDoc);

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
