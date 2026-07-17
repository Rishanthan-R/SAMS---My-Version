import { useEffect, useState } from 'react';
import { BookOpen, Users, LayoutGrid, Download, AlertTriangle, FileText, ChevronLeft, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { Link } from 'react-router-dom';

interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  year_of_study: number;
  semester: number;
}

export function LecturerSubjects() {
  const { session } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // Enrollments Modal State
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentSubject, setEnrollmentSubject] = useState<Subject | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  const fetchAndShowReport = async (subject: Subject) => {
    try {
      setReportLoading(true);
      setShowReportModal(true);
      const data = await apiClient(`/api/lecturer/subjects/${subject.id}/report`, {
        token: session?.access_token
      });
      setReportData(data);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch report');
      setShowReportModal(false);
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportSummary = async (subject: Subject) => {
    try {
      setExportingId(subject.id);
      const data = await apiClient(`/api/lecturer/subjects/${subject.id}/report`, {
        token: session?.access_token
      });
      
      if (!data.report || data.report.length === 0) {
        alert('No enrollment or attendance data found for this subject.');
        return;
      }

      const headers = ['Student Name', 'Reg No', 'Sessions Present', 'Total Sessions', 'Attendance %'];
      const csvContent = [
        headers.join(','),
        ...data.report.map((r: any) => [
          `"${r.name}"`,
          r.regNo || '',
          r.presentCount,
          r.totalSessions,
          `${r.percentage}%`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `summary_${subject.code}_semester.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to generate report');
    } finally {
      setExportingId(null);
    }
  };

  const handleOpenEnrollments = async (subject: Subject) => {
    setEnrollmentSubject(subject);
    setShowEnrollmentModal(true);
    setEnrollmentsLoading(true);
    try {
      const data = await apiClient(`/api/lecturer/subjects/${subject.id}/enrollments`, {
        token: session?.access_token
      });
      setEnrollments(data);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch enrollments');
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleUpdateEnrollmentStatus = async (enrollmentId: string, status: string) => {
    try {
      await apiClient(`/api/lecturer/enrollments/${enrollmentId}/status`, {
        method: 'PUT',
        token: session?.access_token,
        body: { status }
      });
      setEnrollments(enrollments.map(e => e.id === enrollmentId ? { ...e, status } : e));
    } catch (err: any) {
      alert(err.message || 'Failed to update enrollment');
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await apiClient('/api/lecturer/subjects', {
          token: session?.access_token
        });
        setSubjects(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.access_token) fetchSubjects();
  }, [session]);

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">My Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">Subjects assigned to you for the current academic year</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-50 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subjects Assigned</h3>
          <p className="text-sm text-gray-500">You haven't been assigned any active subjects yet. Contact the administrator if this is an error.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-all group flex flex-col">
              <div className="w-12 h-12 bg-[#8ce0a3]/10 rounded-2xl flex items-center justify-center text-[#8ce0a3] mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-2 flex-1">{subject.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Course Code</span>
                  <span className="font-semibold text-gray-900">{subject.code}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Credits</span>
                  <span className="font-semibold text-gray-900">{subject.credits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Year / Semester</span>
                  <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                    Y{subject.year_of_study} S{subject.semester}
                  </span>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100 flex gap-2">
                <Link
                  to={`/lecturer/generate-otp?subject=${subject.id}`}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-[#8ce0a3] hover:text-white text-gray-700 text-sm font-medium rounded-xl text-center transition-colors"
                >
                  Start Session
                </Link>
                <Link
                  to={`/lecturer/attendance?subject=${subject.id}`}
                  title="View Sessions"
                  className="w-11 h-[42px] bg-gray-50 hover:bg-blue-100 text-[#164478] rounded-xl flex items-center justify-center transition-colors"
                >
                  <Users className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleOpenEnrollments(subject)}
                  title="Manage Enrollments"
                  className="w-11 h-[42px] bg-gray-50 hover:bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Users className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fetchAndShowReport(subject)}
                  title="View Attendance Report"
                  className="w-11 h-[42px] bg-gray-50 hover:bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center transition-colors"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleExportSummary(subject)}
                  disabled={exportingId === subject.id}
                  title="Download Semester Summary"
                  className="w-11 h-[42px] bg-gray-50 hover:bg-green-100 text-green-700 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {exportingId === subject.id ? (
                     <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {reportData ? `${reportData.subject.code} - ${reportData.subject.name}` : 'Loading Report...'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Overall Semester Attendance</p>
              </div>
              <button onClick={() => {setShowReportModal(false); setReportData(null);}} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              {reportLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !reportData || !reportData.report || reportData.report.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No enrollment or attendance data found for this subject.
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg No</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Sessions Present</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.report.map((r: any, idx: number) => (
                        <tr key={idx} className={`transition-colors ${r.percentage < 80 ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50/50'}`}>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {r.name}
                            {r.percentage < 80 && (
                              <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> At Risk
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{r.regNo || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-center">
                            <span className="font-semibold text-gray-900">{r.presentCount}</span> / {r.totalSessions}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              r.percentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {r.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ENROLLMENTS MODAL */}
      {showEnrollmentModal && enrollmentSubject && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Manage Enrollments
                </h3>
                <p className="text-sm text-gray-500 mt-1">{enrollmentSubject.code} - {enrollmentSubject.name}</p>
              </div>
              <button onClick={() => {setShowEnrollmentModal(false); setEnrollmentSubject(null);}} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              {enrollmentsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No enrollments found for this subject.
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg No</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department/Yr</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {enrollments.map((e: any) => (
                        <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{e.profiles?.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{e.profiles?.reg_no}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{e.profiles?.department} (Y{e.profiles?.year_of_study})</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              e.status === 'active' ? 'bg-green-100 text-green-700' :
                              e.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {e.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {e.status !== 'active' && (
                              <button 
                                onClick={() => handleUpdateEnrollmentStatus(e.id, 'active')}
                                className="px-3 py-1 bg-[#8ce0a3]/20 hover:bg-[#8ce0a3]/40 text-green-700 rounded-full text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {e.status !== 'rejected' && (
                              <button 
                                onClick={() => handleUpdateEnrollmentStatus(e.id, 'rejected')}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
