import { BackendApiResponse } from '@/types/api';
import { BackendTrack, UpdateTrackData } from '@/types/track';

class TrackService {
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

  async getAllTracks(accessToken: string): Promise<BackendTrack[]> {
    const response = await this.makeRequest(
      `/api/v1/track`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  }

  async getTrackById(accessToken: string, trackId: string): Promise<BackendTrack> {
    const response = await this.makeRequest(
      `/api/v1/track/${trackId}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return response.data;
  }

  async createTrack(accessToken: string, name: string, description?: string): Promise<BackendTrack> {
    const trackPayload = {
      name,
      description: description || null
    };

    const response = await this.makeRequest('/api/v1/track', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trackPayload)
    });

    return response.data;
  }

  // ✅ ADD: Update track method
  async updateTrack(accessToken: string, trackId: string, data: UpdateTrackData): Promise<BackendTrack> {
    const updatePayload: any = {};
    
    if (data.name) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;

    const response = await this.makeRequest(`/api/v1/track/${trackId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    return response.data;
  }

  // ✅ ADD: Delete track method
  async deleteTrack(accessToken: string, trackId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/v1/track/${trackId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.code === 200 || response.status === 'OK';
    } catch (error: any) {
      console.error('❌ Delete track failed for ID:', trackId, error.message);
      throw error;
    }
  }
}

export default new TrackService();