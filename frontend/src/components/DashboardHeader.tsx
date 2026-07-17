import { Plus, Calendar, FileText } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center text-sm text-gray-500 mb-2 font-medium">
          <span>Portal</span>
          <span className="mx-2 text-gray-300">›</span>
          <span className="text-gray-900">Dashboard</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Good morning Jhon</h1>
      </div>
      
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Add widget
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors whitespace-nowrap">
          <Calendar className="w-4 h-4" />
          18 - 22 November
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#8ce0a3] hover:bg-[#7bc891] text-white text-sm font-medium rounded-full shadow-sm transition-colors whitespace-nowrap">
          <FileText className="w-4 h-4" />
          Add report
        </button>
      </div>
    </div>
  );
}
