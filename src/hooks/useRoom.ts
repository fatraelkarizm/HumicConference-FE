import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import roomService from '@/services/RoomServices';
import type { BackendRoom, UpdateRoomData } from '@/types/room';

export interface CreateRoomPayload {
  name: string;
  identifier?: string | null;
  description?: string;
  type: "MAIN" | "PARALLEL";
  online_meeting_url?: string | null;
  onlineMeetingUrl?: string | null;
  startTime?: string;
  endTime?: string;
  scheduleId: string;
  track?: any;
}

export const useRoom = (scheduleId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<BackendRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = await roomService.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const roomsData = await roomService.getAllRooms(accessToken, scheduleId);
      setRooms(roomsData);

    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, scheduleId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRooms();
    }
  }, [loadRooms, isAuthenticated, user]);

  return {
    rooms,
    loading,
    error,
    refetch: loadRooms
  };
};

export const useRoomActions = () => {
  const createRoom = async (roomData: CreateRoomPayload) => {
    try {
      const token = await roomService.getAccessToken();

      if (!token) {
        throw new Error('Authentication failed. Please login again.');
      }

      // ✅ Transform data to match backend expectations
      const payload = {
        name: roomData.name,
        identifier: roomData.identifier,
        description: roomData.description,
        type: roomData.type,
        // ✅ Support both formats (AddRoomModal uses camelCase, ManageRoomsModal uses snake_case)
        online_meeting_url: roomData.onlineMeetingUrl || roomData.online_meeting_url,
        start_time: roomData.startTime,
        end_time: roomData.endTime,
        schedule_id: roomData.scheduleId,
        track: (roomData as any).track,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/room`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create room');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  };

  const updateRoom = async (roomId: string, data: UpdateRoomData): Promise<BackendRoom> => {
    const accessToken = await roomService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await roomService.updateRoom(accessToken, roomId, data);
  };

  const deleteRoom = async (roomId: string): Promise<boolean> => {
    const accessToken = await roomService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await roomService.deleteRoom(accessToken, roomId);
  };

  const getRoomById = async (roomId: string): Promise<BackendRoom> => {
    const accessToken = await roomService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await roomService.getRoomById(accessToken, roomId);
  };

  return {
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomById
  };
};
// Specialized hook for rooms within a specific schedule
export const useScheduleRooms = (scheduleId: string) => {
  const [rooms, setRooms] = useState<BackendRoom[]>([]);
  const [mainRoom, setMainRoom] = useState<BackendRoom | null>(null);
  const [parallelRooms, setParallelRooms] = useState<BackendRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { rooms: allRooms, loading: roomsLoading, error: roomsError, refetch } = useRoom(scheduleId);

  useEffect(() => {
    setLoading(roomsLoading);
    setError(roomsError);
    setRooms(allRooms);

    // Separate main and parallel rooms
    const main = allRooms.find(room => room.type === 'MAIN') || null;
    const parallel = allRooms.filter(room => room.type === 'PARALLEL');

    setMainRoom(main);
    setParallelRooms(parallel);
  }, [allRooms, roomsLoading, roomsError]);

  return {
    rooms,
    mainRoom,
    parallelRooms,
    loading,
    error,
    refetch
  };
};