import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { format, parseISO } from 'date-fns';

interface AttendanceRecord {
  id: string;
  status: string;
  date: string;
  subjectCode: string;
  subjectName: string;
  markedAt: string;
}

export function StudentMyAttendance() {
  const { session } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient('/api/student/attendance', {
          token: session?.access_token
        });
        setRecords(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.access_token) fetchHistory();
  }, [session]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.subjectCode.toLowerCase().includes(search.toLowerCase()) || 
                          record.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || record.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Attendance History</h1>
          <p className="text-sm text-gray-500 mt-1">View your past attendance records</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="flex bg-gray-100 p-1 rounded-full w-full sm:w-auto">
          {['all', 'present', 'absent'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                filter === f 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#8ce0a3]/30 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
            <p className="text-sm text-gray-500">You don't have any attendance records matching these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Session Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Time Marked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{record.subjectName}</p>
                      <p className="text-xs text-gray-500">{record.subjectCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{format(parseISO(record.date), 'MMMM d, yyyy')}</p>
                    </td>
                    <td className="px-6 py-4">
                      {record.status === 'present' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#8ce0a3]/20 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <XCircle className="w-3.5 h-3.5" />
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {format(parseISO(record.markedAt), 'h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
