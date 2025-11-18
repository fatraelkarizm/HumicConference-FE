// Backend response types - REAL structure
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
}

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

export interface BackendRoom {
  id: string;
  name: string;
  identifier?: string;
  description?: string;
  type: 'MAIN' | 'PARALLEL';
  online_meeting_url?: string;
  start_time?: string;
  end_time?: string;
  schedule_id: string;
  track_id?: string;
  created_at: string;
  updated_at: string;
  track?: BackendTrack;
}

export interface BackendTrack {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendApiResponse<T> {
  code: number;
  status: string;
  message: string;
  pagination?: any;
  data: T;
  errors?: any;
}

// Frontend processed types - FIXED
export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  speaker?: string;
  location?: string;
  conference?: string; // ✅ ADDED: Missing property
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
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayTitle: string;
  items: ScheduleItem[];
}

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

// Legacy types for compatibility
export type NewScheduleData = {
  title: string;
  conference: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  speaker?: string;
  description?: string;
  location?: string;
  scheduleType?: string;
  dayNumber?: number;
  dayTitle?: string;
};

// ✅ ADDED: For update operations
export type UpdateScheduleData = Partial<NewScheduleData>;

// Alias for API response
export type ScheduleApiResponse = BackendApiResponse<BackendConferenceSchedule[]>;