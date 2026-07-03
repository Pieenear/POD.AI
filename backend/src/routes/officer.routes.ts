import { Router } from 'express';
import { OfficerController } from '../controllers/officer.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Gate routes to Placement Officers and College Administrators only
router.use(requireAuth);
router.use(requireRoles(UserRole.PLACEMENT_OFFICER, UserRole.COLLEGE_ADMIN));

router.get('/stats', OfficerController.getStats);

router.get('/companies', OfficerController.getCompanies);
router.put('/companies/:id/verify', OfficerController.verifyCompany);

router.get('/students', OfficerController.getStudents);

router.get('/notices', OfficerController.getNotices);
router.post('/notices', OfficerController.createNotice);
router.delete('/notices/:id', OfficerController.deleteNotice);

router.get('/rules', OfficerController.getRules);
router.put('/rules', OfficerController.updateRules);

export default router;
