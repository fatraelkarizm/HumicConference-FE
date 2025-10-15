// src/components/dashboard/TimelineRow.tsx
const TimelineRow = ({ time, children }: { time: string; children: React.ReactNode }) => (
  <div className="flex gap-4 lg:gap-6">
    <div className="hidden lg:flex w-[140px] rounded-lg bg-white shadow-sm items-center justify-center flex-shrink-0">
      <span className="text-gray-700 font-poppins text-lg font-medium">{time}</span>
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

export default TimelineRow;