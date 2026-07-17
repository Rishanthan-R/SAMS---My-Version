import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function TopBar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Build breadcrumb from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    isLast: idx === pathSegments.length - 1,
  }));

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between py-4 px-6 bg-white/60 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm font-medium">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center">
            {idx > 0 && <span className="mx-2 text-gray-300">›</span>}
            <span className={crumb.isLast ? 'text-gray-900' : 'text-gray-400'}>
              {crumb.name}
            </span>
          </span>
        ))}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-50 border-none outline-none rounded-full text-sm w-40 focus:w-56 focus:bg-white focus:ring-2 focus:ring-[#8ce0a3]/30 transition-all"
          />
        </div>

        {/* Notifications bell */}
        <button className="relative text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border-2 border-white" />
        </button>

        {/* User avatar & menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#406874] flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
            </div>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                <button
                  onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>Profile Settings</span>
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
