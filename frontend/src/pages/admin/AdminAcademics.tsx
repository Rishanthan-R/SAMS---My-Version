import { useEffect, useState } from 'react';
import { Calendar, BookOpen, Plus, Trash2, Upload, Edit2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { DEPARTMENTS } from '../../lib/constants';

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

  const [semForm, setSemForm] = useState({ label: '', yearOfStudy: 1, semesterNumber: 1, startDate: '', endDate: '', enrollmentDeadline: '', isActive: false, enrollmentOpen: false });
  const [subForm, setSubForm] = useState({ code: '', name: '', departments: [] as string[], credits: 3, yearOfStudy: 1, semester: 1, lecturerId: '' });
  
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [timetableSubject, setTimetableSubject] = useState<any>(null);
  const [timetables, setTimetables] = useState<any[]>([]);

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
      if (editingSemesterId) {
        await apiClient(`/api/admin/semesters/${editingSemesterId}`, {
          method: 'PUT',
          token: session?.access_token,
          body: semForm
        });
      } else {
        await apiClient('/api/admin/semesters', {
          method: 'POST',
          token: session?.access_token,
          body: semForm
        });
      }
      setShowSemesterModal(false);
      setEditingSemesterId(null);
      setSemForm({ label: '', yearOfStudy: 1, semesterNumber: 1, startDate: '', endDate: '', enrollmentDeadline: '', isActive: false, enrollmentOpen: false });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save semester');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubjectId) {
        await apiClient(`/api/admin/subjects/${editingSubjectId}`, {
          method: 'PUT',
          token: session?.access_token,
          body: subForm
        });
      } else {
        await apiClient('/api/admin/subjects', {
          method: 'POST',
          token: session?.access_token,
          body: subForm
        });
      }
      setShowSubjectModal(false);
      setEditingSubjectId(null);
      setSubForm({ code: '', name: '', departments: [], credits: 3, yearOfStudy: 1, semester: 1, lecturerId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save subject');
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    try {
      await apiClient(`/api/admin/subjects/${id}`, {
        method: 'DELETE',
        token: session?.access_token
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject (may have existing sessions)');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const subjectsToCreate = [];

      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length < 2 || !rows[i][0]) continue;
        
        const row = rows[i];
        let subObj: any = {};
        
        headers.forEach((header, index) => {
          const val = row[index]?.trim();
          if (header.includes('code')) subObj.code = val;
          if (header.includes('name')) subObj.name = val;
          if (header.includes('credit')) subObj.credits = val;
          if (header.includes('year')) subObj.yearOfStudy = val;
          if (header.includes('semester')) subObj.semester = val;
        });

        if (subObj.code && subObj.name) {
          subjectsToCreate.push(subObj);
        }
      }

      if (subjectsToCreate.length === 0) {
        alert('No valid subjects found in CSV. Make sure headers include Code and Name.');
        return;
      }

      if (!confirm(`Found ${subjectsToCreate.length} valid subjects. Proceed with bulk import?`)) return;

      setLoading(true);
      const res = await apiClient('/api/admin/subjects/bulk', {
        method: 'POST',
        token: session?.access_token,
        body: { subjects: subjectsToCreate }
      });
      alert(`Import complete! Successful: ${res.successful}, Failed: ${res.failed}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Bulk import failed');
      setLoading(false);
    }
    // clear input
    e.target.value = '';
  };

  const handleOpenTimetable = async (sub: any) => {
    setTimetableSubject(sub);
    setShowTimetableModal(true);
    try {
      const data = await apiClient(`/api/admin/subjects/${sub.id}/timetables`, {
        token: session?.access_token
      });
      setTimetables(data);
    } catch (err) {
      alert('Failed to load timetables');
    }
  };

  const handleSaveTimetables = async () => {
    try {
      await apiClient(`/api/admin/subjects/${timetableSubject.id}/timetables`, {
        method: 'POST',
        token: session?.access_token,
        body: { timetables }
      });
      alert('Timetables saved successfully');
      setShowTimetableModal(false);
    } catch (err) {
      alert('Failed to save timetables');
    }
  };

  const addTimetableSlot = () => {
    setTimetables([...timetables, { day_of_week: 1, start_time: '09:00', end_time: '11:00' }]);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Academics</h1>
          <p className="text-gray-500 mt-1">Manage semesters, subjects, and assignments.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'subjects' && (
            <label className="bg-white text-gray-700 border border-gray-200 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            </label>
          )}
          <button 
            onClick={() => {
              if (activeTab === 'semesters') {
                setEditingSemesterId(null);
                setSemForm({ label: '', yearOfStudy: 1, semesterNumber: 1, startDate: '', endDate: '', enrollmentDeadline: '', isActive: false, enrollmentOpen: false });
                setShowSemesterModal(true);
              } else {
                setEditingSubjectId(null);
                setSubForm({ code: '', name: '', departments: [], credits: 3, yearOfStudy: 1, semester: 1, lecturerId: '' });
                setShowSubjectModal(true);
              }
            }}
            className="bg-[#164478] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#0f3057] transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create {activeTab === 'semesters' ? 'Semester' : 'Subject'}
          </button>
        </div>
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
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-semibold text-[#164478]">{sem.label}</h3>
                    <button 
                      onClick={() => {
                        setEditingSemesterId(sem.id);
                        setSemForm({
                          label: sem.label,
                          yearOfStudy: sem.year_of_study,
                          semesterNumber: sem.semester_number,
                          startDate: sem.start_date,
                          endDate: sem.end_date,
                          enrollmentDeadline: sem.enrollment_deadline,
                          isActive: sem.is_active,
                          enrollmentOpen: sem.enrollment_open
                        });
                        setShowSemesterModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#2566ec] hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit Semester"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
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
                    <div className="flex justify-between">
                      <span>Self-Enrollment:</span>
                      <span className={`font-medium ${sem.enrollment_open ? 'text-green-600' : 'text-gray-400'}`}>
                        {sem.enrollment_open ? 'Open' : 'Closed'}
                      </span>
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
                    <th className="px-4 py-4 font-medium">Lecturer</th>
                    <th className="px-4 py-4 font-medium">Departments</th>
                    <th className="px-4 py-4 font-medium">Credits</th>
                    <th className="px-4 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-[#164478]">{sub.code}</td>
                      <td className="px-4 py-4 text-gray-900">{sub.name}</td>
                      <td className="px-4 py-4">
                        {sub.lecturer ? (
                          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {sub.lecturer}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{sub.departments?.join(', ') || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{sub.credits}</td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => {
                            setEditingSubjectId(sub.id);
                            setSubForm({
                              code: sub.code,
                              name: sub.name,
                              departments: sub.departments || [],
                              credits: sub.credits,
                              yearOfStudy: sub.year_of_study,
                              semester: sub.semester,
                              lecturerId: sub.lecturer_id || ''
                            });
                            setShowSubjectModal(true);
                          }}
                          title="Edit Subject"
                          className="p-2 text-gray-400 hover:text-[#2566ec] hover:bg-blue-50 rounded-full transition-colors inline-flex items-center justify-center mr-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenTimetable(sub)}
                          title="Manage Timetable"
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors inline-flex items-center justify-center mr-1"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(sub.id, sub.code)}
                          title="Delete Subject"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <h3 className="text-xl font-semibold text-gray-900">{editingSemesterId ? 'Edit' : 'Create'} Semester</h3>
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
                  <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={semForm.yearOfStudy} onChange={e => setSemForm({...semForm, yearOfStudy: parseInt(e.target.value)})}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester Number</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={semForm.semesterNumber} onChange={e => setSemForm({...semForm, semesterNumber: parseInt(e.target.value)})}>
                    {[1,2].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
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
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={semForm.isActive} onChange={e => setSemForm({...semForm, isActive: e.target.checked})} className="w-4 h-4 text-[#2566ec]" />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Semester</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="enrollmentOpen" checked={semForm.enrollmentOpen} onChange={e => setSemForm({...semForm, enrollmentOpen: e.target.checked})} className="w-4 h-4 text-[#2566ec]" />
                  <label htmlFor="enrollmentOpen" className="text-sm font-medium text-gray-700">Open Self-Enrollment</label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSemesterModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-full">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#2566ec] text-white rounded-full hover:bg-[#164478]">{editingSemesterId ? 'Save Changes' : 'Create Semester'}</button>
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
              <h3 className="text-xl font-semibold text-gray-900">{editingSubjectId ? 'Edit' : 'Create'} Subject</h3>
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
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {DEPARTMENTS.map(d => (
                    <label key={d} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={subForm.departments.includes(d)}
                        onChange={e => {
                          const checked = e.target.checked;
                          if (checked) {
                            setSubForm({...subForm, departments: [...subForm.departments, d]});
                          } else {
                            setSubForm({...subForm, departments: subForm.departments.filter(dept => dept !== d)});
                          }
                        }}
                        className="w-4 h-4 text-[#2566ec] rounded border-gray-300 focus:ring-[#2566ec]"
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={subForm.yearOfStudy} onChange={e => setSubForm({...subForm, yearOfStudy: parseInt(e.target.value)})}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Semester</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={subForm.semester} onChange={e => setSubForm({...subForm, semester: parseInt(e.target.value)})}>
                    {[1,2].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
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
                <button type="submit" className="px-6 py-2.5 bg-[#2566ec] text-white rounded-full hover:bg-[#164478]">{editingSubjectId ? 'Save Changes' : 'Create Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMETABLE MODAL */}
      {showTimetableModal && timetableSubject && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Manage Timetable</h3>
                <p className="text-sm text-gray-500">{timetableSubject.code} - {timetableSubject.name}</p>
              </div>
              <button onClick={() => setShowTimetableModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              {timetables.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No timetable slots added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {timetables.map((slot, index) => (
                    <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <select 
                        value={slot.day_of_week}
                        onChange={(e) => {
                          const newTimetables = [...timetables];
                          newTimetables[index].day_of_week = parseInt(e.target.value);
                          setTimetables(newTimetables);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#2566ec]"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={7}>Sunday</option>
                      </select>
                      <input 
                        type="time"
                        value={slot.start_time.substring(0,5)}
                        onChange={(e) => {
                          const newTimetables = [...timetables];
                          newTimetables[index].start_time = e.target.value;
                          setTimetables(newTimetables);
                        }}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#2566ec]"
                      />
                      <span className="text-gray-400">to</span>
                      <input 
                        type="time"
                        value={slot.end_time.substring(0,5)}
                        onChange={(e) => {
                          const newTimetables = [...timetables];
                          newTimetables[index].end_time = e.target.value;
                          setTimetables(newTimetables);
                        }}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#2566ec]"
                      />
                      <button 
                        onClick={() => {
                          const newTimetables = timetables.filter((_, i) => i !== index);
                          setTimetables(newTimetables);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={addTimetableSlot}
                className="mt-6 w-full py-3 border-2 border-dashed border-[#2566ec]/30 text-[#2566ec] font-medium rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Slot
              </button>
            </div>
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowTimetableModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">Cancel</button>
              <button onClick={handleSaveTimetables} className="px-6 py-2.5 bg-[#2566ec] text-white rounded-full hover:bg-[#164478] transition-colors">Save Timetable</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
