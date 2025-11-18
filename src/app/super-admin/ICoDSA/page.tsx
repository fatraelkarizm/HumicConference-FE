// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   PlusIcon,
//   ArrowDownTrayIcon,
//   ArrowUpTrayIcon,
//   CalendarDaysIcon,
// } from "@heroicons/react/24/outline";
// import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
// import ScheduleActionModal from "@/components/schedule/ScheduleActionModal";
// import ScheduleEditModal from "@/components/schedule/ScheduleEditModal";
// import ScheduleAddModal from "@/components/schedule/ScheduleAddModal";
// import scheduleService from "@/services/ScheduleService";
// import type {
//   ProcessedConferenceSchedule,
//   ScheduleItem,
//   NewScheduleData,
// } from "@/types/schedule";

// export default function JadwalIcodsaPage() {
//   const [conferenceData, setConferenceData] =
//     useState<ProcessedConferenceSchedule | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Modal states
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isActionModalOpen, setIsActionModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

//   // Load ICoDSA conference data
//   useEffect(() => {
//     loadConferenceData();
//   }, []);

//   const loadConferenceData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       console.log("🔍 Loading ICoDSA conference data...");
//       const data = await scheduleService.getConferenceSchedule("ICODSA");

//       console.log("📊 ICoDSA Data loaded:", {
//         name: data.name,
//         days: data.days.length,
//         totalSessions: data.days.reduce(
//           (total, day) => total + day.items.length,
//           0
//         ),
//       });

//       setConferenceData(data);
//     } catch (err) {
//       console.error("❌ Error loading ICoDSA data:", err);
//       setError(
//         err instanceof Error ? err.message : "Failed to load conference data"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddSession = () => {
//     setIsAddModalOpen(true);
//   };

//   const handleSaveSession = async (data: NewScheduleData) => {
//     try {
//       console.log("💾 Creating new schedule:", data);
//       const newSchedule = await scheduleService.createSchedule(data);

//       console.log("✅ Schedule created:", newSchedule);

//       // Reload data to get updated schedule
//       await loadConferenceData();

//       alert("Schedule berhasil ditambahkan!");
//     } catch (err) {
//       console.error("❌ Error creating schedule:", err);
//       alert(
//         "Gagal menambahkan schedule: " +
//           (err instanceof Error ? err.message : "Unknown error")
//       );
//     }
//   };

//   const handleOpenDetail = (itemId?: string) => {
//     if (!itemId || !conferenceData) return;

//     // Find item across all days
//     for (const day of conferenceData.days) {
//       const item = day.items.find((item) => item.id === itemId);
//       if (item) {
//         setSelectedItem(item);
//         setIsActionModalOpen(true);
//         break;
//       }
//     }
//   };

//   const handleEdit = (item: ScheduleItem) => {
//     setSelectedItem(item);
//     setIsEditModalOpen(true);
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       console.log("🗑️ Deleting schedule:", id);
//       const success = await scheduleService.deleteSchedule(id);

//       if (success) {
//         console.log("✅ Schedule deleted");
//         await loadConferenceData(); // Reload data
//         alert("Schedule berhasil dihapus!");
//       } else {
//         throw new Error("Delete operation failed");
//       }
//     } catch (err) {
//       console.error("❌ Error deleting schedule:", err);
//       alert(
//         "Gagal menghapus schedule: " +
//           (err instanceof Error ? err.message : "Unknown error")
//       );
//     }
//   };

//   const handleEditSaved = async (updatedItem: ScheduleItem) => {
//     try {
//       console.log("✅ Schedule updated:", updatedItem);
//       await loadConferenceData(); // Reload data
//       alert("Schedule berhasil diperbarui!");
//     } catch (err) {
//       console.error("❌ Error after edit:", err);
//     }
//   };

//   const handleExportData = () => {
//     if (!conferenceData) return;

//     try {
//       const exportData = {
//         conference: conferenceData.name,
//         type: conferenceData.type,
//         startDate: conferenceData.startDate,
//         endDate: conferenceData.endDate,
//         totalDays: conferenceData.days.length,
//         totalSessions: conferenceData.days.reduce(
//           (total, day) => total + day.items.length,
//           0
//         ),
//         days: conferenceData.days.map((day) => ({
//           date: day.date,
//           dayNumber: day.dayNumber,
//           dayTitle: day.dayTitle,
//           sessions: day.items.map((item) => ({
//             id: item.id,
//             title: item.title,
//             timeDisplay: item.timeDisplay,
//             speaker: item.speaker,
//             location: item.location,
//             type: item.type,
//             scheduleType: item.scheduleType,
//           })),
//         })),
//       };

//       const blob = new Blob([JSON.stringify(exportData, null, 2)], {
//         type: "application/json",
//       });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `icodsa-schedule-${
//         new Date().toISOString().split("T")[0]
//       }.json`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);

