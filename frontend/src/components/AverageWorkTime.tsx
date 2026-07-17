import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, ReferenceArea } from 'recharts';
import { ArrowUpRight, Info } from 'lucide-react';

const data = [
  { time: '4 H', value: 46 },
  { time: '6 H', value: 50 },
  { time: '8 H', value: 65, isHighlight: true },
  { time: '10 H', value: 55 },
  { time: '12 H', value: 45 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.isHighlight) {
       return (
        <div className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
          {data.time.replace(' ', '')}ours
        </div>
      );
    }
  }
  return null;
};

export function AverageWorkTime() {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm flex flex-col h-full border border-gray-50">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-500 font-medium text-sm">Average work time</h3>
      </div>
      
      <div className="flex justify-between items-end mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold text-gray-900 tracking-tight">46</span>
          <span className="text-xl text-gray-900 font-medium">hours</span>
        </div>
        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold">
          +0.5%
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
      
      <div className="flex-grow min-h-[120px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8ce0a3" 
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isHighlight) {
                  return (
                    <circle cx={cx} cy={cy} r={4} fill="#000" stroke="#fff" strokeWidth={2} />
                  );
                }
                return <circle cx={cx} cy={cy} r={0} />;
              }}
              activeDot={{ r: 6, fill: "#000", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4" />
        <span>Total work hours include extra hours</span>
      </div>
    </div>
  );
}
