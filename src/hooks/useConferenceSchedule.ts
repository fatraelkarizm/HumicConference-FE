import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import conferenceScheduleService from '@/services/ConferenceScheduleService';
import type { 
  BackendConferenceSchedule, 
  NewConferenceScheduleData, 
  UpdateConferenceScheduleData 
} from '@/types/conferenceSchedule';

export const useConferenceSchedule = (includeRelation: boolean = true) => {
  const { user, isAuthenticated } = useAuth();
  const [conferences, setConferences] = useState<BackendConferenceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConferenceSchedules = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = await conferenceScheduleService.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const conferencesData = await conferenceScheduleService.getAllConferenceSchedules(accessToken, includeRelation);
      setConferences(conferencesData);

    } catch (err: any) {
      setError(err.message || 'Failed to load conference schedules');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, includeRelation]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadConferenceSchedules();
    }
  }, [loadConferenceSchedules, isAuthenticated, user]);

  return {
    conferences,
    loading,
    error,
    refetch: loadConferenceSchedules
  };
};

export const useConferenceScheduleActions = () => {
  const createConferenceSchedule = async (data: NewConferenceScheduleData): Promise<BackendConferenceSchedule> => {
    const accessToken = await conferenceScheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await conferenceScheduleService.createConferenceSchedule(accessToken, data);
  };

  const updateConferenceSchedule = async (conferenceId: string, data: UpdateConferenceScheduleData): Promise<BackendConferenceSchedule> => {
    const accessToken = await conferenceScheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await conferenceScheduleService.updateConferenceSchedule(accessToken, conferenceId, data);
  };

  const deleteConferenceSchedule = async (conferenceId: string): Promise<boolean> => {
    const accessToken = await conferenceScheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await conferenceScheduleService.deleteConferenceSchedule(accessToken, conferenceId);
  };

  const getConferenceScheduleById = async (conferenceId: string, includeRelation: boolean = true): Promise<BackendConferenceSchedule> => {
    const accessToken = await conferenceScheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await conferenceScheduleService.getConferenceScheduleById(accessToken, conferenceId, includeRelation);
  };

  return {
    createConferenceSchedule,
    updateConferenceSchedule,
    deleteConferenceSchedule,
    getConferenceScheduleById
  };
};