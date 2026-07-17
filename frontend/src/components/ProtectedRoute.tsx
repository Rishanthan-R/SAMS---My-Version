import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Route guard that checks authentication and role-based access.
 * Redirects to /login if not authenticated.
 * Redirects to the correct dashboard if role doesn't match.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Force password reset check
  if (profile.force_password_reset) {
    return <Navigate to="/setup-password" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect to the user's correct dashboard
    const dashboardMap: Record<string, string> = {
      admin: '/admin/dashboard',
      lecturer: '/lecturer/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={dashboardMap[profile.role] || '/login'} replace />;
  }

  return <>{children}</>;
}
