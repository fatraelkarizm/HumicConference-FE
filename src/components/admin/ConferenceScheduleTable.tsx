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
import { useScheduleTableLogic } from "@/hooks/useScheduleTableLogic";
import conferenceScheduleService from "@/services/ConferenceScheduleService";

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

  const { createRoom } = useRoomActions();
  const { deleteSchedule } = useScheduleActions();

  // ✅ DEFINE extractRoomId FIRST - before using it
  const extractRoomId = (room: BackendRoom): string | null => {
    const name = (room.name || "").toLowerCase(). trim();
    const identifier = (room.identifier || "").toLowerCase(). trim();

    const roomNameMatch = name.match(/^room\s+([a-e])$/i);
    if (roomNameMatch) return roomNameMatch[1].toUpperCase();

    const identifierMatch = identifier.match(/parallel\s+session\s+1([a-e])$/i);
    if (identifierMatch) return identifierMatch[1].toUpperCase();

    return null;
  };

  // Schedule logic
  const { grouped, daysList, selectedDay, setSelectedDay, formatDate, getDayNumber } = 
    useScheduleTableLogic(conference, schedules);

  // Update conference end date
  const updateConferenceEndDate = async (id: string, date: string) => {
    const token = await conferenceScheduleService.getAccessToken();
    if (!token) {
      toast.error("No access token available");
      return;
    }

    try {
      await conferenceScheduleService.updateConferenceSchedule(token, id, { 
        year: conference.year.toString(),
        startDate: conference.start_date.split('T')[0], 
        endDate: date 
      });
      toast.success("Conference end date updated successfully");
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update conference end date");
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
      await createRoom(roomData);
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
        formatDate={formatDate}
        getDayNumber={getDayNumber}
      />

      {/* Loading State */}
      {roomsLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Loading rooms for {formatDate(selectedDay)}...
          </div>
        </div>
      )}

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
        onDeleteSchedule={(schedule) => {}}
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
        updateConferenceEndDate={updateConferenceEndDate}
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
          // TODO: Implement delete room
          console.log("Delete room", room);
          toast.success("Room deleted (placeholder)");
          onRefresh?.();
        }}
        onViewRoom={onRoomDetail}
      />

      <ManageSchedulesModal
        isOpen={showManageSchedules}
        onClose={() => setShowManageSchedules(false)}
        schedules={schedules}
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
    </div>
  );
}