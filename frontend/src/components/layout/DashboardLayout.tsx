import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * Main dashboard layout wrapping all authenticated pages.
 * Sidebar (left) + TopBar (top) + main content area.
 */
export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <TopBar />
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