//       console.log("📁 Data exported successfully");
//     } catch (err) {
//       console.error("❌ Export failed:", err);
//       alert("Gagal export data");
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading ICoDSA schedule...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//         <div className="flex items-center gap-3 mb-4">
//           <span className="text-red-600 text-xl">⚠️</span>
//           <h3 className="text-red-800 font-medium">Error Loading Schedule</h3>
//         </div>
//         <p className="text-red-700 mb-4">{error}</p>
//         <button
//           onClick={loadConferenceData}
//           className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   // No data state
//   if (!conferenceData || conferenceData.days.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-6xl mb-4"></div>
//         <h3 className="text-xl font-medium text-gray-800 mb-2">
//           No ICoDSA Schedule Available
//         </h3>
//         <p className="text-gray-600 mb-6">Start by adding your first session</p>
//         <button
//           onClick={handleAddSession}
//           className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
//         >
//           <PlusIcon className="w-5 h-5" />
//           Tambah Sesi Pertama
//         </button>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//         <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-4">
//           <span
//             className="inline-flex items-center justify-center rounded-md"
//             style={{ backgroundColor: "#FFB84D", padding: 8 }}
//           >
//             <CalendarDaysIcon className="w-5 h-5 text-white" />
//           </span>
//           <div>
//             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 leading-tight">
//               {conferenceData.name || "Jadwal ICoDSA"}
//             </h1>
//             <p className="text-gray-500 mt-1 text-sm">
//               {conferenceData.startDate} - {conferenceData.endDate} (
//               {conferenceData.year})
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleAddSession}
//             className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
//             style={{ backgroundColor: "#10B981" }}
//           >
//             <PlusIcon className="w-5 h-5" />
//             <span>Tambah Sesi Baru</span>
//           </button>

//           <button
//             className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
//             style={{ backgroundColor: "#2563EB" }}
//             disabled
//             title="Import feature coming soon"
//           >
//             <ArrowDownTrayIcon className="w-5 h-5" />
//             <span>Import Data</span>
//           </button>

//           <button
//             onClick={handleExportData}
//             className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
//             style={{ backgroundColor: "#949CA2" }}
//           >
//             <ArrowUpTrayIcon className="w-5 h-5" />
//             <span>Export Data</span>
//           </button>
//         </div>
//       </div>

//       {/* Conference Info */}
//       {conferenceData.description && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//           <p className="text-blue-800">{conferenceData.description}</p>
//           {conferenceData.onsiteLocation && (
//             <p className="text-blue-700 text-sm mt-2">
//              {conferenceData.onsiteLocation}
//             </p>
//           )}
//         </div>
//       )}

//       {/* Schedule Content */}
//       <div className="space-y-8">
//         {conferenceData.days.map((day) => (
//           <div key={day.date} className="space-y-4">
//             {/* Day Header */}
//             <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
//               <h2 className="text-xl font-bold">{day.dayTitle}</h2>
//               <p className="text-blue-100 text-sm">
//                 {day.items.length} session{day.items.length !== 1 ? "s" : ""}{" "}
//                 scheduled
//               </p>
//             </div>

//             {/* Timeline */}
//             {day.items.length > 0 ? (
//               <ScheduleTimeline
//                 schedules={day.items}
//                 onEditSchedule={handleEdit}
//                 onDeleteSchedule={handleDelete}
//               />
//             ) : (
//               <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
//                 <div className="text-gray-400 text-4xl mb-2"></div>
//                 <p className="text-gray-600">
//                   No sessions scheduled for this day
//                 </p>
//                 <button
//                   onClick={handleAddSession}
//                   className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
//                 >
//                   Add First Session
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Summary Footer */}
//       <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//         <h3 className="font-medium text-gray-800 mb-3">Conference Summary</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//           <div>
//             <div className="text-2xl font-bold text-orange-600">
//               {conferenceData.days.length}
//             </div>
//             <div className="text-sm text-gray-600">Days</div>
//           </div>
//           <div>
//             <div className="text-2xl font-bold text-blue-600">
//               {conferenceData.days.reduce(
//                 (total, day) => total + day.items.length,
//                 0
//               )}
//             </div>
//             <div className="text-sm text-gray-600">Total Sessions</div>
//           </div>
//           <div>
//             <div className="text-2xl font-bold text-green-600">
//               {conferenceData.days.reduce(
//                 (total, day) =>
//                   total +
//                   day.items.filter((item) => item.type === "TALK").length,
//                 0
//               )}
//             </div>
//             <div className="text-sm text-gray-600">Talks</div>
//           </div>
//           <div>
//             <div className="text-2xl font-bold text-purple-600">
//               {conferenceData.days.reduce(
//                 (total, day) =>
//                   total +
//                   day.items.filter((item) => item.type === "BREAK").length,
//                 0
//               )}
//             </div>
//             <div className="text-sm text-gray-600">Breaks</div>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       <ScheduleAddModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//         onSave={handleSaveSession}
//         mode="create"
//       />

//       <ScheduleActionModal
//         open={isActionModalOpen}
//         item={selectedItem}
//         onClose={() => {
//           setIsActionModalOpen(false);
//           setSelectedItem(null);
//         }}
//         onDetail={(item) => {
//           console.log("📖 Showing detail for:", item);
//           // You can implement a detail modal here
//         }}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//       />

//       <ScheduleEditModal
//         open={isEditModalOpen}
//         item={selectedItem}
//         onClose={() => {
//           setIsEditModalOpen(false);
//           setSelectedItem(null);
//         }}
//         onSaved={handleEditSaved}
//       />
//     </>
//   );
// }
