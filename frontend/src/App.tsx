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
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAcademics } from './pages/admin/AdminAcademics';
import { LecturerDashboard } from './pages/lecturer/LecturerDashboard';
import { LecturerSubjects } from './pages/lecturer/LecturerSubjects';
import { LecturerGenerateOTP } from './pages/lecturer/LecturerGenerateOTP';
import { LecturerAttendance } from './pages/lecturer/LecturerAttendance';
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
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/academics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAcademics /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Reports" /></ProtectedRoute>} />

            {/* Lecturer Routes */}
            <Route path="/lecturer/dashboard" element={<ProtectedRoute allowedRoles={['lecturer']}><LecturerDashboard /></ProtectedRoute>} />
            <Route path="/lecturer/subjects" element={<ProtectedRoute allowedRoles={['lecturer']}><LecturerSubjects /></ProtectedRoute>} />
            <Route path="/lecturer/generate-otp" element={<ProtectedRoute allowedRoles={['lecturer']}><LecturerGenerateOTP /></ProtectedRoute>} />
            <Route path="/lecturer/attendance" element={<ProtectedRoute allowedRoles={['lecturer']}><LecturerAttendance /></ProtectedRoute>} />

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
