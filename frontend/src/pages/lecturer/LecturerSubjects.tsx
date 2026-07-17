import { useEffect, useState } from 'react';
import { BookOpen, Users, LayoutGrid } from 'lucide-react';
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

              <div className="pt-5 border-t border-gray-100 flex gap-3">
                <Link
                  to={`/lecturer/generate-otp?subject=${subject.id}`}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-[#8ce0a3] hover:text-white text-gray-700 text-sm font-medium rounded-xl text-center transition-colors"
                >
                  Start Session
                </Link>
                <Link
                  to={`/lecturer/attendance?subject=${subject.id}`}
                  className="w-12 h-[42px] bg-gray-50 hover:bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Users className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
