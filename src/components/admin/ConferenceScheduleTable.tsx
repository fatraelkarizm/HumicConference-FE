"use client";

import { useState, useMemo, useEffect } from "react";
import { useRoom, useRoomActions } from "@/hooks/useRoom";
import { useScheduleActions } from "@/hooks/useSchedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Plus, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import type {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
} from "@/types";

import ConferenceDayTabs from "@/components/admin/ConferenceDayTabs";
import ScheduleTable from "@/components/ScheduleTable";
import AddScheduleModal from "@/components/schedule/AddScheduleModal";
import AddRoomModal from "@/components/room/AddRoomModal";
import ManageDaysModal from "@/components/admin/ManageDaysModal";
import ManageRoomsModal from "@/components/admin/ManageRoomsModal";
import ManageSchedulesModal from "@/components/admin/ManageSchedulesModal";
import ManageImportExportModal from "@/components/admin/ManageImportExportModal";
import { useScheduleTableLogic } from "@/hooks/useScheduleTableLogic";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import roomService from "@/services/RoomServices";
import scheduleService from "@/services/ScheduleService";
import * as XLSX from 'xlsx';

interface Props {
  conference: BackendConferenceSchedule;
  schedules: BackendSchedule[];
  onScheduleSelect: (schedule: BackendSchedule) => void;
  onScheduleEdit: (schedule: BackendSchedule) => void;
  onScheduleDetail: (schedule: BackendSchedule) => void;
  onRoomEdit: (room: BackendRoom) => void;
  onRoomDetail: (room: BackendRoom) => void;
  onRefresh?: () => void;
}

