import { useEffect, useState } from 'react';
import { BookOpen, UserCheck, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { format, parseISO } from 'date-fns';

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

  const summaryCards = [
    { title: 'Enrolled Subjects', value: stats?.totalEnrolled || 0, icon: <BookOpen className="w-5 h-5" />, color: '#8ce0a3' },
    { title: 'Overall Attendance', value: `${stats?.attendancePercentage || 0}%`, icon: <UserCheck className="w-5 h-5" />, color: '#406874' },
    { title: 'Recent Sessions', value: stats?.recentSessions.length || 0, icon: <Activity className="w-5 h-5" />, color: '#8ce0a3' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Good morning, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track your attendance and enrolled subjects</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-8">
          {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {summaryCards.map((card) => (
              <div key={card.title} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: card.color }}
                  >
                    {card.icon}
                  </div>
                </div>
                <p className="text-3xl font-semibold text-gray-900 tracking-tight">{card.value}</p>
                <p className="text-sm text-gray-500 font-medium mt-1">{card.title}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity List */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Attendance</h3>
            
            {!stats?.recentSessions.length ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No recent attendance records found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#406874]/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#406874]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{session.subjectName}</p>
                        <p className="text-xs text-gray-500">{session.subjectCode} • {format(parseISO(session.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        session.status === 'present' ? 'bg-[#8ce0a3]/20 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
