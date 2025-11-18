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
      console.error('❌ Failed to get access token:', error);
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status} on ${endpoint}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.code && result.code >= 400) {
      console.error(`❌ Backend error on ${endpoint}:`, result);
      throw new Error(result.message || `Request failed with code ${result.code}`);
    }

    return result;
  }

  async getAllRooms(accessToken: string, scheduleId?: string): Promise<BackendRoom[]> {
    const queryParam = scheduleId ? `?schedule_id=${scheduleId}` : '';
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

  async createRoom(accessToken: string, data: NewRoomData): Promise<BackendRoom> {
    const roomPayload = {
      name: data.name,
      identifier: data.identifier || null,
      description: data.description || null,
      type: data.type, // 'MAIN' | 'PARALLEL'
      online_meeting_url: data.onlineMeetingUrl || null,
      schedule_id: data.scheduleId,
      track_id: data.trackId || null,
    };

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
    const updatePayload: any = {};
    
    if (data.name) updatePayload.name = data.name;
    if (data.identifier !== undefined) updatePayload.identifier = data.identifier;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.type) updatePayload.type = data.type;
    if (data.onlineMeetingUrl !== undefined) updatePayload.online_meeting_url = data.onlineMeetingUrl;
    if (data.trackId !== undefined) updatePayload.track_id = data.trackId;

    const response = await this.makeRequest(`/api/v1/room/${roomId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    return response.data;
  }

  async deleteRoom(accessToken: string, roomId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/v1/room/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.code === 200 || response.status === 'OK';
    } catch (error: any) {
      console.error('❌ Delete room failed for ID:', roomId, error.message);
      throw error;
    }
  }
}

export default new RoomService();