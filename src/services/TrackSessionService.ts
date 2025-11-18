import { BackendApiResponse } from '@/types/api';
import {
  BackendTrackSession,
  NewTrackSessionData,
  UpdateTrackSessionData
} from '@/types/trackSession';

class TrackSessionService {
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

  async getAllTrackSessions(accessToken: string, trackId?: string): Promise<BackendTrackSession[]> {
    const queryParam = trackId ? `?track_id=${trackId}` : '';
    const response = await this.makeRequest(
      `/api/v1/track-session${queryParam}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  }

  async getTrackSessionById(accessToken: string, sessionId: string): Promise<BackendTrackSession> {
    const response = await this.makeRequest(
      `/api/v1/track-session/${sessionId}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return response.data;
  }

  async createTrackSession(accessToken: string, data: NewTrackSessionData): Promise<BackendTrackSession> {
    const sessionPayload = {
      paper_id: data.paperId,
      title: data.title,
      authors: data.authors,
      mode: data.mode, // 'ONLINE' | 'ONSITE'
      notes: data.notes || null,
      start_time: data.startTime,
      end_time: data.endTime,
      track_id: data.trackId,
    };

    const response = await this.makeRequest('/api/v1/track-session', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionPayload)
    });

    return response.data;
  }

  async updateTrackSession(accessToken: string, sessionId: string, data: UpdateTrackSessionData): Promise<BackendTrackSession> {
    const updatePayload: any = {};
    
    if (data.paperId) updatePayload.paper_id = data.paperId;
    if (data.title) updatePayload.title = data.title;
    if (data.authors) updatePayload.authors = data.authors;
    if (data.mode) updatePayload.mode = data.mode;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.startTime) updatePayload.start_time = data.startTime;
    if (data.endTime) updatePayload.end_time = data.endTime;
    if (data.trackId) updatePayload.track_id = data.trackId;

    const response = await this.makeRequest(`/api/v1/track-session/${sessionId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    return response.data;
  }

  async deleteTrackSession(accessToken: string, sessionId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/v1/track-session/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.code === 200 || response.status === 'OK';
    } catch (error: any) {
      console.error('❌ Delete track session failed for ID:', sessionId, error.message);
      throw error;
    }
  }
}

export default new TrackSessionService();