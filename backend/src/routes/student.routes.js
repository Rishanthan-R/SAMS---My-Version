import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Apply auth and student role check to all routes
router.use(authenticate);
router.use(authorize('student'));

// Dashboard Stats
router.get('/dashboard', studentController.getDashboardStats);

// Enrollment
router.get('/subjects/available', studentController.getAvailableSubjects);
router.post('/enroll', studentController.enrollSubject);

// Attendance
router.get('/attendance', studentController.getAttendanceHistory);
router.post('/attendance/mark', studentController.markAttendance);

export default router;
