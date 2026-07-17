import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';

const data = [
  { name: 'Designer', value: 48, color: '#8ce0a3' },
  { name: 'Developer', value: 27, color: '#3b6978' },
  { name: 'Project manager', value: 18, color: '#e5e7eb' },
];

export function TrackTeam() {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-500 font-medium text-sm">Total employee</h3>
        <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Track your team</h2>
      
      <div className="relative h-[140px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
          <div className="text-4xl font-semibold text-gray-900 tracking-tight">120</div>
          <div className="text-xs text-gray-400 font-medium">Total members</div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-500">{item.name}</span>
            </div>
            <span className="text-gray-900">{item.value} members</span>
          </div>
        ))}
      </div>
    </div>
  );
}
