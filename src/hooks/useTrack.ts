import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import trackService from '@/services/TrackService';
import type { BackendTrack, NewTrackData, UpdateTrackData } from '@/types/track';

export const useTrack = () => {
  const { user, isAuthenticated } = useAuth();
  const [tracks, setTracks] = useState<BackendTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTracks = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = await trackService.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const tracksData = await trackService.getAllTracks(accessToken);
      setTracks(tracksData);

    } catch (err: any) {
      console.error('❌ Failed to load tracks:', err.message);
      setError(err.message || 'Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadTracks();
    }
  }, [loadTracks, isAuthenticated, user]);

  return {
    tracks,
    loading,
    error,
    refetch: loadTracks
  };
};

export const useTrackActions = () => {
  const createTrack = async (data: NewTrackData): Promise<BackendTrack> => {
    const accessToken = await trackService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackService.createTrack(accessToken, data.name, data.description);
  };

  const updateTrack = async (trackId: string, data: UpdateTrackData): Promise<BackendTrack> => {
    const accessToken = await trackService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackService.updateTrack(accessToken, trackId, data);
  };

  const deleteTrack = async (trackId: string): Promise<boolean> => {
    const accessToken = await trackService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackService.deleteTrack(accessToken, trackId);
  };

  const getTrackById = async (trackId: string): Promise<BackendTrack> => {
    const accessToken = await trackService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackService.getTrackById(accessToken, trackId);
  };

  return {
    createTrack,
    updateTrack,
    deleteTrack,
    getTrackById
  };
};

// Specialized hook for track selection in forms
export const useTrackOptions = () => {
  const { tracks, loading, error } = useTrack();

  const trackOptions = tracks.map(track => ({
    value: track.id,
    label: track.name,
    description: track.description
  }));

  return {
    trackOptions,
    tracks,
    loading,
    error
  };
};