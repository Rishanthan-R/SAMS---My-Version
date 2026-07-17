import { useEffect, useState } from 'react';
import { BookOpen, UserCheck, Activity, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalEnrolled: number;
  attendancePercentage: number;
  recentSessions: {
    id: string;
    status: string;
    date: string;
    subjectCode: string;
    subjectName: string;
  }[];
  subjectStats: {
    code: string;
    name: string;
    percentage: number;
  }[];
}

export function StudentDashboard() {
  const { profile, session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient('/api/student/dashboard', {
          token: session?.access_token
        });
        setStats(data);
      } catch (err: any) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.access_token) {
      fetchStats();
    }
  }, [session]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="w-full space-y-6">
      
      {/* Low Attendance Warning Banner */}
      {stats?.subjectStats && stats.subjectStats.some(s => s.percentage < 80) && (
        <div className="flex flex-col gap-3">
          {stats.subjectStats.filter(s => s.percentage < 80).map(sub => (
            <div key={sub.code} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-start gap-4">
              <div className="bg-red-100 text-red-500 rounded-full p-2 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-red-800 font-semibold text-sm">Action Required: Low Attendance in {sub.code}</h3>
                <p className="text-red-700 text-sm mt-1">Your attendance for <strong>{sub.name}</strong> has fallen to <strong>{sub.percentage}%</strong>, which is below the required 80% threshold. Please contact your lecturer.</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header section matching Crextio design */}
      <div className="mb-4">
        <h1 className="text-4xl font-light text-gray-900 tracking-tight">
          Welcome in, <span className="font-semibold">{firstName}</span>
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#2566ec] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main User Profile Card */}
          <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-[#164478] to-[#2566ec] rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-lg h-[400px]">
            <div className="absolute inset-0 bg-white/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                Student Profile
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <h2 className="text-3xl font-semibold mb-1">{profile?.full_name}</h2>
              <p className="text-white/70 font-medium mb-1">{profile?.reg_no || 'Reg. No. Pending'}</p>
              <p className="text-white/70 font-medium text-xs mb-6">Year {profile?.year_of_study} • Sem {profile?.semester}</p>
              
              <div className="flex gap-2">
                <Link 
                  to="/student/attendance/mark"
                  className="bg-white text-[#164478] px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Mark
                </Link>
                <Link 
                  to="/student/enroll"
                  className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Enroll
                </Link>
              </div>
            </div>
          </div>

          {/* Stats & Activity Cards */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            
            {/* Top Stat Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <p className="text-gray-500 font-medium text-sm mb-2">Enrolled Subjects</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-light text-gray-900">{stats?.totalEnrolled || 0}</p>
                  <BookOpen className="w-5 h-5 text-gray-300 mb-1" />
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <p className="text-gray-500 font-medium text-sm mb-2">Overall Attendance</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-light text-gray-900">{stats?.attendancePercentage || 0}<span className="text-2xl text-gray-400">%</span></p>
                  <UserCheck className="w-5 h-5 text-gray-300 mb-1" />
                </div>
              </div>
              <div className={`rounded-[2rem] p-6 shadow-inner border flex flex-col justify-between hidden sm:flex ${
                (stats?.attendancePercentage || 0) >= 80 ? 'bg-[#eef3f9] border-gray-200' : 'bg-red-50 border-red-100'
              }`}>
                <p className={`font-medium text-sm mb-2 ${
                  (stats?.attendancePercentage || 0) >= 80 ? 'text-[#164478]' : 'text-red-700'
                }`}>Academic Standing</p>
                <div className="flex items-end justify-between">
                  <p className={`text-2xl font-medium ${
                    (stats?.attendancePercentage || 0) >= 80 ? 'text-[#164478]' : 'text-red-700'
                  }`}>
                    {(stats?.attendancePercentage || 0) >= 80 ? 'Good' : 'At Risk'}
                  </p>
                </div>
                <div className={`w-full h-2 rounded-full mt-4 overflow-hidden ${
                  (stats?.attendancePercentage || 0) >= 80 ? 'bg-[#164478]/10' : 'bg-red-200'
                }`}>
                  <div 
                    className={`h-full rounded-full ${(stats?.attendancePercentage || 0) >= 80 ? 'bg-[#164478]' : 'bg-red-500'}`} 
                    style={{ width: `${stats?.attendancePercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Middle Section: Recent list */}
            <div className="bg-[#164478] rounded-[2.5rem] p-8 shadow-lg text-white flex flex-col flex-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Recent Attendance</h3>
                <Link to="/student/attendance" className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full text-sm font-medium">View All</Link>
              </div>

              {!stats?.recentSessions?.length ? (
                <div className="flex-1 flex items-center justify-center text-white/50 py-10">
                  No recent attendance records.
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-2">
                  {stats.recentSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white/80" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{session.subjectName}</p>
                          <p className="text-xs text-white/60">{session.subjectCode} • {format(parseISO(session.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          session.status === 'present' ? 'bg-[#8ce0a3]/20 text-[#8ce0a3]' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
