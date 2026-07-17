import { FileText, CreditCard } from 'lucide-react';
import { cn } from '../utils/utils';

const employees = [
  { name: 'Syafanah san', amount: '$2,540.00', time: 'Today', status: 'Waiting', avatar: 'https://i.pravatar.cc/150?u=2' },
  { name: 'Devon Lane', amount: '$2,540.00', time: 'Today', status: 'Done', avatar: 'https://i.pravatar.cc/150?u=3' },
  { name: 'Marvin McKinney', amount: '$2,540.00', time: 'Yesterday', status: 'Done', avatar: 'https://i.pravatar.cc/150?u=4' },
  { name: 'Devon Lane', amount: '$2,540.00', time: 'Yesterday', status: 'Done', avatar: 'https://i.pravatar.cc/150?u=5' },
  { name: 'Eleanor Pena', amount: '$2,540.00', time: 'Yesterday', status: 'Failed', avatar: 'https://i.pravatar.cc/150?u=6' },
];

export function PayoutMonthly() {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-gray-500 font-medium text-sm mb-1">Payout monthly</h3>
        <h2 className="text-xl font-semibold text-gray-900 leading-tight">Salaries and incentive</h2>
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto no-scrollbar pb-6">
        {employees.map((emp, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
              <div>
                <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="font-medium text-gray-700">{emp.amount}</span> {emp.time}
                </div>
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5",
              emp.status === 'Waiting' && "bg-orange-50 text-orange-600 border-orange-100",
              emp.status === 'Done' && "bg-green-50 text-green-600 border-green-100",
              emp.status === 'Failed' && "bg-red-50 text-red-600 border-red-100"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                emp.status === 'Waiting' && "bg-orange-500",
                emp.status === 'Done' && "bg-green-500",
                emp.status === 'Failed' && "bg-red-500"
              )} />
              {emp.status}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <div className="bg-[#406874] rounded-[1.5rem] p-6 text-white shadow-lg relative overflow-hidden">
          {/* Background decorative elements could go here */}
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <span className="text-white/80">Basic salary</span>
              </div>
              <span className="font-medium bg-[#8ce0a3] text-[#406874] px-3 py-1.5 rounded-full">$2,040</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <span className="text-white/80">Perform</span>
              </div>
              <span className="font-medium px-2">$300</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <span className="text-white/80">Gift</span>
              </div>
              <span className="font-medium px-2">$200</span>
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-white/20 pt-5">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-white text-[#406874] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm relative">
                <FileText className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#406874]">2</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-[#8ce0a3] text-[#406874] flex items-center justify-center hover:bg-[#7bc891] transition-colors shadow-sm">
                <CreditCard className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70 mb-1">Take home pay</div>
              <div className="text-3xl font-semibold tracking-tight">$2,540.00</div>
            </div>
          </div>

          {/* Payment 100% overlay */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 -rotate-90 origin-bottom-right">
            <div className="text-white/30 text-xs font-semibold tracking-widest uppercase">
              Payment 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
