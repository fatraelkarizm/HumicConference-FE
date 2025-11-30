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
import { useScheduleTableLogic } from "@/hooks/useScheduleTableLogic";

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
    
    console.log('🔍 Current day:', selectedDay);
    console.log('🔍 Current day schedules:', currentSchedules);
    
    // ✅ Extract rooms from schedules (they have nested rooms data)
    const roomsFromSchedules: BackendRoom[] = [];
    
    currentSchedules.forEach(schedule => {
      console.log('🔍 Checking schedule:', schedule.id, 'date:', schedule.date, 'has rooms:', !!((schedule as any).rooms), 'is array:', Array.isArray((schedule as any).rooms), 'length:', ((schedule as any).rooms || []).length);
      // Check if schedule has rooms property (from API response)
      if ((schedule as any).rooms && Array.isArray((schedule as any).rooms)) {
        console.log('🔍 Pushing rooms from schedule:', (schedule as any).rooms.length);
        roomsFromSchedules.push(...(schedule as any).rooms);
      }
    });
    
    console. log('🔍 Rooms from schedules:', roomsFromSchedules);
    
    // ✅ Also get rooms from allRooms that match schedule IDs
    const currentScheduleIds = currentSchedules.map(s => s.id);
    const roomsFromAllRooms = allRooms.filter(room => 
      currentScheduleIds.includes(room.schedule_id)
    );
    
    console.log('🔍 Rooms from allRooms:', roomsFromAllRooms);
    
    // ✅ Combine both sources and deduplicate by ID
    const allCurrentRooms = [...roomsFromSchedules, ...roomsFromAllRooms];
    const uniqueRooms = allCurrentRooms.filter((room, index, self) => 
      index === self.findIndex(r => r.id === room.id)
    );
    
    console.log('🔍 Final current day rooms:', uniqueRooms);
    return uniqueRooms;
  }, [allRooms, grouped, selectedDay]);

  // ✅ Auto-generate room columns - NOW extractRoomId is defined
  const roomColumnsForDay = useMemo(() => {
    const columns: any[] = [];
    const roomLabels = ['A', 'B', 'C', 'D', 'E'];
    
    console.log('🔍 Generating room columns for rooms:', currentDayRooms);
    
    roomLabels.forEach((label, index) => {
      const existingRoom = currentDayRooms.find(room => {
        const roomId = extractRoomId(room);
        console.log(`🔍 Room ${room.name} (${room.identifier}) -> extracted ID: ${roomId}`);
        return roomId === label;
      });
      
      columns.push({
        id: label,
        label: `Room ${label}`,
        room: existingRoom || null,
        sortOrder: index,
      });
    });
    
    console.log('🔍 Generated room columns:', columns);
    return columns;
  }, [currentDayRooms, extractRoomId]);

  // Refresh data when schedules change
  useEffect(() => {
    console.log('🔄 Schedules changed, refetching rooms.. .');
    refetchRooms();
  }, [schedules, refetchRooms]);

  // Enhanced refresh after schedule creation
  const handleScheduleSuccess = async () => {
    console.log(`✅ Schedule created for ${conference.name} (${conference.year})`);
    console.log('🔄 Refreshing all data...');
    
    try {
      // ✅ Multiple refresh attempts
      await refetchRooms();
      onRefresh?.();
      
      // Secondary refresh
      setTimeout(async () => {
        console.log('🔄 Secondary refresh.. .');
        await refetchRooms();
        onRefresh?.();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Refresh error:', error);
    }
  };

  // Handle room cell click (for adding parallel rooms)
  const handleRoomCellClick = (columnId: string, schedule: BackendSchedule) => {
    console.log('Room cell clicked:', columnId, schedule);
    // Implementation for adding parallel rooms
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
            <Button
              onClick={() => setShowAddSchedule(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Schedule
            </Button>
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
        onManageDays={() => {}}
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

      {/* ✅ Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
          <strong>Debug Info:</strong>
          <div>Selected Day: {selectedDay}</div>
          <div>Current Day Schedules: {(grouped[selectedDay] || []). length}</div>
          <div>Current Day Rooms: {currentDayRooms.length}</div>
          <div>Room Columns: {roomColumnsForDay.length}</div>
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
    </div>
  );
}