import type { BackendApiResponse } from './api';

// =================== BACKEND TRACK TYPES ===================
export interface BackendTrack {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// =================== FORM DATA TYPES ===================
export type NewTrackData = {
  name: string;
  description?: string;
};

export type UpdateTrackData = Partial<NewTrackData>;

// =================== API RESPONSE ALIASES ===================
export type TrackListApiResponse = BackendApiResponse<BackendTrack[]>;
export type TrackApiResponse = BackendApiResponse<BackendTrack>;