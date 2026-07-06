import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { StudentController } from '../controllers/student.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const docUploadDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(docUploadDir)) {
  fs.mkdirSync(docUploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed') as any, false);
    }
    cb(null, true);
  }
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed') as any, false);
    }
    cb(null, true);
  }
});

// Guard routes to Students only
router.use(requireAuth);
router.use(requireRoles(UserRole.STUDENT));

router.get('/profile', StudentController.getProfile);
router.put('/profile', StudentController.updateProfile);
router.post('/resume/upload', upload.single('resume'), StudentController.uploadResume);
router.post('/document/upload', uploadDoc.single('document'), StudentController.uploadDocument);
router.post('/resume/ai-score', StudentController.triggerAiReview);
router.get('/stats', StudentController.getStats);

router.get('/jobs', StudentController.getJobsList);
router.get('/applications', StudentController.getApplicationsList);
router.post('/applications', StudentController.submitApplication);
router.get('/interviews', StudentController.getInterviewsList);
router.get('/notices', StudentController.getNoticesList);

export default router;
