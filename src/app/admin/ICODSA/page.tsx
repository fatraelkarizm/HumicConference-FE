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
      const scheduleData = await getUserConferenceSchedule();
      
      if (scheduleData) {
        setSchedule(scheduleData);
      } else {
        setError('No schedule data available');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDetail(itemId?: string) {
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
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadSchedule}
            className="mt-2 text-red-600 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800">No Schedule Available</h2>
          <p className="text-gray-600">No conference schedule found.</p>
          <button 
            onClick={loadSchedule}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reload Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{schedule.name}</h1>
        {schedule.description && (
          <p className="text-gray-600 mt-2">{schedule.description}</p>
        )}
        
        {/* Status indicators */}
       
        
        {/* Conference info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">📧 Contact:</span> {schedule.contactEmail}
            </div>
            <div>
              <span className="font-semibold">🕐 Timezone:</span> {schedule.timezone}
            </div>
            <div>
              <span className="font-semibold">🏢 Onsite:</span> {schedule.onsiteLocation}
            </div>
            <div>
              <span className="font-semibold">💻 Online:</span> {schedule.onlineLocation}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Days */}
      {schedule.days.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Schedule Items</h3>
          <p className="text-gray-500">Conference schedule items will appear here once they are added.</p>
        </div>
      ) : (
        schedule.days.map((day) => (
          <div key={day.date} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{day.dayTitle}</h2>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                {day.items.length} sessions
              </span>
            </div>
            
            {day.items.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
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
        ))
      )}
      
      {/* No Show Policy */}
      {schedule.noShowPolicy && (
        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Important Policy</h3>
          <p className="text-blue-700 text-sm">{schedule.noShowPolicy}</p>
        </div>
      )}
    </div>
  );
}