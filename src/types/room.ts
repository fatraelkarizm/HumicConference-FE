import type { BackendTrack } from './track';
import type { BackendApiResponse } from './api';

// =================== BACKEND ROOM TYPES ===================
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

// =================== FORM DATA TYPES ===================
export type NewRoomData = {
  name: string;
  identifier?: string;
  description?: string;
  type: 'MAIN' | 'PARALLEL';
  onlineMeetingUrl?: string;
  scheduleId: string;
  trackId?: string;
};

export type UpdateRoomData = Partial<Omit<NewRoomData, 'scheduleId'>>;

// =================== API RESPONSE ALIASES ===================
export type RoomListApiResponse = BackendApiResponse<BackendRoom[]>;
export type RoomApiResponse = BackendApiResponse<BackendRoom>;