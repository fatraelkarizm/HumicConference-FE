"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { useConferenceSchedule } from "@/hooks/useConferenceSchedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import ConferenceYearTabs from "@/components/admin/conference/ConferenceYearTabs";
import ConferenceContent from "@/components/admin/conference/ConferenceContent";
import CreateConferenceModal from "@/components/admin/CreateConferenceModal";
import { useConferenceDataICODSA } from "@/hooks/useConferenceDataICODSA";
import type { BackendConferenceSchedule } from "@/types";

export default function ICODSASuperAdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Base conferences hook
  const {
    conferences,
    loading: confLoading,
    error: confError,
    refetch: refetchConferences,
  } = useConferenceSchedule();

  // Get ICODSA conferences and selected conference
  const {
    icodsaConferences,
    availableYears,
    selectedConference
  } = useConferenceDataICODSA(conferences, selectedYear);

  // Auto-select most recent year
  useEffect(() => {
    if (availableYears.length > 0 && ! selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const handleModalClose = () => {
    setActiveModal(null);
  };

  // Check authentication and role
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Unauthorized</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (confLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (confError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Conferences
          </h2>
          <p className="text-gray-600">Failed to load conference data. </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* No conferences state */}
      {availableYears.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No ICODSA Conferences Found
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first ICODSA conference to get started.
            </p>
            <Button
              onClick={() => setActiveModal("create-conference")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create ICODSA Conference
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-full mx-auto px-6">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900">
                    {selectedConference?.name || "ICODSA Conference"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedConference ?  (
                      <>
                        {new Date(selectedConference.start_date).toLocaleDateString()} -{" "}
                        {new Date(selectedConference.end_date).toLocaleDateString()}
                      </>
                    ) : (
                      "No conference data available for this year"
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    ICODSA {selectedYear}
                  </Badge>

                  {/* ✅ Simple Action Buttons - No Delete */}
                  <div className="flex items-center space-x-2">
                    {/* No buttons needed */}
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Conference Year Series */}
      <ConferenceYearTabs
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearSelect={setSelectedYear}
        onCreateNew={() => setActiveModal("create-conference")}
        conferenceType="ICODSA"
      />          {/* Main Content */}
          <div className="max-w-full mx-auto py-8">
            {! selectedConference ? (
              // Empty State
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    No ICODSA Conference for {selectedYear}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Create a new ICODSA conference for {selectedYear} to get started.
                  </p>
                  <Button
                    onClick={() => setActiveModal("create-conference")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create {selectedYear} ICODSA Conference
                  </Button>
                </div>
              </div>
            ) : (
              // Conference Content with Tabs
              <ConferenceContent
                conference={selectedConference}
                onModalOpen={setActiveModal}
                onRefresh={refetchConferences}
              />
            )}
          </div>
        </>
      )}

      {/* Create Conference Modal */}
      {activeModal === "create-conference" && (
        <CreateConferenceModal
          isOpen={true}
          onClose={handleModalClose}
          onSuccess={() => {
            setActiveModal(null);
            // Don't refetch immediately due to potential token issues
            // User can refresh manually or navigate
            toast.success("ICODSA Conference created successfully! Please refresh the page to see it.");
          }}
          conferenceType="ICODSA"
        />
      )}
    </div>
  );
}
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
