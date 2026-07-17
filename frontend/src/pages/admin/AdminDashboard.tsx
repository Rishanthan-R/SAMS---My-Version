import { Users, GraduationCap, BookOpen, CalendarDays } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const summaryCards = [
  { title: 'Total Students', value: '—', icon: <GraduationCap className="w-5 h-5" />, color: '#8ce0a3' },
  { title: 'Total Lecturers', value: '—', icon: <Users className="w-5 h-5" />, color: '#406874' },
  { title: 'Active Subjects', value: '—', icon: <BookOpen className="w-5 h-5" />, color: '#8ce0a3' },
  { title: 'Current Semester', value: '—', icon: <CalendarDays className="w-5 h-5" />, color: '#406874' },
];

export function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Good morning, {profile?.full_name?.split(' ')[0] || 'Admin'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's an overview of the system</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
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

      {/* Placeholder for future content */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 text-center">
        <p className="text-gray-400 text-sm">Dashboard charts and activity will appear here in Phase 1</p>
      </div>
    </div>
  );
}
