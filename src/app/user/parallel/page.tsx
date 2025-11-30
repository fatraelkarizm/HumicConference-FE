"use client";

import React, { useEffect, useState } from "react";
import { Users, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import type { BackendConferenceSchedule, BackendSchedule, BackendRoom } from "@/types";

export default function ParallelPage() {
  const [conferences, setConferences] = useState<BackendConferenceSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const accessToken = await conferenceScheduleService.getAccessToken();
        if (accessToken) {
          const all = await conferenceScheduleService.getAllConferenceSchedules(accessToken, true);
          setConferences(all);
        }
      } catch (error) {
        console.error("Failed to fetch conferences:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group schedules by time slots and rooms for parallel view
  const getParallelSessions = (conference: BackendConferenceSchedule) => {
    if (!conference.schedules) return {};

    const parallelMap: Record<string, { time: string; sessions: Array<{ schedule: BackendSchedule; room?: BackendRoom }> }> = {};

    conference.schedules.forEach(schedule => {
      const timeKey = schedule.start_time && schedule.end_time
        ? `${schedule.start_time}-${schedule.end_time}`
        : schedule.start_time || schedule.end_time || 'TBD';

      if (!parallelMap[timeKey]) {
        parallelMap[timeKey] = {
          time: timeKey,
          sessions: []
        };
      }

      // If schedule has rooms, create entries for each room
      if (schedule.rooms && schedule.rooms.length > 0) {
        schedule.rooms.forEach(room => {
          parallelMap[timeKey].sessions.push({
            schedule,
            room
          });
        });
      } else {
        // No rooms, just add the schedule
        parallelMap[timeKey].sessions.push({
          schedule
        });
      }
    });

    return parallelMap;
  };

  return (
    <div className="bg-white min-h-screen text-black px-6 lg:px-12 py-8">
      <div className="flex items-center gap-4 mb-6">
        <span className="inline-flex items-center justify-center rounded-md bg-[#FFB84D] p-2">
          <Users className="w-5 h-5 text-white" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-black">Parallel Sessions</h1>
          <p className="text-sm text-gray-600">View parallel conference sessions by time and room</p>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading parallel sessions…</div>
      ) : conferences.length === 0 ? (
        <div className="text-gray-600">No conferences available yet.</div>
      ) : (
        <div className="space-y-8">
          {conferences.map((conference) => {
            const parallelSessions = getParallelSessions(conference);
            const timeKeys = Object.keys(parallelSessions).sort();

            return (
              <div key={conference.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Conference Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{conference.name} - Parallel Sessions</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Year: {conference.year}</span>
                    <span>Type: {conference.type}</span>
                  </div>
                </div>

                {/* Parallel Sessions */}
                {timeKeys.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {timeKeys.map((timeKey) => {
                      const timeSlot = parallelSessions[timeKey];
                      return (
                        <div key={timeKey} className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span className="text-lg font-medium text-gray-900">{timeSlot.time}</span>
                            <Badge variant="outline" className="ml-auto">
                              {timeSlot.sessions.length} session{timeSlot.sessions.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {timeSlot.sessions.map((session, index) => (
                              <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
                                {session.room && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {session.room.name || `Room ${session.room.identifier || session.room.id}`}
                                    </span>
                                  </div>
                                )}

                                <div className="text-sm text-gray-900 mb-2">
                                  {session.schedule.notes || 'No description'}
                                </div>

                                <div className="flex items-center justify-between">
                                  <Badge variant={
                                    session.schedule.type === 'TALK' ? 'default' :
                                    session.schedule.type === 'BREAK' ? 'secondary' : 'outline'
                                  } className="text-xs">
                                    {session.schedule.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {session.schedule.date ? new Date(session.schedule.date).toLocaleDateString() : 'TBD'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No parallel sessions available for this conference yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
