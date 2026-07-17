import { useEffect, useState } from 'react';
import { Users, BookOpen, UserSquare2, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalStudents: number;
  totalLecturers: number;
  totalSubjects: number;
  activeSemester: string;
}

export function AdminDashboard() {
  const { profile, session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient('/api/admin/dashboard', {
          token: session?.access_token
        });
        setStats(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.access_token) fetchStats();
  }, [session]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';

  return (
    <div className="w-full space-y-6">
      <div className="mb-4">
        <h1 className="text-4xl font-light text-gray-900 tracking-tight">
          Welcome in, <span className="font-semibold">{firstName}</span>
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#2566ec] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main User Profile Card */}
          <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-[#164478] to-[#2566ec] rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-lg h-[400px]">
            <div className="absolute inset-0 bg-white/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                System Administrator
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <h2 className="text-3xl font-semibold mb-1">{profile?.full_name}</h2>
              <p className="text-white/70 font-medium mb-6">{stats?.activeSemester || 'No Active Semester'}</p>
              
              <div className="flex gap-2">
                <Link 
                  to="/admin/users"
                  className="bg-white text-[#164478] px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:bg-gray-50 transition-colors"
                >
                  Manage Users
                </Link>
                <Link 
                  to="/admin/academics"
                  className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                  Academics
                </Link>
              </div>
            </div>
          </div>

          {/* Stats & Activity Cards */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            
            {/* Top Stat Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                <p className="text-gray-500 font-medium text-sm mb-2">Total Students</p>
                <div className="flex items-end justify-between mt-auto">
                  <p className="text-5xl font-light text-gray-900">{stats?.totalStudents || 0}</p>
                  <Users className="w-6 h-6 text-[#164478]/50 mb-2" />
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                <p className="text-gray-500 font-medium text-sm mb-2">Total Lecturers</p>
                <div className="flex items-end justify-between mt-auto">
                  <p className="text-5xl font-light text-gray-900">{stats?.totalLecturers || 0}</p>
                  <UserSquare2 className="w-6 h-6 text-[#164478]/50 mb-2" />
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                <p className="text-gray-500 font-medium text-sm mb-2">Active Subjects</p>
                <div className="flex items-end justify-between mt-auto">
                  <p className="text-5xl font-light text-[#2566ec]">{stats?.totalSubjects || 0}</p>
                  <BookOpen className="w-6 h-6 text-[#2566ec]/50 mb-2" />
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[#164478] rounded-[2.5rem] p-8 shadow-lg text-white flex-1 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">System Status Normal</h3>
                  <p className="text-white/70">All SAMS services are operational. You can manage system entities using the quick links below.</p>
                </div>
                
                <div className="flex gap-4 shrink-0">
                  <Link 
                    to="/admin/users"
                    className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:-translate-y-1"
                  >
                    <Users className="w-6 h-6" />
                  </Link>
                  <Link 
                    to="/admin/academics"
                    className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:-translate-y-1"
                  >
                    <LayoutGrid className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
