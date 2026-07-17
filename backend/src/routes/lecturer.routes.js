import { Router } from 'express';
import { lecturerController } from '../controllers/lecturer.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Apply auth and lecturer role check to all routes
router.use(authenticate);
router.use(authorize('lecturer'));

// Dashboard Stats
router.get('/dashboard', lecturerController.getDashboardStats);

// Subjects
router.get('/subjects', lecturerController.getMySubjects);
router.get('/subjects/:id/report', lecturerController.getSubjectReport);
router.get('/subjects/:id/enrollments', lecturerController.getSubjectEnrollments);
router.put('/enrollments/:id/status', lecturerController.updateEnrollmentStatus);

// OTP Generation & Session Management
router.post('/otp/generate', lecturerController.generateOTP);

// Live OTP Session tracker
router.get('/otp-sessions/:id/live', lecturerController.getLiveSession);

// Session History
router.get('/sessions', lecturerController.getSessionHistory);
router.get('/sessions/:id/attendance', lecturerController.getSessionAttendance);
router.post('/sessions/:id/override', lecturerController.manualOverride);

export default router;
