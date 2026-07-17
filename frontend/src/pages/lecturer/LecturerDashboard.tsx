import { useEffect, useState } from 'react';
import { BookOpen, ClipboardCheck, KeyRound, Clock, Users, Play, Pause } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalSubjects: number;
  totalSessions: number;
  activeSession: {
    id: string;
    subjectCode: string;
    subjectName: string;
    expiresAt: string;
  } | null;
  recentSessions: {
    id: string;
    date: string;
    subjectCode: string;
    subjectName: string;
    present: number;
    enrolled: number;
  }[];
}

export function LecturerDashboard() {
  const { profile, session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient('/api/lecturer/dashboard', {
          token: session?.access_token
        });
        setStats(data);
        
        if (data.activeSession) {
          const seconds = differenceInSeconds(parseISO(data.activeSession.expiresAt), new Date());
          setTimeLeft(Math.max(0, seconds));
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.access_token) fetchStats();
  }, [session]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Lecturer';

  return (
    <div className="w-full space-y-6">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main User Profile Card */}
          <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-[#164478] to-[#2566ec] rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-lg h-[400px]">
            <div className="absolute inset-0 bg-white/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                Lecturer Profile
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <h2 className="text-3xl font-semibold mb-1">{profile?.full_name}</h2>
              <p className="text-white/70 font-medium mb-6">{profile?.department || 'Academic Staff'}</p>
              
              <div className="flex gap-2">
                <Link 
                  to="/lecturer/generate-otp"
                  className="bg-white text-[#164478] px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:bg-gray-50 transition-colors"
                >
                  Generate OTP
                </Link>
                <Link 
                  to="/lecturer/subjects"
                  className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                  My Subjects
                </Link>
              </div>
            </div>
          </div>

          {/* Stats & Activity Cards */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            
            {/* Top Stat Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <p className="text-gray-500 font-medium text-sm mb-2">Total Subjects</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-light text-gray-900">{stats?.totalSubjects || 0}</p>
                  <BookOpen className="w-5 h-5 text-gray-300 mb-1" />
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <p className="text-gray-500 font-medium text-sm mb-2">Sessions Conducted</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-light text-gray-900">{stats?.totalSessions || 0}</p>
                  <ClipboardCheck className="w-5 h-5 text-gray-300 mb-1" />
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <p className="text-gray-500 font-medium text-sm mb-2">Active Session</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-light text-[#2566ec]">{stats?.activeSession ? '1' : '0'}</p>
                  <KeyRound className="w-5 h-5 text-[#2566ec] mb-1" />
                </div>
              </div>
            </div>

            {/* Middle Section: Active Session Tracker & Recent list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              
              {/* Tracker Widget */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
                <div className="absolute top-6 left-6 text-gray-500 font-medium">Session Tracker</div>
                
                {stats?.activeSession && timeLeft > 0 ? (
                  <div className="relative flex items-center justify-center w-48 h-48">
                    {/* Ring */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="#2566ec" strokeWidth="8"
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * (timeLeft / (10 * 60)))} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <p className="text-3xl font-light text-gray-900">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                        {(timeLeft % 60).toString().padStart(2, '0')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Time Left</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Pause className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">No active session</p>
                  </div>
                )}
              </div>

              {/* Recent Sessions Widget */}
              <div className="bg-[#164478] rounded-[2.5rem] p-8 shadow-lg text-white flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Recent Sessions</h3>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{stats?.recentSessions?.length || 0}</span>
                </div>

                {!stats?.recentSessions?.length ? (
                  <div className="flex-1 flex items-center justify-center text-white/50">
                    No sessions yet
                  </div>
                ) : (
                  <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-2">
                    {stats.recentSessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white/80" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{session.subjectCode}</p>
                            <p className="text-xs text-white/60">{format(parseISO(session.date), 'MMM d, h:mm a')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{session.present}/{session.enrolled}</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest">Present</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
