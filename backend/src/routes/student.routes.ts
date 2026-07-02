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

// Guard routes to Students only
router.use(requireAuth);
router.use(requireRoles(UserRole.STUDENT));

router.get('/profile', StudentController.getProfile);
router.put('/profile', StudentController.updateProfile);
router.post('/resume/upload', upload.single('resume'), StudentController.uploadResume);
router.post('/resume/ai-score', StudentController.triggerAiReview);

export default router;
