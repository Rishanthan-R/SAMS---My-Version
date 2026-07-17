import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  Link2,
  BarChart3,
  GraduationCap,
  KeyRound,
  ClipboardCheck,
  UserCheck,
  ListChecks,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: { name: string; path: string }[];
}

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Students', path: '/admin/users/students', icon: <GraduationCap className="w-5 h-5" /> },
  { name: 'Lecturers', path: '/admin/users/lecturers', icon: <Users className="w-5 h-5" /> },
  { name: 'Subjects', path: '/admin/academic/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { name: 'Semesters', path: '/admin/academic/semesters', icon: <CalendarDays className="w-5 h-5" /> },
  { name: 'Assignments', path: '/admin/assignments', icon: <Link2 className="w-5 h-5" /> },
  { name: 'Reports', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
];

const lecturerNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/lecturer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'My Subjects', path: '/lecturer/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { name: 'Generate OTP', path: '/lecturer/generate-otp', icon: <KeyRound className="w-5 h-5" /> },
  { name: 'Attendance', path: '/lecturer/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
];

const studentNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Enroll Subjects', path: '/student/enroll', icon: <BookOpen className="w-5 h-5" /> },
  { name: 'Mark Attendance', path: '/student/attendance/mark', icon: <UserCheck className="w-5 h-5" /> },
  { name: 'My Attendance', path: '/student/attendance', icon: <ListChecks className="w-5 h-5" /> },
];

const navItemsByRole: Record<string, NavItem[]> = {
  admin: adminNavItems,
  lecturer: lecturerNavItems,
  student: studentNavItems,
};

export function Sidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const role = profile?.role || 'student';
  const navItems = navItemsByRole[role] || [];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="w-10 h-10 bg-[#8ce0a3] rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
          <span className="text-lg">S</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">SAMS</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Attendance System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[#8ce0a3] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Profile section at bottom */}
      <div className="border-t border-gray-100 p-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200",
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )
          }
        >
          <div className="w-8 h-8 rounded-full bg-[#406874] flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm transition-colors z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
