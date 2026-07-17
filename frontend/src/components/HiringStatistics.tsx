import { ChevronRight, Video } from 'lucide-react';

const mockBars = [
  { matched: 80, unmet: 20 },
  { matched: 60, unmet: 40 },
  { matched: 90, unmet: 10 },
  { matched: 75, unmet: 25 },
  { matched: 85, unmet: 15 },
  { matched: 50, unmet: 50 },
  { matched: 95, unmet: 5 },
  { matched: 70, unmet: 30 },
  { matched: 80, unmet: 20 },
  { matched: 65, unmet: 35 },
  { matched: 85, unmet: 15 },
  { matched: 90, unmet: 10 },
  { matched: 75, unmet: 25 },
  { matched: 80, unmet: 20 },
  { matched: 50, unmet: 50 },
];

export function HiringStatistics() {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-500 font-medium text-sm">Hiring statistics</h3>
        <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Talent recruitment</h2>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex -space-x-4">
          <img className="w-14 h-14 rounded-2xl border-4 border-white object-cover" src="https://i.pravatar.cc/150?u=12" alt="" />
          <img className="w-14 h-14 rounded-2xl border-4 border-white object-cover" src="https://i.pravatar.cc/150?u=13" alt="" />
        </div>
        <button className="h-14 px-6 rounded-2xl bg-[#406874] text-white flex flex-col items-center justify-center gap-1 hover:bg-[#32525c] transition-colors ml-auto shadow-sm">
          <Video className="w-4 h-4" />
          <span className="text-xs font-medium">Join call</span>
        </button>
      </div>

      <div className="flex justify-between text-xs font-medium text-gray-500 mb-3">
        <span>120 Talent</span>
        <span>80 Talent</span>
      </div>

      <div className="flex-1 min-h-[80px] flex items-end gap-1.5 justify-between">
        {mockBars.map((bar, i) => (
          <div key={i} className="flex flex-col gap-1 w-full h-full justify-end">
            <div 
              className="bg-gray-100 rounded-full w-full"
              style={{ height: `${bar.unmet}%` }}
            />
            <div 
              className="bg-[#8ce0a3] rounded-full w-full"
              style={{ height: `${bar.matched}%` }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#8ce0a3]" />
          <span className="text-gray-500">Matched</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <span className="text-gray-400">Not match</span>
        </div>
      </div>
    </div>
  );
}
