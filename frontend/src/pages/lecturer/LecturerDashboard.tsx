import { BookOpen, ClipboardCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const summaryCards = [
  { title: 'My Subjects', value: '—', icon: <BookOpen className="w-5 h-5" />, color: '#8ce0a3' },
  { title: 'Sessions Conducted', value: '—', icon: <ClipboardCheck className="w-5 h-5" />, color: '#406874' },
  { title: 'Active OTP', value: 'None', icon: <KeyRound className="w-5 h-5" />, color: '#8ce0a3' },
];

export function LecturerDashboard() {
  const { profile } = useAuth();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Good morning, {profile?.full_name?.split(' ')[0] || 'Lecturer'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your subjects and sessions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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

      {/* Placeholder */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 text-center">
        <p className="text-gray-400 text-sm">Recent sessions and OTP history will appear here in Phase 2</p>
      </div>
    </div>
  );
}
