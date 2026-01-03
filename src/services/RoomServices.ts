import { BackendApiResponse } from '@/types/api';
import {
  BackendRoom,
  NewRoomData,
  UpdateRoomData
} from '@/types/room';

class RoomService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) return null;
      const result = await response.json();
      return result.data?.accessToken || null;
    } catch (error) {
      return null;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<BackendApiResponse<any>> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    });

    // Try to parse JSON body for both success and error responses
    let parsed: any = null;
    const text = await response.text();
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (e) {
      parsed = text;
    }

    if (!response.ok) {
      const err: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
      // attach parsed body so callers can inspect validation errors
      err.status = response.status;
      err.data = parsed;
      throw err;
    }

    const result = parsed;

    if (result && result.code && result.code >= 400) {
      const err: any = new Error(result.message || `Request failed with code ${result.code}`);
      err.data = result;
      throw err;
    }

    return result;
  }

  async getAllRooms(accessToken: string, scheduleId?: string): Promise<BackendRoom[]> {
    const queryParam = scheduleId ? `?filter[schedule_id]=${scheduleId}` : '';
    const response = await this.makeRequest(
      `/api/v1/room${queryParam}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  }

  async getRoomById(accessToken: string, roomId: string): Promise<BackendRoom> {
    const response = await this.makeRequest(
      `/api/v1/room/${roomId}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return response.data;
  }

  async createRoom(accessToken: string, data: any): Promise<BackendRoom> {
    // Build payload but only include keys with defined (non-undefined) values.
    const roomPayload: any = {};
    const pushIf = (key: string, value: any) => {
      if (value !== undefined && value !== null) {
        roomPayload[key] = value;
      }
    };

    pushIf('name', data.name);
    pushIf('identifier', data.identifier);
    pushIf('description', data.description);
    pushIf('type', data.type);
    pushIf('online_meeting_url', data.onlineMeetingUrl);
    pushIf('start_time', data.startTime);
    pushIf('end_time', data.endTime);
    pushIf('schedule_id', data.scheduleId);

    // Handle different track formats if provided (only include when present)
    if (data.track) {
      roomPayload.track = data.track;
    } else if (data.trackId) {
      pushIf('track_id', data.trackId);
    }

    const response = await this.makeRequest('/api/v1/room', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomPayload)
    });

    return response.data;
  }

  async updateRoom(accessToken: string, roomId: string, data: UpdateRoomData): Promise<BackendRoom> {


    // Try without track_id first (most likely to succeed)
    const attempts = [
      // 1) Without track_id (backend might not allow updating track via room update)
      (() => {
        const payload: any = {};
        if (data.name && data.name.trim()) payload.name = data.name.trim();
        if (data.type) payload.type = data.type;
        if (data.identifier !== undefined) payload.identifier = data.identifier || null;
        if (data.description !== undefined) payload.description = data.description || null;
        if (data.onlineMeetingUrl !== undefined) payload.online_meeting_url = data.onlineMeetingUrl || null;
        // ❌ Skip track_id - backend seems to reject it
        return payload;
      })(),

      // 2) With track_id as fallback
      (() => {
        const payload: any = {};
        if (data.name && data.name.trim()) payload.name = data.name.trim();
        if (data.type) payload.type = data.type;
        if (data.identifier !== undefined) payload.identifier = data.identifier || null;
        if (data.description !== undefined) payload.description = data.description || null;
        if (data.onlineMeetingUrl !== undefined) payload.online_meeting_url = data.onlineMeetingUrl || null;
        if (data.trackId !== undefined) payload.track_id = data.trackId || null;
        return payload;
      })()
    ];

    let lastError: any = null;

    for (let i = 0; i < attempts.length; i++) {
      const updatePayload = attempts[i];

      try {


        const response = await this.makeRequest(`/api/v1/room/${roomId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        return response.data;


      } catch (error: any) {
        lastError = error;
      }
    }

    console.error('🚨 All update attempts failed');
    throw lastError;
  }

  async deleteRoom(accessToken: string, roomId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/v1/room/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.code === 200 || response.status === 'OK';
    } catch (error: any) {
      throw error;
    }
  }
}

export default new RoomService();