export default function ConferenceScheduleTable({
  conference,
  schedules,
  onScheduleSelect,
  onScheduleEdit,
  onScheduleDetail,
  onRoomEdit,
  onRoomDetail,
  onRefresh,
}: Props) {
  // States
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showManageDays, setShowManageDays] = useState(false);
  const [showManageRooms, setShowManageRooms] = useState(false);
  const [showManageSchedules, setShowManageSchedules] = useState(false);
  const [showManageImportExport, setShowManageImportExport] = useState(false);
  const [selectedScheduleForRoom, setSelectedScheduleForRoom] = useState<BackendSchedule | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [newRoom, setNewRoom] = useState({
    name: "",
    identifier: "",
    description: "",
    type: "PARALLEL" as "MAIN" | "PARALLEL",
    onlineMeetingUrl: "",
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);

  const { createRoom, deleteRoom } = useRoomActions();
  const { deleteSchedule } = useScheduleActions();

  // ✅ Extract room letter (A, B, C, D, E) from room identifier
  const extractRoomId = (room: any): string | null => {
    const identifier = (room.identifier || '').trim();

    // Match PSA-0930 -> A, PSB-1040 -> B, etc.
    const psMatch = identifier.match(/PS([A-E])-/);
    if (psMatch) return psMatch[1];

    // Fallback: match "Parallel Session 1A", "Room A", etc.
    const name = (room.name || '').toLowerCase().trim();
    const identifierLower = identifier.toLowerCase();

    if (name.includes('room a') || identifierLower.includes('session a') || identifierLower.includes('session 1a')) return 'A';
    if (name.includes('room b') || identifierLower.includes('session b') || identifierLower.includes('session 1b')) return 'B';
    if (name.includes('room c') || identifierLower.includes('session c') || identifierLower.includes('session 1c')) return 'C';
    if (name.includes('room d') || identifierLower.includes('session d') || identifierLower.includes('session 1d')) return 'D';
    if (name.includes('room e') || identifierLower.includes('session e') || identifierLower.includes('session 1e')) return 'E';

    return null;
  };

  // Schedule logic
  const { grouped, daysList, selectedDay, setSelectedDay, formatDate, getDayNumber } =
    useScheduleTableLogic(conference, schedules);

  // Update conference dates
  const updateConferenceDates = async (id: string, startDate: string, endDate: string) => {
    const token = await conferenceScheduleService.getAccessToken();
    if (!token) {
      toast.error("No access token available");
      return;
    }

    try {
      await conferenceScheduleService.updateConferenceSchedule(token, id, {
        year: conference.year.toString(),
        startDate: startDate,
        endDate: endDate
      });
      toast.success("Conference dates updated successfully");
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update conference dates");
    }
  };

  // Fetch ALL rooms and filter them
  const { rooms: allRooms, loading: roomsLoading, refetch: refetchRooms } = useRoom();

  // Helper to produce UTC YYYY-MM-DD key (same logic as useScheduleTableLogic)
  const toUtcDateKey = (d: Date | string) => {
    const dt = typeof d === 'string' ? new Date(d) : d;
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // ✅ Enhanced filtering - Use schedule data that includes rooms
  const currentDayRooms = useMemo(() => {
    // If grouped has no schedules for the selected day, fallback to conference.schedules (nested payload)
    let currentSchedules = grouped[selectedDay] || [];
    if ((!currentSchedules || currentSchedules.length === 0) && Array.isArray((conference as any).schedules)) {
      currentSchedules = (conference as any).schedules.filter((s: any) => toUtcDateKey(s.date) === selectedDay);
    }

    // ✅ Extract rooms from schedules (they have nested rooms data)
    const roomsFromSchedules: BackendRoom[] = [];

    currentSchedules.forEach(schedule => {
      // Check if schedule has rooms property (from API response)
      if ((schedule as any).rooms && Array.isArray((schedule as any).rooms)) {
        roomsFromSchedules.push(...(schedule as any).rooms);
      }
    });

    // ✅ Also get rooms from allRooms that match schedule IDs
    const currentScheduleIds = currentSchedules.map(s => s.id);
    const roomsFromAllRooms = allRooms.filter(room =>
      currentScheduleIds.includes(room.schedule_id)
    );

    // ✅ Combine both sources and deduplicate by ID
    const allCurrentRooms = [...roomsFromSchedules, ...roomsFromAllRooms];
    const uniqueRooms = allCurrentRooms.filter((room, index, self) =>
      index === self.findIndex(r => r.id === room.id)
    );

    return uniqueRooms;
  }, [allRooms, grouped, selectedDay]);

  // ✅ Auto-generate room columns - NOW extractRoomId is defined
  const roomColumnsForDay = useMemo(() => {
    const columns: any[] = [];
    const roomLabels = ['A', 'B', 'C', 'D', 'E'];

    roomLabels.forEach((label, index) => {
      const existingRoom = currentDayRooms.find(room => {
        const roomId = extractRoomId(room);
        return roomId === label;
      });

      columns.push({
        id: label,
        label: `Room ${label}`,
        room: existingRoom || null,
        sortOrder: index,
      });
    });

    return columns;
  }, [currentDayRooms, extractRoomId]);

  // Refresh data when schedules change
  useEffect(() => {
    refetchRooms();
  }, [schedules, refetchRooms]);

  // Enhanced refresh after schedule creation
  const handleScheduleSuccess = async () => {
    try {
      // ✅ Multiple refresh attempts
      await refetchRooms();
      onRefresh?.();

      // Secondary refresh
      setTimeout(async () => {
        await refetchRooms();
        onRefresh?.();
      }, 1000);

    } catch (error) {
      console.error('❌ Refresh error:', error);
    }
  };

  // Handle room cell click (for adding parallel rooms)
  const handleRoomCellClick = (columnId: string, schedule: BackendSchedule) => {
    console.log('Room cell clicked for', columnId, 'schedule', schedule.id);
    const existingRoom = currentDayRooms.find((room) => {
      const extractedId = extractRoomId(room);
      return extractedId === columnId && room.schedule_id === schedule.id;
    });

    if (!existingRoom) {
      setSelectedScheduleForRoom(schedule);
      setSelectedRoomType(columnId);
      setNewRoom({
        name: `Room ${columnId}`,
        identifier: `Parallel Session 1${columnId}`,
        description: "",
        type: "PARALLEL",
        onlineMeetingUrl: conference.online_presentation || "",
        startTime: schedule.start_time || "",
        endTime: schedule.end_time || "",
      });
      setShowAddRoom(true);
    }
  };

  const handleAddRoom = async (roomData: any) => {
    setLoading(true);
    try {
      // ✅ FETCH FRESH ROOMS DATA to check for duplicate identifier
      const accessToken = await roomService.getAccessToken();
      if (!accessToken) {
        throw new Error("Authentication required");
      }

      const scheduleId = roomData.scheduleId;
      const existingRoomsForSchedule = await roomService.getAllRooms(accessToken, scheduleId);

      // CHECK FOR DUPLICATE IDENTIFIER
      let finalIdentifier = roomData.identifier;
      if (finalIdentifier) {
        const identifierExists = existingRoomsForSchedule.some(
          (r: any) => r.identifier?.toLowerCase() === finalIdentifier.toLowerCase()
        );

        if (identifierExists) {
          // Auto-generate unique identifier by adding/incrementing number
          let counter = 2;
          let candidate = `${finalIdentifier} ${counter}`;
          while (existingRoomsForSchedule.some((r: any) => r.identifier?.toLowerCase() === candidate.toLowerCase())) {
            counter++;
            candidate = `${finalIdentifier} ${counter}`;
          }
          finalIdentifier = candidate;
          toast(`Identifier already exists. Using "${finalIdentifier}" instead.`, { duration: 4000 });
        }
      }

      // Use validated identifier
      await createRoom({
        ...roomData,
        identifier: finalIdentifier
      });
      toast.success("Room added successfully!");
      setShowAddRoom(false);
      setSelectedScheduleForRoom(null);
      setSelectedRoomType("");
      setNewRoom({
        name: "",
        identifier: "",
        description: "",
        type: "PARALLEL",
        onlineMeetingUrl: "",
        startTime: "",
        endTime: "",
      });
      await refetchRooms?.();
      onRefresh?.();
    } catch (err: any) {
      const data = err?.data;
      if (data?.errors?.validation) {
        const validations: Record<string, string[]> = data.errors.validation;
        const messages = Object.keys(validations).map(
          (k) => `${k}: ${validations[k].join(", ")}`
        );
        toast.error(`Validation: ${messages.join(" | ")}`, { duration: 8000 });
      } else {
        const serverMsg = data?.message || err?.message || String(err);
        toast.error(`Failed: ${serverMsg}`, { duration: 8000 });
      }
    }
    setLoading(false);
  };

  // ✅ EXPORT TO EXCEL FUNCTION
  const handleExportToExcel = () => {
    try {
      const workbookData: any[] = [];

      // Header row
      workbookData.push([
        'Day',
        'Date',
        'Start Time',
        'End Time',
        'Main Room Activity',
        'Room A',
        'Room B',
        'Room C',
        'Room D',
        'Room E'
      ]);

      // For each day
      daysList.forEach((dayKey: string) => {
        const schedulesForDay = grouped[dayKey] || [];

        schedulesForDay.forEach((schedule: any) => {
          // Get rooms for this specific schedule
          const scheduleRooms = allRooms.filter((r: any) => r.schedule_id === schedule.id);
          const mainRoom = scheduleRooms.find((r: any) => r.type === 'MAIN');
          const parallelRooms = scheduleRooms.filter((r: any) => r.type === 'PARALLEL');

          // Get main room activity
          const mainRoomActivity = mainRoom?.name || schedule.notes || '-';

          // Get parallel session for each room (A, B, C, D, E)
          const roomData: Record<string, string> = {};
          ['A', 'B', 'C', 'D', 'E'].forEach(roomId => {
            const room = parallelRooms.find((r: any) => extractRoomId(r) === roomId);
            if (room) {
              roomData[roomId] = `${room.name || ''}\n${room.identifier || ''}\n${room.description || ''}`.trim();
            } else {
              roomData[roomId] = 'No room assigned';
            }
          });

          // Add row
          workbookData.push([
            `Day ${getDayNumber(dayKey)}`,
            formatDate(dayKey),
            schedule.start_time || '',
            schedule.end_time || '',
            mainRoomActivity,
            roomData['A'],
            roomData['B'],
            roomData['C'],
            roomData['D'],
            roomData['E']
          ]);
        });
      });

      // Create worksheet and workbook
      const worksheet = XLSX.utils.aoa_to_sheet(workbookData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Conference Schedule');

      // Auto-size columns
      const maxWidth = workbookData.reduce((w, r) => Math.max(w, r.length), 10);
      worksheet['!cols'] = Array(maxWidth).fill({ wch: 20 });

      // Export
      const fileName = `Conference_Schedule_${conference.name}_${conference.year}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Schedule exported to Excel!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export schedule');
    }
  };

  // ✅ IMPORT FROM EXCEL FUNCTION
  const handleImportFromExcel = async (data: any[]) => {
    try {
      const accessToken = await roomService.getAccessToken();
      if (!accessToken) {
        throw new Error("Authentication required");
      }

      let schedulesCreated = 0;
      let roomsCreated = 0;

      // Normalize selectedDay to YYYY-MM-DD format
      const targetDate = new Date(selectedDay);
      const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      console.log('🎯 Target date:', selectedDay, '-> normalized:', targetDateStr);
      console.log('📊 Total schedules:', schedules.length);
      console.log('📅 Sample dates from DB:', schedules.slice(0, 5).map(s => s.date));

      // Count existing schedules for this day (match by date part only, ignore timestamp)
      const schedulesForDay = schedules.filter(s => {
        // Extract date part from "2026-12-22T00:00:00.000Z" -> "2026-12-22"
        const dbDateStr = s.date?.split('T')[0] || s.date;
        const match = dbDateStr === targetDateStr;

        // Debug first 3 comparisons
        if (schedules.indexOf(s) < 3) {
          console.log(`Comparing: "${dbDateStr}" === "${targetDateStr}" ? ${match}`);
        }

        return match;
      });
      const existingCount = schedulesForDay.length;

      console.log('✅ Schedules matching', targetDateStr, ':', existingCount);

      // Ask user confirmation
      const shouldProceed = window.confirm(
        `🗓️ IMPORT KE: ${selectedDay}\n\n` +
        `📊 Schedules yang ada sekarang: ${existingCount}\n` +
        `📥 Import akan: HAPUS SEMUA (${existingCount}) schedule lama + tambahin data baru dari Excel\n\n` +
        `⚠️ Ini akan REPLACE semua schedule untuk Day ini!\n\n` +
        `Lanjutkan import?`
      );

      if (!shouldProceed) {
        toast.error('Import dibatalkan');
        return;
      }

      // Delete ALL schedules and rooms for this day
      if (existingCount > 0) {
        toast.loading(`Menghapus ${existingCount} schedules lama...`, { id: 'delete-schedules' });

        // Delete all rooms first, then schedules
        for (const schedule of schedulesForDay) {
          try {
            // Get and delete all rooms for this schedule
            const scheduleRooms = allRooms.filter((r: any) => r.schedule_id === schedule.id);
            for (const room of scheduleRooms) {
              try {
                await deleteRoom(room.id);
              } catch (e) {
                console.error('Failed to delete room:', e);
              }
            }

            // Then delete the schedule
            await deleteSchedule(schedule.id);
          } catch (e) {
            console.error('Failed to delete schedule:', e);
          }
        }

        toast.success(`✅ Deleted ${existingCount} schedules`, { id: 'delete-schedules' });

        // Wait and refresh to ensure data is clean
        await new Promise(resolve => setTimeout(resolve, 500));
        await refetchRooms?.();
      }

      toast.loading('Importing new schedules...', { id: 'import' });

      // Process each row
      for (const row of data) {
        try {
          // Skip rows with invalid/empty times or non-HH:MM format
          const timeRegex = /^\d{1,2}:\d{2}$/; // Match HH:MM or H:MM

          if (!row.startTime || !row.endTime ||
            !timeRegex.test(row.startTime) || !timeRegex.test(row.endTime) ||
            row.startTime === '00:00' && row.endTime === '00:00' ||
            row.startTime === row.endTime) {
            continue;
          }

          // Parse date from Excel format (e.g., "Wednesday, December 16, 2026")
          const dateStr = row.date;
          let parsedDate: Date;

          // Try to parse the date
          parsedDate = new Date(dateStr);
          if (isNaN(parsedDate.getTime())) {
            continue;
          }

          // Format date as YYYY-MM-DD using LOCAL date (not UTC) to avoid timezone issues
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;

          // Detect schedule type based on activity name
          const activityLower = (row.mainRoomActivity || '').toLowerCase();
          const isBreak = activityLower.includes('break') ||
            activityLower.includes('lunch') ||
            activityLower.includes('coffee') ||
            activityLower.includes('isoma');

          const scheduleType = isBreak ? 'BREAK' : 'TALK';

          // 1. Create Schedule
          const scheduleData = {
            title: row.mainRoomActivity || 'Schedule',
            date: formattedDate,
            startTime: row.startTime,
            endTime: row.endTime,
            scheduleType: scheduleType as any,
            description: row.mainRoomActivity,
            conference: conference.name,
          };

          const createdSchedule = await scheduleService.createSchedule(
            accessToken,
            scheduleData,
            conference.id
          );

          // Get schedule ID
          const scheduleId = typeof createdSchedule === 'object' ? createdSchedule.id : null;

          if (!scheduleId) {
            schedulesCreated++;
            continue;
          }

          schedulesCreated++;

          // 2. Create Main Room if needed (skip for BREAK type)
          if (!isBreak && row.mainRoomActivity && row.mainRoomActivity !== 'No room assigned') {
            try {
              // Truncate name to 100 chars
              const mainRoomName = row.mainRoomActivity.length > 100
                ? row.mainRoomActivity.substring(0, 97) + '...'
                : row.mainRoomActivity;

              await createRoom({
                name: mainRoomName,
                identifier: `Main-${row.startTime.replace(':', '')}`,
                description: row.mainRoomActivity,
                type: 'MAIN',
                scheduleId,
                onlineMeetingUrl: '',
              });
              roomsCreated++;
            } catch (e) {
              console.error('Failed to create main room:', e);
            }
          }

          // 3. Create Parallel Rooms (A, B, C, D, E) - skip for BREAK type
          if (!isBreak) {
            const roomLetters = ['A', 'B', 'C', 'D', 'E'];

            for (const letter of roomLetters) {
              const roomKey = `room${letter}` as 'roomA' | 'roomB' | 'roomC' | 'roomD' | 'roomE';
              const roomData = row[roomKey];

              if (roomData && roomData !== 'No room assigned') {
                // Parse room data (format: "Room Name\nIdentifier\nDescription")
                const lines = roomData.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
                let roomName = lines[0] || `Room ${letter}`;
                const roomDescription = lines[2] || '';

                // Truncate name to 100 chars
                if (roomName.length > 100) {
                  roomName = roomName.substring(0, 97) + '...';
                }

                // Generate truly unique identifier: Letter + Time
                const uniqueIdentifier = `PS${letter}-${row.startTime.replace(':', '')}`;

                try {
                  await createRoom({
                    name: roomName,
                    identifier: uniqueIdentifier,
                    description: roomDescription,
                    type: 'PARALLEL',
                    scheduleId,
                    onlineMeetingUrl: '',
                    startTime: row.startTime,
                    endTime: row.endTime,
                    track: { name: roomDescription || roomName, description: `Track for ${roomName}` }
                  });
                  roomsCreated++;
                } catch (e) {
                  console.error(`Failed to create room ${letter}:`, e);
                }
              }
            }
          }

        } catch (rowError) {
          console.error('Error processing row:', row, rowError);
        }
      }

      toast.success(`Imported ${schedulesCreated} schedules and ${roomsCreated} rooms!`);
      await refetchRooms?.();
      onRefresh?.();
    } catch (error: any) {
      console.error('Import error:', error);
      throw error;
    }
  };

  // If no conference days, show empty state
  if (daysList.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Conference Days Available
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first schedule to start organizing the conference.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conference Days */}
      <ConferenceDayTabs
        daysList={daysList}
        grouped={grouped}
        selectedDay={selectedDay}
        onDaySelect={setSelectedDay}
        onManageDays={() => { console.log('Manage Days clicked'); setShowManageDays(true); }}
        onManageRooms={() => { console.log('Manage Rooms clicked'); setShowManageRooms(true); }}
        onManageSchedules={() => { console.log('Manage Schedules clicked'); setShowManageSchedules(true); }}
        onManageImportExport={() => setShowManageImportExport(true)}
        formatDate={formatDate}
        getDayNumber={getDayNumber}
      />

      {/* Loading State - REMOVED per user request */}
      {/* {roomsLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          </div>
        </div>
      )} */}

      {/* Schedule Table */}
      <ScheduleTable
        conference={conference}
        currentDay={selectedDay}
        schedules={grouped[selectedDay] || []}
        currentDayRooms={currentDayRooms}
        roomColumnsForDay={roomColumnsForDay}
        onRoomEdit={onRoomEdit}
        onRoomDetail={onRoomDetail}
        onScheduleEdit={onScheduleEdit}
        onScheduleDetail={onScheduleDetail}
        onDeleteSchedule={async (schedule) => {
          if (confirm("Are you sure you want to delete this schedule?")) {
            await deleteSchedule(schedule.id);
            toast.success("Schedule deleted successfully");
            handleScheduleSuccess();
          }
        }}
        onRoomCellClick={handleRoomCellClick}
        onAddSchedule={() => setShowAddSchedule(true)}
        formatDate={formatDate}
        getDayNumber={getDayNumber}
        extractRoomId={extractRoomId}
      />

      {/* Add Schedule Modal */}
      {showAddSchedule && (
        <AddScheduleModal
          isOpen={true}
          onClose={() => setShowAddSchedule(false)}
          conferenceId={conference.id}
          onSuccess={handleScheduleSuccess}
        />
      )}

      <AddRoomModal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        onSubmit={handleAddRoom}
        selectedScheduleForRoom={selectedScheduleForRoom}
        selectedRoomType={selectedRoomType}
        newRoom={newRoom}
        setNewRoom={setNewRoom}
        loading={loading}
      />

      <ManageDaysModal
        isOpen={showManageDays}
        onClose={() => setShowManageDays(false)}
        conference={conference}
        daysList={daysList}
        grouped={grouped}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        updateConferenceDates={updateConferenceDates}
        formatDate={formatDate}
        getDayNumber={getDayNumber}
        onRefresh={onRefresh}
      />

      <ManageRoomsModal
        isOpen={showManageRooms}
        onClose={() => setShowManageRooms(false)}
        rooms={currentDayRooms}
        schedules={schedules}
        onAddRoom={handleAddRoom}
        onEditRoom={onRoomEdit}
        onDeleteRoom={async (room) => {
          if (confirm(`Are you sure you want to delete room "${room.name}"?`)) {
            try {
              await deleteRoom(room.id);
              toast.success("Room deleted successfully");
              handleScheduleSuccess();
            } catch (e: any) {
              console.error(e);
              toast.error(e.message || "Failed to delete room");
            }
          }
        }}
        onViewRoom={onRoomDetail}
      />

      <ManageSchedulesModal
        isOpen={showManageSchedules}
        onClose={() => setShowManageSchedules(false)}
        schedules={grouped[selectedDay] || []}
        onAddSchedule={() => setShowAddSchedule(true)}
        onEditSchedule={onScheduleEdit}
        onDeleteSchedule={async (schedule) => {
          await deleteSchedule(schedule.id);
          onRefresh?.();
        }}
        onViewSchedule={onScheduleDetail}
        formatDate={formatDate}
      />

      {/* Add Schedule Modal */}
      {showAddSchedule && (
        <AddScheduleModal
          isOpen={true}
          onClose={() => setShowAddSchedule(false)}
          conferenceId={conference.id}
          initialDate={selectedDay}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {/* Manage Import/Export Modal */}
      <ManageImportExportModal
        isOpen={showManageImportExport}
        onClose={() => setShowManageImportExport(false)}
        onExport={handleExportToExcel}
        onImport={handleImportFromExcel}
        selectedDay={selectedDay}
      />
    </div>
  );
}