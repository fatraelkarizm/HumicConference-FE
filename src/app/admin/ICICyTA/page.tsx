"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import { getUserConferenceSchedule } from '@/services/ScheduleService';
import type { ProcessedConferenceSchedule } from '@/types/schedule';

export default function ICICYTASchedulePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [schedule, setSchedule] = useState<ProcessedConferenceSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'ADMIN_ICICYTA') {
      loadSchedule();
    }
  }, [authLoading, isAuthenticated, user]);

  async function loadSchedule() {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading schedule for ICICYTA...');
      
      const scheduleData = await getUserConferenceSchedule();
      
      if (scheduleData) {
        console.log('✅ Schedule loaded:', scheduleData.name);
        console.log('✅ Days:', scheduleData.days.length);
        console.log('✅ Total sessions:', scheduleData.days.reduce((total, day) => total + day.items.length, 0));
        setSchedule(scheduleData);
      } else {
        console.log('❌ No schedule data received');
        setError('No schedule data available');
      }
    } catch (err: any) {
      console.error('❌ Failed to load schedule:', err);
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDetail(itemId?: string) {
    console.log('Opening detail for:', itemId);
    // TODO: Implement detail modal
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conference schedule...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN_ICICYTA') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Unauthorized</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (error && !schedule) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Schedule</h3>
          <p className="text-red-600 mb-3">{error}</p>
          <button 
            onClick={loadSchedule}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Schedule Available</h2>
          <p className="text-gray-600 mb-6">No conference schedule found for ICICYTA.</p>
          <button 
            onClick={loadSchedule}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Schedule
          </button>
        </div>
      </div>
    );
  }

  const totalSessions = schedule.days.reduce((total, day) => total + day.items.length, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{schedule.name}</h1>
        {schedule.description && (
          <p className="text-xl text-gray-600 mb-4">{schedule.description}</p>
        )}
        
        {/* Conference info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Conference Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black">
            <div className="flex items-center gap-2">
              <span className="font-semibold"> Contact:</span> 
              <span>{schedule.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold"> Timezone:</span> 
              <span>{schedule.timezone}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold"> Onsite:</span> 
              <span>{schedule.onsiteLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold"> Online:</span> 
              <span>{schedule.onlineLocation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      {schedule.days.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4"></div>
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Schedule Items</h3>
          <p className="text-gray-500 mb-6">Conference schedule items will appear here once they are added.</p>
          <button 
            onClick={loadSchedule}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {schedule.days.map((day) => (
            <div key={day.date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Day header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{day.dayTitle}</h2>
                  <div className="flex items-center gap-3">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                       {day.date}
                    </span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                       {day.items.length} {day.items.length === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Day content */}
              <div className="p-6">
                {day.items.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 text-4xl mb-2"></div>
                    <p className="text-gray-500">No sessions scheduled for this day</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {day.items.map((item) => (
                      <ScheduleCard
                        key={item.id}
                        item={item}
                        onOpenDetail={handleOpenDetail}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Show Policy */}
      {schedule.noShowPolicy && (
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
             Important Policy
          </h3>
          <p className="text-blue-700 leading-relaxed">{schedule.noShowPolicy}</p>
        </div>
      )}
    </div>
  );
}