// "use client";

// import React, { useEffect, useState } from "react";
// import { CalendarDaysIcon } from "@heroicons/react/24/outline";
// import ScheduleCard from "@/components/schedule/ScheduleCard";
// import type { ScheduleItem } from "@/types/schedule";
// import { getSchedules } from "@/services/ScheduleService";

// export default function ICICyTAPage() {
//   const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       // fetch only ICICyTA schedules
//       const all = await getSchedules("ICICyTA");
//       setSchedules(all);
//       setLoading(false);
//     })();
//   }, []);

//   // Group schedules by dayNumber
//   const byDay: Record<string, ScheduleItem[]> = {};
//   schedules.forEach((s) => {
//     const day = s.dayNumber !== undefined && s.dayNumber !== null ? Number(s.dayNumber) : 1;
//     const key = `day-${day}`;
//     (byDay[key] = byDay[key] || []).push(s);
//   });

//   const dayKeys = Object.keys(byDay).sort((a, b) => {
//     const na = Number(a.split("-")[1] || 1);
//     const nb = Number(b.split("-")[1] || 1);
//     return na - nb;
//   });

//   return (
//     // make the page background white and ensure text is black (public view)
//     <div className="bg-white min-h-screen text-black px-6 lg:px-12 py-8">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-4">
//           <span className="inline-flex items-center justify-center rounded-md bg-[#FFB84D] p-2">
//             <CalendarDaysIcon className="w-5 h-5 text-white" />
//           </span>
//           <div>
//             <h1 className="text-2xl font-semibold text-black">Schedule ICICyTA</h1>
//             <p className="text-sm text-gray-600">Public schedule — read only</p>
//           </div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-gray-600">Loading schedules…</div>
//       ) : dayKeys.length === 0 ? (
//         <div className="text-gray-600">No schedules available yet.</div>
//       ) : (
//         <div className="space-y-10">
//           {dayKeys.map((dayKey) => {
//             const items = byDay[dayKey];
//             const dayNumber = Number(dayKey.split("-")[1] || 1);
//             const first = items[0];
//             const headerTitle = first?.dayTitle ?? `Day ${dayNumber}`;

//             // group items by time
//             const byTime: Record<string, ScheduleItem[]> = {};
//             items.forEach((s) => {
//               const k = s.timeDisplay || s.date || "TBD";
//               (byTime[k] = byTime[k] || []).push(s);
//             });

//             const timeKeys = Object.keys(byTime);

//             return (
//               <section key={dayKey}>
//                 <div className="mb-4 rounded-md p-3 bg-[#CAF2D7]">
//                   <div className="text-sm font-semibold text-[#064e3b]">{headerTitle}</div>
//                 </div>

//                 <div className="space-y-6">
//                   {timeKeys.map((timeKey) => {
//                     const rowItems = byTime[timeKey];
//                     return (
//                       <div key={timeKey} className="grid grid-cols-[160px_1fr] items-stretch gap-6">
//                         <div className="h-full">
//                           <div className="h-full rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg shadow-sm px-4">
//                             {timeKey}
//                           </div>
//                         </div>

//                         <div className="h-full">
//                           <div className="h-full rounded-lg p-3">
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                               {rowItems.map((s) => (
//                                 <div key={s.id} className="h-full">
//                                   {/* Do NOT pass onOpenDetail for public view -> card is not clickable */}
//                                   <ScheduleCard item={s} className="h-full" />
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </section>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }