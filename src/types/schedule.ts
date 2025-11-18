export interface BackendSchedule {
  id: string;
  date: string; // ISO string
  start_time?: string;
  end_time?: string;
  type: 'TALK' | 'BREAK' | 'ONE_DAY_ACTIVITY';
  notes?: string;
  conference_schedule_id: string;
  created_at: string;
  updated_at: string;
  rooms?: BackendRoom[];
}

// Import types from other modules
import type { BackendRoom } from './room';
import type { BackendTrack } from './track';
import type { BackendApiResponse } from './api';

export type { BackendRoom } from './room';
export type { BackendTrack } from './track';
export type { BackendConferenceSchedule, ProcessedConferenceSchedule } from './conferenceSchedule';

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  speaker?: string;
  location?: string;
  conference?: string; // ICICYTA or ICODSA
  date: string; // YYYY-MM-DD format
  startTime?: string;
  endTime?: string;
  timeDisplay?: string;
  type: 'TALK' | 'BREAK' | 'ONE_DAY_ACTIVITY';
  scheduleType?: string;
  dayNumber?: number;
  dayTitle?: string;
  rooms?: BackendRoom[];
  track?: BackendTrack;
  moderator?: string;
  roomName?: string;
  roomIdentifier?: string;
  onlineUrl?: string;
}

export interface DaySchedule {
  date: string;
  dayNumber: number;
  dayTitle: string;
  items: ScheduleItem[];
}

export type NewScheduleData = {
  title: string;
  conference: string;
  date: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  description?: string;
  location?: string;
  scheduleType?: string;
  dayNumber?: number;
  dayTitle?: string;
};

export type UpdateScheduleData = Partial<NewScheduleData>;

// =================== API RESPONSE ALIASES ===================
export type ScheduleListApiResponse = BackendApiResponse<BackendSchedule[]>;
export type ScheduleApiResponse = BackendApiResponse<BackendSchedule>;