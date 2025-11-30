import { useMemo } from "react";
import { useRoom } from "@/hooks/useRoom";
import type { BackendSchedule, BackendRoom } from "@/types";

export function useRoomLogic(
  grouped: Record<string, BackendSchedule[]>,
  selectedDay: string
) {
  const { rooms: allRooms, loading: roomsLoading, refetch: refetchRooms } = useRoom();

  const currentDayRooms = useMemo(() => {
    const daySchedules = grouped[selectedDay] || [];
    const dayScheduleIds = daySchedules.map((schedule) => schedule.id);
    return allRooms.filter((room) => dayScheduleIds.includes(room.schedule_id));
  }, [allRooms, grouped, selectedDay]);

  const extractRoomId = (room: BackendRoom): string | null => {
    const name = (room.name || "").toLowerCase().trim();
    const identifier = (room.identifier || "").toLowerCase().trim();
    
    const roomNameMatch = name.match(/^room\s+([a-e])$/i);
    if (roomNameMatch) return roomNameMatch[1].toUpperCase();
    
    const identifierMatch = identifier. match(/parallel\s+session\s+1([a-e])$/i);
    if (identifierMatch) return identifierMatch[1].toUpperCase();
    
    return null;
  };

  const roomColumnsForDay = useMemo(() => {
    const parallelRooms = currentDayRooms.filter((room) => room.type === "PARALLEL");
    const roomColumns: Array<{
      id: string;
      label: string;
      room: BackendRoom;
      sortOrder: number;
    }> = [];

    const roomMap = new Map<string, BackendRoom>();

    parallelRooms.forEach((room) => {
      const roomId = extractRoomId(room);
      if (roomId && !roomMap.has(roomId)) {
        roomMap.set(roomId, room);
      }
    });

    const sortedRoomIds = Array.from(roomMap. keys()).sort((a, b) => a.localeCompare(b));
    
    sortedRoomIds.forEach((roomId, index) => {
      const room = roomMap.get(roomId);
      if (room) {
        roomColumns.push({
          id: roomId,
          label: `Room ${roomId}`,
          room: room,
          sortOrder: index,
        });
      }
    });

    if (roomColumns.length === 0) {
      ["A", "B", "C", "D", "E"]. forEach((letter, index) => {
        roomColumns.push({
          id: letter,
          label: `Room ${letter}`,
          room: null as any,
          sortOrder: index,
        });
      });
    }

    return roomColumns;
  }, [currentDayRooms]);

  return {
    allRooms,
    roomsLoading,
    currentDayRooms,
    roomColumnsForDay,
    refetchRooms,
  };
}