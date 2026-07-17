import { useEffect, useState } from 'react';
import { Users, Search, ChevronLeft, MapPin, CalendarDays, CheckCircle2, XCircle, Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { format, parseISO } from 'date-fns';

interface Session {
  id: string;
  date: string;
  subjectCode: string;
  subjectName: string;
  present: number;
  enrolled: number;
}

interface AttendanceDetail {
  studentId: string;
  studentName: string;
  regNo: string;
  status: string;
  timeMarked: string;
  distance: number;
}

export function LecturerAttendance() {
  const { session: authSession } = useAuth();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For detailed view
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [details, setDetails] = useState<AttendanceDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiClient('/api/lecturer/sessions', { token: authSession?.access_token });
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (authSession?.access_token) fetchSessions();
  }, [authSession]);

  // Fetch specific session details
  const handleViewDetails = async (sess: Session) => {
    setSelectedSession(sess);
    setDetailsLoading(true);
    setSearch('');
    
    try {
      const data = await apiClient(`/api/lecturer/sessions/${sess.id}/attendance`, { 
        token: authSession?.access_token 
      });
      setDetails(data.attendance);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExport = () => {
    if (!selectedSession || details.length === 0) return;
    const headers = ['Student Name', 'Reg No', 'Status', 'Time Marked', 'Distance (m)'];
    const csvContent = [
      headers.join(','),
      ...details.map(d => [
        `"${d.studentName}"`,
        d.regNo || '',
        d.status,
        d.timeMarked ? format(parseISO(d.timeMarked), 'h:mm a') : '',
        d.distance !== null ? d.distance : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedSession.subjectCode}_${format(parseISO(selectedSession.date), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleOverride = async (studentId: string) => {
    if (!confirm('Mark this student as manually present? This will bypass GPS verification.')) return;
    try {
      await apiClient(`/api/lecturer/sessions/${selectedSession?.id}/override`, {
        method: 'POST',
        token: authSession?.access_token,
        body: JSON.stringify({ studentId })
      });
      if (selectedSession) {
        handleViewDetails(selectedSession); // Refresh
      }
    } catch (err: any) {
      alert(err.message || 'Override failed');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- DETAILED VIEW ---
  if (selectedSession) {
    const filteredDetails = details.filter(d => 
      d.studentName.toLowerCase().includes(search.toLowerCase()) || 
      (d.regNo && d.regNo.toLowerCase().includes(search.toLowerCase()))
    );

    return (
      <div>
        <button 
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Sessions
        </button>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              {selectedSession.subjectCode} - {selectedSession.subjectName}
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {format(parseISO(selectedSession.date), 'EEEE, MMMM d, yyyy • h:mm a')}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 shrink-0">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#8ce0a3]">{selectedSession.present}</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Present</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">{Math.max(0, selectedSession.enrolled - selectedSession.present)}</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Absent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Student Attendance List</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#164478]/30 focus:bg-white transition-all"
                />
              </div>
              <button 
                onClick={handleExport}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#164478] hover:bg-[#0f3057] text-white rounded-full text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {detailsLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg No</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Distance Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDetails.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{d.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{d.regNo || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {d.status === 'present' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </span>
                        ) : d.status === 'manual_override' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-[#164478]">
                            <AlertTriangle className="w-3.5 h-3.5" /> Manual
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {d.status === 'present' ? format(parseISO(d.timeMarked), 'h:mm a') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {d.status === 'present' && d.distance !== null ? (
                          <span className="inline-flex items-center justify-end gap-1 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-blue-500" /> {d.distance}m
                          </span>
                        ) : d.status === 'manual_override' ? (
                          <span className="text-xs text-gray-400 font-medium">Overridden</span>
                        ) : (
                          <button 
                            onClick={() => handleOverride(d.studentId!)}
                            className="text-xs font-semibold text-[#164478] hover:text-[#0f3057] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                          >
                            Mark Present
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredDetails.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                        No students found matching "{search}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Attendance Records</h1>
          <p className="text-sm text-gray-500 mt-1">Review past sessions and student attendance</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-50 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
          <p className="text-sm text-gray-500">You haven't conducted any sessions yet. Generate an OTP to start your first session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              onClick={() => handleViewDetails(session)}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#406874] group-hover:text-white transition-colors">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{format(parseISO(session.date), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-gray-400">{format(parseISO(session.date), 'h:mm a')}</p>
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">{session.subjectName}</h3>
                <p className="text-sm text-gray-500 font-mono">{session.subjectCode}</p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#8ce0a3] border-2 border-white z-20 flex items-center justify-center text-[10px] font-bold text-white">
                      {Math.round((session.present / Math.max(1, session.enrolled)) * 100)}%
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 font-medium ml-2">Attendance Rate</span>
                </div>
                
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{session.present}</span>
                  <span className="text-sm text-gray-400 mx-1">/</span>
                  <span className="text-sm font-semibold text-gray-400">{session.enrolled}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
