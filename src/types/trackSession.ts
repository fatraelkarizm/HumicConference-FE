import type { BackendApiResponse } from './api';

// =================== BACKEND TRACK SESSION TYPES ===================
export interface BackendTrackSession {
  id: string;
  paper_id: string;
  title: string;
  authors: string;
  mode: 'ONLINE' | 'ONSITE';
  notes?: string;
  start_time: string;
  end_time: string;
  track_id: string;
  created_at: string;
  updated_at: string;
}

// =================== FORM DATA TYPES ===================
export type NewTrackSessionData = {
  paperId: string;
  title: string;
  authors: string;
  mode: 'ONLINE' | 'ONSITE';
  notes?: string;
  startTime: string;
  endTime: string;
  trackId: string;
};

export type UpdateTrackSessionData = Partial<NewTrackSessionData>;

// =================== API RESPONSE ALIASES ===================
export type TrackSessionListApiResponse = BackendApiResponse<BackendTrackSession[]>;
export type TrackSessionApiResponse = BackendApiResponse<BackendTrackSession>;