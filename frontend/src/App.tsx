import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Dashboards
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LecturerDashboard } from './pages/lecturer/LecturerDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentEnroll } from './pages/student/StudentEnroll';
import { StudentMarkAttendance } from './pages/student/StudentMarkAttendance';
import { StudentMyAttendance } from './pages/student/StudentMyAttendance';

// Common
import { ProfilePage } from './pages/ProfilePage';

// Placeholder
import { PlaceholderPage } from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes (Dashboard Layout) */}
          <Route element={<DashboardLayout />}>
            
            {/* Common */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users/students" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Manage Students" /></ProtectedRoute>} />
            <Route path="/admin/users/lecturers" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Manage Lecturers" /></ProtectedRoute>} />
            <Route path="/admin/academic/subjects" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Manage Subjects" /></ProtectedRoute>} />
            <Route path="/admin/academic/semesters" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Manage Semesters" /></ProtectedRoute>} />
            <Route path="/admin/assignments" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Subject Assignments" /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Reports" /></ProtectedRoute>} />

            {/* Lecturer Routes */}
            <Route path="/lecturer/dashboard" element={<ProtectedRoute allowedRoles={['lecturer']}><LecturerDashboard /></ProtectedRoute>} />
            <Route path="/lecturer/subjects" element={<ProtectedRoute allowedRoles={['lecturer']}><PlaceholderPage title="My Subjects" /></ProtectedRoute>} />
            <Route path="/lecturer/generate-otp" element={<ProtectedRoute allowedRoles={['lecturer']}><PlaceholderPage title="Generate OTP" /></ProtectedRoute>} />
            <Route path="/lecturer/attendance" element={<ProtectedRoute allowedRoles={['lecturer']}><PlaceholderPage title="Attendance Records" /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/enroll" element={<ProtectedRoute allowedRoles={['student']}><StudentEnroll /></ProtectedRoute>} />
            <Route path="/student/attendance/mark" element={<ProtectedRoute allowedRoles={['student']}><StudentMarkAttendance /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentMyAttendance /></ProtectedRoute>} />

          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
