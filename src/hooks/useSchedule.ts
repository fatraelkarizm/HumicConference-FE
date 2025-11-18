import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import scheduleService from '@/services/ScheduleService';
import { ScheduleProcessor, mapUserRoleToConference, findConferenceByType } from '@/utils/scheduleUtils';
import type { 
  ProcessedConferenceSchedule, 
  ScheduleItem, 
  NewScheduleData,
  BackendSchedule,
  UpdateScheduleData,
  DaySchedule
} from '@/types';

export const useSchedule = (conferenceScheduleId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const [schedules, setSchedules] = useState<BackendSchedule[]>([]);
  const [processedSchedule, setProcessedSchedule] = useState<ProcessedConferenceSchedule | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = await scheduleService.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not available');
      }

      // If specific conference schedule ID provided
      if (conferenceScheduleId) {
        const schedulesData = await scheduleService.getAllSchedules(accessToken, conferenceScheduleId);
        setSchedules(schedulesData);
        return;
      }

      // Otherwise, load based on user role (legacy behavior)
      const [currentUser, allConferences] = await Promise.all([
        scheduleService.getCurrentUser(accessToken),
        scheduleService.getAllConferenceSchedules(accessToken)
      ]);

      const conferenceType = mapUserRoleToConference(currentUser.role);
      const targetConference = findConferenceByType(allConferences, conferenceType);

      if (!targetConference) {
        throw new Error(`No ${conferenceType} conference found`);
      }

      const processed = ScheduleProcessor.processConferenceSchedule(targetConference);
      setProcessedSchedule(processed);

      // ✅ FIX: Add proper types for day and item
      const allItems = processed.days.flatMap((day: DaySchedule) =>
        day.items.map((item: ScheduleItem) => ({
          ...item,
          conference: conferenceType,
          dayTitle: day.dayTitle,
          date: day.date
        }))
      );
      setScheduleItems(allItems);

    } catch (err: any) {
      console.error('❌ Failed to load schedules:', err.message);
      setError(err.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, conferenceScheduleId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSchedules();
    }
  }, [loadSchedules, isAuthenticated, user]);

  return {
    schedules,
    processedSchedule,
    scheduleItems,
    loading,
    error,
    refetch: loadSchedules
  };
};

export const useScheduleActions = () => {
  const createSchedule = async (data: NewScheduleData, conferenceId: string): Promise<BackendSchedule | 'success'> => {
    if (!data.title || !data.date || !data.startTime || !data.endTime) {
      throw new Error('Missing required fields');
    }

    const accessToken = await scheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await scheduleService.createSchedule(accessToken, data, conferenceId);
  };

  const updateSchedule = async (scheduleId: string, data: UpdateScheduleData): Promise<BackendSchedule> => {
    const accessToken = await scheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await scheduleService.updateSchedule(accessToken, scheduleId, data);
  };

  const deleteSchedule = async (scheduleId: string): Promise<boolean> => {
    const accessToken = await scheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    if (!scheduleId || scheduleId.length < 10) {
      throw new Error(`Invalid schedule ID: ${scheduleId}`);
    }

    return await scheduleService.deleteSchedule(accessToken, scheduleId);
  };

  const getScheduleById = async (scheduleId: string): Promise<BackendSchedule> => {
    const accessToken = await scheduleService.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    return await scheduleService.getScheduleById(accessToken, scheduleId);
  };

  return {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleById
  };
};