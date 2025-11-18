import type { BackendSchedule } from './schedule';
import type { BackendApiResponse } from './api';
import type { DaySchedule } from './schedule';

// =================== BACKEND CONFERENCE SCHEDULE TYPES ===================
export interface BackendConferenceSchedule {
  id: string;
  name: string;
  description?: string;
  year: string;
  start_date: string; // ISO string
  end_date: string; // ISO string
  type: 'ICICYTA' | 'ICODSA';
  contact_email?: string;
  timezone_iana?: string;
  onsite_presentation?: string;
  online_presentation?: string;
  notes?: string;
  no_show_policy?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  schedules?: BackendSchedule[];
  track_id?: string;
}

// =================== FRONTEND PROCESSED TYPES ===================
export interface ProcessedConferenceSchedule {
  id: string;
  name: string;
  description?: string;
  year: string;
  startDate: string;
  endDate: string;
  type: 'ICICYTA' | 'ICODSA';
  contactEmail?: string;
  timezone?: string;
  onsiteLocation?: string;
  onlineLocation?: string;
  notes?: string;
  noShowPolicy?: string;
  days: DaySchedule[];
}

// =================== FORM DATA TYPES ===================
export type NewConferenceScheduleData = {
  name: string;
  description: string;
  year: string;
  startDate: string;
  endDate: string;
  type: 'ICICYTA' | 'ICODSA';
  contactEmail: string;
  timezoneIana: string;
  onsitePresentation?: string;
  onlinePresentation?: string;
  notes?: string;
  noShowPolicy?: string;
};

export type UpdateConferenceScheduleData = Partial<NewConferenceScheduleData>;

// =================== API RESPONSE ALIASES ===================
export type ConferenceScheduleListApiResponse = BackendApiResponse<BackendConferenceSchedule[]>;
export type ConferenceScheduleApiResponse = BackendApiResponse<BackendConferenceSchedule>;