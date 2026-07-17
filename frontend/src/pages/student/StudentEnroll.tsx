import { useEffect, useState } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import toast from 'react-hot-toast';

interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  lecturerName: string;
}

export function StudentEnroll() {
  const { session } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      const data = await apiClient('/api/student/subjects/available', {
        token: session?.access_token
      });
      setSubjects(data);
    } catch (err: any) {
      toast.error('Failed to load available subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) fetchSubjects();
  }, [session]);

  const handleEnroll = async (subjectId: string) => {
    setEnrollingId(subjectId);
    try {
      await apiClient('/api/student/enroll', {
        method: 'POST',
        body: { subjectId },
        token: session?.access_token
      });
      toast.success('Successfully enrolled in subject!');
      // Remove from list
      setSubjects(subjects.filter(s => s.id !== subjectId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Enroll in Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and enroll in subjects for the current semester</p>
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#8ce0a3]/30 focus:border-[#8ce0a3] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-50 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subjects Available</h3>
          <p className="text-sm text-gray-500">You are either enrolled in all available subjects or no subjects are active for this semester.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#8ce0a3]/10 text-[#8ce0a3] rounded-xl flex items-center justify-center font-bold text-lg">
                    {subject.code}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                  {subject.credits} Credits
                </span>
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">{subject.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  By {subject.lecturerName}
                </p>
              </div>

              <button
                onClick={() => handleEnroll(subject.id)}
                disabled={enrollingId === subject.id}
                className="w-full py-3 bg-[#406874] hover:bg-[#32525c] disabled:bg-gray-300 text-white text-sm font-medium rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {enrollingId === subject.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Enroll Now
                  </>
                )}
              </button>
            </div>
          ))}
          {filteredSubjects.length === 0 && search && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No subjects found matching "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
