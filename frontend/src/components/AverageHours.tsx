import { ArrowUpRight, Hourglass, Users, Globe } from 'lucide-react';
import { cn } from '../utils/utils';

// Mock data for the dot chart (columns of dots)
const dotData = [
  4, 5, 3, 4, 6, 4, 5, 7, 5, 4, 3, 4, 5, 6, 8, 5, 4, 3, 2, 4, 5, 4, 3
];
const MAX_DOTS = 8;

export function AverageHours() {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col md:flex-row gap-8">
      {/* Left side: Chart */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-[#406874] rounded-2xl flex items-center justify-center text-white shadow-sm">
            <Hourglass className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-semibold text-gray-900 tracking-tight">46,5</span>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-semibold">
              +0.5%
            </div>
          </div>
        </div>
        <div className="text-gray-400 text-sm font-medium mb-6">avg hours / weeks</div>
        
        {/* Dot Chart Area */}
        <div className="flex-1 flex flex-col justify-end min-h-[120px] mb-4">
          <div className="flex items-end justify-between h-full gap-1">
            {dotData.map((count, i) => (
              <div key={i} className="flex flex-col gap-1.5 justify-end h-full">
                {Array.from({ length: MAX_DOTS }).map((_, j) => {
                  const isFilled = MAX_DOTS - j <= count;
                  return (
                    <div 
                      key={j} 
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-colors",
                        isFilled ? (i > 15 ? "bg-[#3b6978]" : "bg-[#406874]") : "bg-transparent"
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900">2 Hours</span>
          </div>
          <div className="flex items-center gap-1">
             <div className="w-3 h-3 rounded bg-gray-300"></div>
             <div className="w-3 h-3 rounded bg-[#81b2c4]"></div>
             <div className="w-3 h-3 rounded bg-[#406874]"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900">10 Hours</span>
          </div>
        </div>
      </div>

      {/* Right side: Stats Cards */}
      <div className="w-full md:w-48 flex flex-col gap-4">
        <div className="bg-[#406874] rounded-[1.5rem] p-5 text-white flex flex-col justify-between h-full shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-white bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
              +2.6% <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">80%</span>
            <span className="text-sm text-white/80 font-medium max-w-[60px] leading-tight">Onsite team</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-[1.5rem] p-5 flex flex-col justify-between h-full shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded-full bg-[#406874] flex items-center justify-center text-white">
              <Globe className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
              +2.6% <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-gray-900 tracking-tight">20%</span>
            <span className="text-sm text-gray-500 font-medium max-w-[60px] leading-tight">Remote team</span>
          </div>
        </div>
      </div>
    </div>
  );
}
