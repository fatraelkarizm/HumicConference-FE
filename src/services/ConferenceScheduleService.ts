import { BackendApiResponse } from '@/types/api';
import {
  BackendConferenceSchedule,
  NewConferenceScheduleData,
  UpdateConferenceScheduleData
} from '@/types/conferenceSchedule';

class ConferenceScheduleService {
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

  async getAllConferenceSchedules(accessToken: string, includeRelation: boolean = true): Promise<BackendConferenceSchedule[]> {
    const queryParam = includeRelation ? '?include_relation[0]=schedules' : '';
    const response = await this.makeRequest(
      `/api/v1/conference-schedule${queryParam}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  }

  async getConferenceScheduleById(accessToken: string, conferenceId: string, includeRelation: boolean = true): Promise<BackendConferenceSchedule> {
    const queryParam = includeRelation ? '?include_relation[0]=schedules' : '';
    const response = await this.makeRequest(
      `/api/v1/conference-schedule/${conferenceId}${queryParam}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return response.data;
  }

  async createConferenceSchedule(accessToken: string, data: NewConferenceScheduleData): Promise<BackendConferenceSchedule> {
    const conferencePayload = {
      name: data.name,
      description: data.description,
      year: data.year,
      start_date: data.startDate,
      end_date: data.endDate,
      type: data.type, // 'ICICYTA' | 'ICODSA'
      contact_email: data.contactEmail,
      timezone_iana: data.timezoneIana,
      onsite_presentation: data.onsitePresentation || null,
      online_presentation: data.onlinePresentation || null,
      notes: data.notes || null,
      no_show_policy: data.noShowPolicy || null,
      is_active: data.isActive ?? true,
    };

    const response = await this.makeRequest('/api/v1/conference-schedule', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conferencePayload)
    });

    return response.data;
  }

  async updateConferenceSchedule(accessToken: string, conferenceId: string, data: UpdateConferenceScheduleData): Promise<BackendConferenceSchedule> {
    const updatePayload: any = {};

    if (data.name) updatePayload.name = data.name;
    if (data.description) updatePayload.description = data.description;
    if (data.year) updatePayload.year = data.year;
    if (data.startDate) updatePayload.start_date = data.startDate;
    if (data.endDate) updatePayload.end_date = data.endDate;
    if (data.type) updatePayload.type = data.type;
    if (data.contactEmail) updatePayload.contact_email = data.contactEmail;
    if (data.timezoneIana) updatePayload.timezone_iana = data.timezoneIana;
    if (data.onsitePresentation !== undefined) updatePayload.onsite_presentation = data.onsitePresentation;
    if (data.onlinePresentation !== undefined) updatePayload.online_presentation = data.onlinePresentation;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.noShowPolicy !== undefined) updatePayload.no_show_policy = data.noShowPolicy;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

    const response = await this.makeRequest(`/api/v1/conference-schedule/${conferenceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    return response.data;
  }

  async deleteConferenceSchedule(accessToken: string, conferenceId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/v1/conference-schedule/${conferenceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.code === 200 || response.status === 'OK';
    } catch (error: any) {
      throw error;
    }
  }
}

export default new ConferenceScheduleService();