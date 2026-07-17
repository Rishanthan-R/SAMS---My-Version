import { useEffect, useState } from 'react';
import { Plus, User, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  reg_no?: string;
  staff_id?: string;
  department?: string;
  is_active: boolean;
}

export function AdminUsers() {
  const { session } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'student' | 'lecturer'>('student');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    department: '',
    regNo: '',
    staffId: '',
    yearOfStudy: '1',
    semester: '1'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/api/admin/users?role=${activeTab}`, {
        token: session?.access_token
      });
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) fetchUsers();
  }, [session, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/api/admin/users', {
        method: 'POST',
        token: session?.access_token,
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setFormData({ fullName: '', email: '', role: 'student', department: '', regNo: '', staffId: '', yearOfStudy: '1', semester: '1' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system accounts and roles.</p>
        </div>
        <button 
          onClick={() => { setFormData({ ...formData, role: activeTab }); setShowModal(true); }}
          className="bg-[#2566ec] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#164478] transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'student' ? 'Student' : 'Lecturer'}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('student')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'student' ? 'bg-[#164478] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab('lecturer')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'lecturer' ? 'bg-[#164478] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Lecturers
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#2566ec] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm font-medium bg-gray-50/50">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Identifier</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No {activeTab}s found.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#164478]/10 text-[#164478] rounded-full flex items-center justify-center font-bold text-sm">
                            {user.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.full_name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.role === 'student' ? user.reg_no : user.staff_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Add New {activeTab === 'student' ? 'Student' : 'Lecturer'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="bg-blue-50 text-[#164478] p-3 rounded-xl text-sm flex items-start gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>User will be created in Supabase Auth with default password <strong>Password123!</strong></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {activeTab === 'student' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reg No</label>
                      <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                      <input required type="number" min="1" max="4" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={formData.yearOfStudy} onChange={e => setFormData({...formData, yearOfStudy: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                      <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2566ec]/50" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#2566ec] text-white font-medium rounded-full shadow-md hover:bg-[#164478] transition-colors">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
