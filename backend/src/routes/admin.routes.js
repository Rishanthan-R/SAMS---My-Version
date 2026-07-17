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
router.put('/users/:id', adminController.updateUser);
router.post('/users/bulk', adminController.bulkCreateUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/lecturers/list', adminController.getLecturersList);

// Semesters
router.get('/semesters', adminController.getSemesters);
router.post('/semesters', adminController.createSemester);
router.put('/semesters/:id', adminController.updateSemester);

// Batch Promotion
router.post('/promote-batch', adminController.promoteBatch);

// Subjects
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.post('/subjects/bulk', adminController.bulkCreateSubjects);
router.delete('/subjects/:id', adminController.deleteSubject);

// Timetables
router.get('/subjects/:id/timetables', adminController.getSubjectTimetables);
router.post('/subjects/:id/timetables', adminController.saveSubjectTimetables);

export default router;
