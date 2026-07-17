import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Users, Settings, Bell, BookOpen, Clock, Activity, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';

/**
 * Top Navigation pill for the new floating layout
 */
function TopNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
  };

  const role = profile?.role || 'student';
  
  const navLinks = {
    admin: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-4 h-4" /> },
      { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Academics', path: '/admin/academics', icon: <BookOpen className="w-4 h-4" /> },
    ],
    lecturer: [
      { label: 'Dashboard', path: '/lecturer/dashboard', icon: <Home className="w-4 h-4" /> },
      { label: 'Subjects', path: '/lecturer/subjects', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'Generate OTP', path: '/lecturer/generate-otp', icon: <Activity className="w-4 h-4" /> },
      { label: 'Sessions', path: '/lecturer/attendance', icon: <Clock className="w-4 h-4" /> },
    ],
    student: [
      { label: 'Dashboard', path: '/student/dashboard', icon: <Home className="w-4 h-4" /> },
      { label: 'Enroll', path: '/student/enroll', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'Mark Attendance', path: '/student/attendance/mark', icon: <Activity className="w-4 h-4" /> },
      { label: 'History', path: '/student/attendance', icon: <Clock className="w-4 h-4" /> },
    ],
  };

  const links = navLinks[role as keyof typeof navLinks] || [];

  return (
    <div className="flex items-center justify-between w-full px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#164478] rounded-full flex items-center justify-center text-white font-bold">
          S
        </div>
        <span className="text-xl font-medium tracking-tight text-gray-900">SAMS</span>
      </div>

      <div className="flex items-center gap-1 bg-gray-50/80 p-1.5 rounded-full border border-gray-100">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-[#164478] text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <span className={isActive ? 'text-white/80' : 'text-gray-400'}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-px bg-gray-200 mx-2" />
        
        <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#164478] to-[#2566ec] flex items-center justify-center text-white font-semibold shadow-sm border-2 border-white">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
        </Link>
        
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="ml-2 w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#c8d3df] font-sans p-2 md:p-3 flex items-center justify-center">
      {/* Outer Floating App Window */}
      <div className="w-full max-w-[1800px] h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] bg-[#f2f6fc] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/50">
        <TopNav />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
