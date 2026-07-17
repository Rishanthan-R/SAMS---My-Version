import { Search, Inbox, Bell } from 'lucide-react';
import { cn } from '../utils/utils';

const navItems = [
  { name: 'Dashboard', active: true },
  { name: 'Calendar', active: false },
  { name: 'Projects', active: false },
  { name: 'Team', active: false },
  { name: 'Documents', active: false },
];

export function Navigation() {
  return (
    <nav className="flex items-center justify-between py-4 px-6 md:px-10 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
        {/* Logo */}
        <div className="w-10 h-10 bg-[#8ce0a3] rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </div>
        
        {/* Nav Links */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                item.active
                  ? "bg-[#8ce0a3] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right side actions */}
      <div className="hidden md:flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all"
          />
        </div>
        <button className="text-gray-600 hover:text-gray-900 transition-colors">
          <Inbox className="w-5 h-5" />
        </button>
        <button className="text-gray-600 hover:text-gray-900 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
          <img src="https://i.pravatar.cc/150?u=1" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </nav>
  );
}
