import { BackendApiResponse } from '@/types/api';
import {
  BackendSchedule,
  NewScheduleData,
  UpdateScheduleData
} from '@/types/schedule';
import { BackendConferenceSchedule } from '@/types/conferenceSchedule';

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
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.code && result.code >= 400) {
      throw new Error(result.message || `Request failed with code ${result.code}`);
    }

    return result;
  }

  async getCurrentUser(accessToken: string): Promise<any> {
    const response = await this.makeRequest('/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return response.data;
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

  // ✅ FIX: Remove conference_schedule_id parameter since API doesn't accept it
  async getAllSchedules(accessToken: string): Promise<BackendSchedule[]> {
    const response = await this.makeRequest(
      `/api/v1/schedule`, // No query parameters
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  }

  async getScheduleById(accessToken: string, scheduleId: string): Promise<BackendSchedule> {
    const response = await this.makeRequest(
      `/api/v1/schedule/${scheduleId}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return response.data;
  }

  async createSchedule(accessToken: string, data: NewScheduleData, conferenceId: string): Promise<BackendSchedule | 'success'> {
    const clientValidation = this.validateScheduleData(data);
    if (!clientValidation.isValid) {
      throw new Error(clientValidation.error);
    }

    const schedulePayload: any = {
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
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

      if (error.message && error.message.toLowerCase().includes('successfully')) {
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

  // ✅ Try different endpoint variations
  async updateSchedule(accessToken: string, id: string, data: UpdateScheduleData): Promise<BackendSchedule> {
    const updatePayload: any = {};

    // ✅ Only include fields that backend supports
    if (data.date) {
      updatePayload.date = data.date;
    }

    if (data.startTime) {
      updatePayload.start_time = data.startTime;
    }

    if (data.endTime) {
      updatePayload.end_time = data.endTime;
    }

    if (data.description !== undefined && data.description !== null) {
      updatePayload.notes = data.description;
    }

    if (data.scheduleType) {
      updatePayload.type = this.mapScheduleTypeToBackend(data.scheduleType);
    }

    try {
      const response = await this.makeRequest(`/api/v1/schedule/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
  async deleteSchedule(accessToken: string, id: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/v1/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.code === 200 || response.status === 'OK';
    } catch (error: any) {
      throw error;
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
}

export default new ScheduleService();