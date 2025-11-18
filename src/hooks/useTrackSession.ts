import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import trackSessionService from '@/services/TrackSessionService';
import type { BackendTrackSession, NewTrackSessionData, UpdateTrackSessionData } from '@/types/trackSession';

export const useTrackSession = (trackId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const [trackSessions, setTrackSessions] = useState<BackendTrackSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrackSessions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = await trackSessionService.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const sessionsData = await trackSessionService.getAllTrackSessions(accessToken, trackId);
      setTrackSessions(sessionsData);

    } catch (err: any) {
      console.error('❌ Failed to load track sessions:', err.message);
      setError(err.message || 'Failed to load track sessions');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, trackId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadTrackSessions();
    }
  }, [loadTrackSessions, isAuthenticated, user]);

  return {
    trackSessions,
    loading,
    error,
    refetch: loadTrackSessions
  };
};

export const useTrackSessionActions = () => {
  const createTrackSession = async (data: NewTrackSessionData): Promise<BackendTrackSession> => {
    const accessToken = await trackSessionService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackSessionService.createTrackSession(accessToken, data);
  };

  const updateTrackSession = async (sessionId: string, data: UpdateTrackSessionData): Promise<BackendTrackSession> => {
    const accessToken = await trackSessionService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackSessionService.updateTrackSession(accessToken, sessionId, data);
  };

  const deleteTrackSession = async (sessionId: string): Promise<boolean> => {
    const accessToken = await trackSessionService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackSessionService.deleteTrackSession(accessToken, sessionId);
  };

  const getTrackSessionById = async (sessionId: string): Promise<BackendTrackSession> => {
    const accessToken = await trackSessionService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await trackSessionService.getTrackSessionById(accessToken, sessionId);
  };

  return {
    createTrackSession,
    updateTrackSession,
    deleteTrackSession,
    getTrackSessionById
  };
};

// Specialized hook for sessions grouped by mode
export const useTrackSessionsByMode = (trackId?: string) => {
  const { trackSessions, loading, error, refetch } = useTrackSession(trackId);
  
  const [onlineSessions, setOnlineSessions] = useState<BackendTrackSession[]>([]);
  const [onsiteSessions, setOnsiteSessions] = useState<BackendTrackSession[]>([]);

  useEffect(() => {
    const online = trackSessions.filter(session => session.mode === 'ONLINE');
    const onsite = trackSessions.filter(session => session.mode === 'ONSITE');
    
    setOnlineSessions(online);
    setOnsiteSessions(onsite);
  }, [trackSessions]);

  return {
    trackSessions,
    onlineSessions,
    onsiteSessions,
    loading,
    error,
    refetch
  };
};

// Specialized hook for sessions with time grouping
export const useTrackSessionsGroupedByTime = (trackId?: string) => {
  const { trackSessions, loading, error, refetch } = useTrackSession(trackId);
  
  const [sessionsByTime, setSessionsByTime] = useState<Record<string, BackendTrackSession[]>>({});

  useEffect(() => {
    const grouped = trackSessions.reduce((acc, session) => {
      const timeSlot = `${session.start_time}-${session.end_time}`;
      if (!acc[timeSlot]) {
        acc[timeSlot] = [];
      }
      acc[timeSlot].push(session);
      return acc;
    }, {} as Record<string, BackendTrackSession[]>);

    setSessionsByTime(grouped);
  }, [trackSessions]);

  return {
    trackSessions,
    sessionsByTime,
    timeSlots: Object.keys(sessionsByTime),
    loading,
    error,
    refetch
  };
};