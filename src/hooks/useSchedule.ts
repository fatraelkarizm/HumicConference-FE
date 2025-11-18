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

// ✅ FIX: Remove conferenceScheduleId parameter since API doesn't support filtering
export const useSchedule = () => {
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

      // ✅ FIX: Get all schedules without filtering, then process based on user role
      const [currentUser, allConferences, allSchedules] = await Promise.all([
        scheduleService.getCurrentUser(accessToken),
        scheduleService.getAllConferenceSchedules(accessToken),
        scheduleService.getAllSchedules(accessToken) // No conference filtering
      ]);

      const conferenceType = mapUserRoleToConference(currentUser.role);
      const targetConference = findConferenceByType(allConferences, conferenceType);

      if (!targetConference) {
        throw new Error(`No ${conferenceType} conference found`);
      }

      // Filter schedules that belong to the target conference
      const filteredSchedules = allSchedules.filter(
        schedule => schedule.conference_schedule_id === targetConference.id
      );
      
      setSchedules(filteredSchedules);

      // Process conference schedule with filtered schedules
      const conferenceWithFilteredSchedules = {
        ...targetConference,
        schedules: filteredSchedules
      };

      const processed = ScheduleProcessor.processConferenceSchedule(conferenceWithFilteredSchedules);
      setProcessedSchedule(processed);

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
      setError(err.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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