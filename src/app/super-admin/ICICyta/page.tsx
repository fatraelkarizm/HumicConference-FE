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
import { useConferenceData } from "@/hooks/useConferenceData";
import type { BackendConferenceSchedule } from "@/types";

export default function ICICyTASuperAdminPage() {
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

  // Get ICICYTA conferences and selected conference
  const {
    icicytaConferences,
    availableYears,
    selectedConference
  } = useConferenceData(conferences, selectedYear);

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

  // No conferences state
  if (availableYears.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No ICICyTA Conferences Found
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first ICICyTA conference to get started.
          </p>
          <Button
            onClick={() => setActiveModal("create-conference")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create ICICyTA Conference
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                {selectedConference?.name || "ICICyTA Conference"}
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
                ICICyTA {selectedYear}
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
        conferenceType="ICICYTA"
      />

      {/* Main Content */}
      <div className="max-w-full mx-auto py-8">
        {! selectedConference ? (
          // Empty State
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No ICICyTA Conference for {selectedYear}
              </h2>
              <p className="text-gray-600 mb-6">
                Create a new ICICyTA conference for {selectedYear} to get started.
              </p>
              <Button
                onClick={() => setActiveModal("create-conference")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {selectedYear} ICICyTA Conference
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

      {/* Create Conference Modal */}
      {activeModal === "create-conference" && (
        <CreateConferenceModal
          isOpen={true}
          onClose={handleModalClose}
          onSuccess={() => {
            setActiveModal(null);
            refetchConferences();
            toast.success("ICICyTA Conference created successfully!");
          }}
          conferenceType="ICICYTA"
        />
      )}
    </div>
  );
}

//   async function handleDelete(id?: string) {
//     if (!id) return;
//     await deleteSchedule(id);
//     setSchedules((prev) => prev.filter((s) => s.id !== id));
//   }

//   function openDetail(id?: string) {
//     const item = schedules.find((s) => s.id === id) ?? null;
//     setActiveItem(item);
//     setDetailOpen(true);
//   }

//   function openEditFromDetail(item: ScheduleItem) {
//     setActiveItem(item);
//     setDetailOpen(false);
//     // open ScheduleModal in edit mode
//     setTimeout(() => {
//       setEditMode(true);
//       setIsModalOpen(true);
//     }, 50);
//   }

//   function handleSavedUpdate(updated: ScheduleItem) {
//     setSchedules((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
//   }

//   // grouping by dayNumber
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
//     <>
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//         <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-4">
//           <span className="inline-flex items-center justify-center rounded-md" style={{ backgroundColor: "#FFB84D", padding: 8 }}>
//             <CalendarDaysIcon className="w-5 h-5 text-white" />
//           </span>
//           <div>
//             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-black leading-tight">Jadwal ICICyta</h1>
//             <p className="text-black mt-1 text-sm">Lorem ipsum</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 ml-auto">
//           <button onClick={() => { setEditMode(false); setIsModalOpen(true); }} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#10B981" }}>
//             <PlusIcon className="w-5 h-5" />
//             <span>Tambah Schedule Baru</span>
//           </button>
//           <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#2563EB" }}>
//             <ArrowDownTrayIcon className="w-5 h-5" />
//             <span>Import Data</span>
//           </button>
//           <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#949CA2" }}>
//             <ArrowUpTrayIcon className="w-5 h-5" />
//             <span>Export Data</span>
//           </button>
//         </div>
//       </div>

//       <div className="space-y-8">
//         {dayKeys.length === 0 && !loading && <div className="text-gray-500">No schedules yet — try adding one.</div>}

//         {dayKeys.map((dayKey) => {
//           const items = byDay[dayKey];
//           const dayNumber = Number(dayKey.split("-")[1] || 1);
//           const first = items[0];
//           const headerTitle = first?.dayTitle ?? `Day ${dayNumber}`;

//           // group items by time
//           const byTime: Record<string, ScheduleItem[]> = {};
//           items.forEach((s) => {
//             const k = s.timeDisplay || s.date || "TBD";
//             (byTime[k] = byTime[k] || []).push(s);
//           });

//           const timeKeys = Object.keys(byTime);

//           return (
//             <section key={dayKey}>
//               <div className="mb-4 rounded-md p-3 bg-[#CAF2D7]">
//                 <div className="text-sm font-semibold text-[#064e3b]">{headerTitle}</div>
//               </div>

//               <div className="space-y-6">
//                 {timeKeys.map((timeKey) => {
//                   const rowItems = byTime[timeKey];
//                   return (
//                     <div key={timeKey} className="grid grid-cols-[160px_1fr] items-stretch gap-6">
//                       <div className="h-full">
//                         <div className="h-full rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg shadow-sm px-4">
//                           {timeKey}
//                         </div>
//                       </div>

//                       <div className="h-full">
//                         <div className="h-full rounded-lg p-3">
//                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {rowItems.map((s) => (
//                               <div key={s.id} className="h-full">
//                                 <ScheduleCard item={s} onOpenDetail={openDetail} className="h-full" />
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </section>
//           );
//         })}
//       </div>

//       {/* Create/Edit modal uses same UI (mode controlled by editMode + activeItem) */}
//       <ScheduleModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setActiveItem(null);
//           setEditMode(false);
//         }}
//         initialData={editMode ? activeItem ?? null : null}
//         mode={editMode ? "edit" : "create"}
//         onSave={async (payload, id) => {
//           await handleSave(payload, id);
//           // after save ensure we reload (or we already updated state)
//         }}
//       />

//       {/* Detail modal (shows info + edit/delete icons). Edit opens the same modal in edit mode */}
//       <ScheduleDetailModal
//         open={detailOpen}
//         item={activeItem}
//         onClose={() => {
//           setDetailOpen(false);
//           setActiveItem(null);
//         }}
//         onEdit={(item) => {
//           openEditFromDetail(item);
//         }}
//         onDelete={(id) => {
//           handleDelete(id);
//         }}
//       />
//     </>
//   );
// }