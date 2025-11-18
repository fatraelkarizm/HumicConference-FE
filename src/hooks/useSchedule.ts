import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import scheduleService from '@/services/ScheduleService';
import { ScheduleProcessor, mapUserRoleToConference, findConferenceByType } from '@/utils/scheduleUtils';
import type { ProcessedConferenceSchedule, ScheduleItem, NewScheduleData } from '@/types/schedule';
export const useSchedule = () => {
     const { user, isAuthenticated } = useAuth();
     const [schedule, setSchedule] = useState<ProcessedConferenceSchedule | null>(null);
     const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const loadSchedule = useCallback(async () => {
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

               const [currentUser, allConferences] = await Promise.all([
                    scheduleService.getCurrentUser(accessToken),
                    scheduleService.getAllConferenceSchedules(accessToken)
               ]);

               const conferenceType = mapUserRoleToConference(currentUser.role);
               const targetConference = findConferenceByType(allConferences, conferenceType);

               if (!targetConference) {
                    throw new Error(`No ${conferenceType} conference found`);
               }

               const processedSchedule = ScheduleProcessor.processConferenceSchedule(targetConference);
               setSchedule(processedSchedule);

               const allItems = processedSchedule.days.flatMap(day =>
                    day.items.map(item => ({
                         ...item,
                         conference: conferenceType,
                         dayTitle: day.dayTitle,
                         date: day.date
                    }))
               );
               setScheduleItems(allItems);

               // Schedule loaded successfully
          } catch (err: any) {
               console.error('❌ Failed to load schedule:', err.message);
               setError(err.message || 'Failed to load schedule');
          } finally {
               setLoading(false);
          }
     }, [isAuthenticated, user]);

     useEffect(() => {
          if (isAuthenticated && user) {
               loadSchedule();
          }
     }, [loadSchedule, isAuthenticated, user]);

     return {
          schedule,
          scheduleItems,
          loading,
          error,
          refetch: loadSchedule
     };
};

export const useScheduleActions = () => {
     const createScheduleItem = async (data: NewScheduleData): Promise<boolean> => {
          if (!data.title || !data.date || !data.startTime || !data.endTime || !data.conference) {
               throw new Error('Missing required fields');
          }

          const accessToken = await scheduleService.getAccessToken();
          if (!accessToken) {
               throw new Error('Access token not available');
          }

          const allConferences = await scheduleService.getAllConferenceSchedules(accessToken);
          const targetConference = findConferenceByType(allConferences, data.conference);

          if (!targetConference) {
               const availableTypes = allConferences.map(c => c.type).join(', ');
               throw new Error(`Conference "${data.conference}" not found. Available: ${availableTypes}`);
          }

          // ✅ Step 1: Create schedule
          let createResult = null;
          try {
               createResult = await scheduleService.createSchedule(accessToken, data, targetConference.id);
          } catch (error: any) {
               console.error('❌ Schedule creation error:', error.message);

               if (error.message.toLowerCase().includes('required') ||
                    error.message.toLowerCase().includes('invalid') ||
                    error.message.toLowerCase().includes('before') ||
                    error.message.toLowerCase().includes('validation')) {
                    throw error;
               }

               if (error.message.toLowerCase().includes('successfully') ||
                    error.message.toLowerCase().includes('created') ||
                    error.message.toLowerCase().includes('saved')) {
                    createResult = 'success';
               } else {
                    throw error;
               }
          }

          // ✅ Step 2: Create room if successful (simplified)
          if (createResult === 'success' || (createResult && typeof createResult === 'object')) {
               if (createResult !== 'success' && createResult.id) {
                    try {
                         // Always create room if we have schedule ID - room contains speaker/moderator info
                         const room = await scheduleService.createRoom(accessToken, createResult.id, data);

                         // Skip separate track creation since speaker goes to room description
                         // if (data.speaker?.trim()) {
                         //      const track = await scheduleService.createTrackSeparate(accessToken, data.speaker);
                         // }
                    } catch (roomError :any) {
                         console.warn('⚠️ Room creation failed (non-critical):', roomError.message);
                         // Don't throw error - schedule creation was successful
                    }
               }
          }

          return true;
     };

     const updateScheduleItem = async (id: string, data: NewScheduleData): Promise<boolean> => {
          const accessToken = await scheduleService.getAccessToken();
          if (!accessToken) {
               throw new Error('Access token not available');
          }

          const scheduleId = extractScheduleId(id);
          await scheduleService.updateSchedule(accessToken, scheduleId, data);
          return true;
     };

     const deleteScheduleItem = async (id: string): Promise<boolean> => {
          const accessToken = await scheduleService.getAccessToken();
          if (!accessToken) {
               throw new Error('Access token not available');
          }

          const scheduleId = extractScheduleId(id);

          if (!scheduleId || scheduleId.length < 10) {
               throw new Error(`Invalid schedule ID: ${scheduleId}`);
          }

          const success = await scheduleService.deleteSchedule(accessToken, scheduleId);

          if (!success) {
               throw new Error('Delete operation failed');
          }

          return true;
     };

     const extractScheduleId = (id: string): string => {
          if (!id) {
               throw new Error('No ID provided');
          }

          if (id.includes('-') && id.split('-').length > 2) {
               const parts = id.split('-');
               if (parts.length >= 5) {
                    return parts.slice(0, 5).join('-');
               }
          }

          return id;
     };

     return {
          createScheduleItem,
          updateScheduleItem,
          deleteScheduleItem
     };
};