import {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
  BackendApiResponse,
  NewScheduleData,
  UpdateScheduleData
} from '@/types/schedule';

class ScheduleService {
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

    if (result.status && result.status.toLowerCase().includes('error')) {
      console.error(`❌ Backend error status on ${endpoint}:`, result);
      throw new Error(result.message || `Request failed with status ${result.status}`);
    }

    const hasSuccessCode = !result.code || result.code === 200 || result.code === 201;
    const hasSuccessStatus = !result.status || result.status === 'OK' || result.status === 'CREATED';
    const hasData = result.data !== undefined && result.data !== null;
    
    if (hasSuccessCode && hasSuccessStatus && hasData) {
      return result;
    }

    if (result.message && result.message.toLowerCase().includes('successfully')) {
      return result;
    }

    return result;
  }

  async getAllConferenceSchedules(accessToken: string): Promise<BackendConferenceSchedule[]> {
    const response = await this.makeRequest(
      `/api/v1/conference-schedule?include_relation[0]=schedules`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  }

  async getCurrentUser(accessToken: string): Promise<any> {
    const response = await this.makeRequest('/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return response.data;
  }

  async createSchedule(accessToken: string, data: NewScheduleData, conferenceId: string): Promise<BackendSchedule | 'success'> {
    const clientValidation = this.validateScheduleData(data);
    if (!clientValidation.isValid) {
      throw new Error(clientValidation.error);
    }

    // The backend does not accept start_time/end_time at the schedule level.
    // Times are handled at the room level during room creation.
    const schedulePayload: any = {
      date: data.date,
      type: this.mapScheduleTypeToBackend(data.scheduleType),
      notes: data.description || null,
      conference_schedule_id: conferenceId,
    };
    
    try {
      const response = await this.makeRequest('/api/v1/schedule', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schedulePayload)
      });

      if (response.data && response.data.id) {
        return response.data;
      } 
      
      return 'success';
      
    } catch (error: any) {
      console.error('❌ Schedule creation failed:', error.message);
      
      if (error.message && error.message.toLowerCase().includes('successfully')) {
        return 'success';
      }
      
      if (error.message && (
        error.message.toLowerCase().includes('created') ||
        error.message.toLowerCase().includes('saved') ||
        error.message.toLowerCase().includes('success')
      )) {
        return 'success';
      }
      
      throw error;
    }
  }

  private validateScheduleData(data: NewScheduleData): { isValid: boolean; error?: string } {
    if (!data.title?.trim()) {
      return { isValid: false, error: 'Title is required' };
    }
    
    if (!data.date) {
      return { isValid: false, error: 'Date is required' };
    }
    
    if (!data.startTime || !data.endTime) {
      return { isValid: false, error: 'Start time and end time are required' };
    }
    
    if (data.startTime >= data.endTime) {
      return { isValid: false, error: 'Start time must be before end time' };
    }
    
    if (!data.conference) {
      return { isValid: false, error: 'Conference is required' };
    }

    return { isValid: true };
  }

  async updateSchedule(accessToken: string, id: string, data: UpdateScheduleData): Promise<BackendSchedule> {
    const updatePayload: any = {};
    
    if (data.date) updatePayload.date = data.date;
    if (data.startTime) updatePayload.start_time = data.startTime;
    if (data.endTime) updatePayload.end_time = data.endTime;
    if (data.description) updatePayload.notes = data.description;
    if (data.scheduleType) updatePayload.type = this.mapScheduleTypeToBackend(data.scheduleType);
    
    const response = await this.makeRequest(`/api/v1/schedule/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    return response.data;
  }

  async deleteSchedule(accessToken: string, id: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/v1/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.code === 200 || response.status === 'OK';
    } catch (error: any) {
      console.error('❌ Delete failed for ID:', id, error.message);
      throw error;
    }
  }

  // ✅ Fixed createRoom - Maps speaker to room description correctly
  async createRoom(accessToken: string, scheduleId: string, data: NewScheduleData): Promise<BackendRoom | null> {
    // ✅ Only create room if there's meaningful room data
    if (!data.title && !data.location && !data.speaker) {
      return null;
    }

    try {
      const roomType = this.mapRoomType(data.scheduleType);

      // ✅ Map speaker to description (as shown in the JSON structure)
      let roomDescription = data.description || null;
      if (data.speaker?.trim()) {
        const moderatorText = `Moderator: ${data.speaker.trim()}`;
        roomDescription = roomDescription 
          ? `${roomDescription}. ${moderatorText}`
          : moderatorText;
      }

      const roomPayload: any = {
        name: data.title || 'Session Room',
        identifier: null,
        description: roomDescription,
        type: roomType,
        online_meeting_url: data.location?.startsWith('http') ? data.location : null,
        schedule_id: scheduleId,
      };

      // Add track for PARALLEL rooms (required by backend)
      if (roomType === 'PARALLEL' && data.speaker?.trim()) {
        roomPayload.track = {
          name: data.speaker.trim(),
          description: `Track by ${data.speaker.trim()}`
        };
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
    } catch (error: any) {
      console.error('❌ Room creation failed:', error.message);
      return null; // Non-critical failure
    }
  }

  // ✅ Simplified track creation - separate from room creation
  async createTrackSeparate(accessToken: string, speakerName: string): Promise<any> {
    if (!speakerName?.trim()) {
      return null;
    }

    try {
      const trackPayload = {
        name: speakerName.trim(),
        description: `Track by ${speakerName.trim()}`,
      };

      const trackResponse = await this.makeRequest('/api/v1/track', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trackPayload)
      });

      return trackResponse.data;
    } catch (error: any) {
      console.error('❌ Track creation failed:', error.message);
      return null; // Non-critical failure
    }
  }

  private mapScheduleTypeToBackend(scheduleType?: string): 'TALK' | 'BREAK' | 'ONE_DAY_ACTIVITY' {
    switch (scheduleType?.toLowerCase()) {
      case 'break':
      case 'coffee break': 
        return 'BREAK';
      case 'activity':
      case 'workshop':
      case 'tour':
        return 'ONE_DAY_ACTIVITY';
      case 'speech':
      case 'reporting':
      case 'panel':
      default: 
        return 'TALK';
    }
  }

  private mapRoomType(scheduleType?: string): 'MAIN' | 'PARALLEL' {
    switch (scheduleType?.toLowerCase()) {
      case 'panel':
      case 'workshop':
        return 'PARALLEL';
      case 'speech':
      case 'reporting':
      case 'break':
      case 'activity':
      default:
        return 'MAIN';
    }
  }
}

export default new ScheduleService();