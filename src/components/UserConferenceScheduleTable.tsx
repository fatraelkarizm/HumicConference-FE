"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
} from "@/types";

import { useRoom } from "@/hooks/useRoom";
import { useScheduleTableLogic } from "@/hooks/useScheduleTableLogic";
import UserScheduleTable from "@/components/UserScheduleTable";

interface Props {
  conference: BackendConferenceSchedule;
  schedules: BackendSchedule[];
}

export default function UserConferenceScheduleTable({
  conference,
  schedules,
}: Props) {
  // Schedule logic
  const { grouped, daysList, selectedDay, setSelectedDay, formatDate, getDayNumber } =
    useScheduleTableLogic(conference, schedules);

  // ✅ DEFINE extractRoomId FIRST - before using it
  const extractRoomId = (room: BackendRoom): string | null => {
    const name = (room.name || "").toLowerCase().trim();
    const identifier = (room.identifier || "").toLowerCase().trim();

    const roomNameMatch = name.match(/^room\s+([a-e])$/i);
    if (roomNameMatch) return roomNameMatch[1].toUpperCase();

    const identifierMatch = identifier.match(/parallel\s+session\s+1([a-e])$/i);
    if (identifierMatch) return identifierMatch[1].toUpperCase();

    return null;
  };

  // Fetch ALL rooms and filter them
  const { rooms: allRooms } = useRoom();

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
  }, [currentDayRooms]);

  // If no conference days, show empty state
  if (daysList.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Schedules Available
            </h3>
            <p className="text-gray-600">
              No conference schedules have been created yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Day Tabs for Users */}
      <div className="flex flex-wrap gap-2">
        {daysList.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDay === day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day {getDayNumber(day)}: {formatDate(day).split(',')[0]}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <UserScheduleTable
        conference={conference}
        currentDay={selectedDay}
        schedules={grouped[selectedDay] || []}
        currentDayRooms={currentDayRooms}
        roomColumnsForDay={roomColumnsForDay}
        formatDate={formatDate}
        getDayNumber={getDayNumber}
        extractRoomId={extractRoomId}
      />
    </div>
  );
}