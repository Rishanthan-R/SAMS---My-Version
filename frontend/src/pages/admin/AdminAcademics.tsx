import { useEffect, useState } from 'react';
import { Calendar, BookOpen, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';

export function AdminAcademics() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'semesters' | 'subjects'>('semesters');
  
  // Data State
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Form State
  const [semForm, setSemForm] = useState({ label: '', yearOfStudy: 1, semesterNumber: 1, startDate: '', endDate: '', enrollmentDeadline: '', isActive: false });
  const [subForm, setSubForm] = useState({ code: '', name: '', credits: 3, yearOfStudy: 1, semester: 1, lecturerId: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [semRes, subRes, lecRes] = await Promise.all([
        apiClient('/api/admin/semesters', { token: session?.access_token }),
        apiClient('/api/admin/subjects', { token: session?.access_token }),
        apiClient('/api/admin/lecturers/list', { token: session?.access_token })
      ]);
      setSemesters(semRes);
      setSubjects(subRes);
      setLecturers(lecRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) fetchData();
  }, [session]);

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/api/admin/semesters', {
        method: 'POST',
        token: session?.access_token,
        body: JSON.stringify(semForm)
      });
      setShowSemesterModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create semester');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/api/admin/subjects', {
        method: 'POST',
        token: session?.access_token,
        body: JSON.stringify(subForm)
      });
      setShowSubjectModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create subject');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Academics</h1>
          <p className="text-gray-500 mt-1">Manage semesters, subjects, and assignments.</p>
        </div>
        <button 
          onClick={() => activeTab === 'semesters' ? setShowSemesterModal(true) : setShowSubjectModal(true)}
          className="bg-[#2566ec] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#164478] transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create {activeTab === 'semesters' ? 'Semester' : 'Subject'}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('semesters')}
          className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'semesters' ? 'bg-[#164478] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4" /> Semesters
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'subjects' ? 'bg-[#164478] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Subjects
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#2566ec] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden p-6">
          
          {activeTab === 'semesters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {semesters.map(sem => (
                <div key={sem.id} className="border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                  {sem.is_active && (
                    <div className="absolute top-0 right-0 bg-[#8ce0a3]/20 text-green-700 text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Active
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-[#164478] mb-1">{sem.label}</h3>
                  <p className="text-gray-500 text-sm mb-4">Year {sem.year_of_study} • Semester {sem.semester_number}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span className="font-medium">{new Date(sem.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span className="font-medium">{new Date(sem.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enrollment Closes:</span>
                      <span className="font-medium">{new Date(sem.enrollment_deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-sm font-medium">
                    <th className="px-4 py-4">Code</th>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Credits</th>
                    <th className="px-4 py-4">Assigned Lecturer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-[#164478]">{sub.code}</td>
                      <td className="px-4 py-4 text-gray-900">{sub.name}</td>
                      <td className="px-4 py-4 text-gray-600">{sub.credits}</td>
                      <td className="px-4 py-4">
                        {sub.lecturer ? (
                          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {sub.lecturer}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SEMESTER MODAL */}
      {showSemesterModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Create Semester</h3>
              <button onClick={() => setShowSemesterModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreateSemester} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g. Fall 2026)</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={semForm.label} onChange={e => setSemForm({...semForm, label: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                  <input required type="number" min="1" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={semForm.yearOfStudy} onChange={e => setSemForm({...semForm, yearOfStudy: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester Number</label>
                  <input required type="number" min="1" max="2" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={semForm.semesterNumber} onChange={e => setSemForm({...semForm, semesterNumber: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input required type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={semForm.startDate} onChange={e => setSemForm({...semForm, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input required type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={semForm.endDate} onChange={e => setSemForm({...semForm, endDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Deadline</label>
                <input required type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={semForm.enrollmentDeadline} onChange={e => setSemForm({...semForm, enrollmentDeadline: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isActive" checked={semForm.isActive} onChange={e => setSemForm({...semForm, isActive: e.target.checked})} className="w-4 h-4 text-[#2566ec]" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Set as Active Semester</label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSemesterModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-full">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#2566ec] text-white rounded-full hover:bg-[#164478]">Create Semester</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Create Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <input required type="text" placeholder="e.g. CS101" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={subForm.code} onChange={e => setSubForm({...subForm, code: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input required type="number" min="1" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={subForm.credits} onChange={e => setSubForm({...subForm, credits: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                  <input required type="number" min="1" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={subForm.yearOfStudy} onChange={e => setSubForm({...subForm, yearOfStudy: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Semester</label>
                  <input required type="number" min="1" max="2" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={subForm.semester} onChange={e => setSubForm({...subForm, semester: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Lecturer (Optional)</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={subForm.lecturerId} onChange={e => setSubForm({...subForm, lecturerId: e.target.value})}>
                  <option value="">-- Select a Lecturer --</option>
                  {lecturers.map(lec => (
                    <option key={lec.id} value={lec.id}>{lec.full_name} ({lec.staff_id})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-full">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#2566ec] text-white rounded-full hover:bg-[#164478]">Create Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
