import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Apply auth and admin role check to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard Stats
router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/lecturers/list', adminController.getLecturersList);

// Academics
router.get('/semesters', adminController.getSemesters);
router.post('/semesters', adminController.createSemester);

router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);

export default router;
