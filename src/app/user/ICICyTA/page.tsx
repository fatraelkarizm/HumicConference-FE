"use client";

import React, { useEffect, useState } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import type { BackendConferenceSchedule } from "@/types";
import Link from "next/link";

export default function ICICyTAPage() {
  const [conferences, setConferences] = useState<BackendConferenceSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const accessToken = await conferenceScheduleService.getAccessToken();
        if (accessToken) {
          const all = await conferenceScheduleService.getAllConferenceSchedules(accessToken, true);
          // Filter only ICICyTA conferences that are active
          const icicytaConferences = all.filter(conf => conf.type === 'ICICYTA' && conf.is_active !== false);
          setConferences(icicytaConferences);
        }
      } catch (error) {
        console.error("Failed to fetch conferences:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white min-h-screen text-black px-6 lg:px-12 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center rounded-md bg-[#FFB84D] p-2">
            <CalendarDaysIcon className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-black">Schedule ICICyTA</h1>
            <p className="text-sm text-gray-600">Public schedule — read only</p>
          </div>
        </div>
        <Link href="/user/parallel">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Parallel Sessions
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading conferences…</div>
      ) : conferences.length === 0 ? (
        <div className="text-gray-600">No conferences available yet.</div>
      ) : (
        <div className="space-y-8">
          {conferences.map((conference) => (
            <div key={conference.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Conference Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{conference.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Year: {conference.year}</span>
                  {conference.start_date && conference.end_date && (
                    <span>
                      {new Date(conference.start_date).toLocaleDateString()} - {new Date(conference.end_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {conference.description && (
                  <p className="text-sm text-gray-700 mt-2">{conference.description}</p>
                )}
              </div>

              {/* Schedule Table */}
              {conference.schedules && conference.schedules.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {conference.schedules
                        .sort((a, b) => {
                          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                          if (dateCompare !== 0) return dateCompare;
                          return (a.start_time || '').localeCompare(b.start_time || '');
                        })
                        .map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {schedule.start_time && schedule.end_time
                                    ? `${schedule.start_time} - ${schedule.end_time}`
                                    : schedule.start_time || schedule.end_time || 'TBD'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {schedule.date ? new Date(schedule.date).toLocaleDateString() : 'TBD'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {schedule.notes || 'No activity description'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={
                              schedule.type === 'TALK' ? 'default' :
                              schedule.type === 'BREAK' ? 'secondary' : 'outline'
                            }>
                              {schedule.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {schedule.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No schedule available for this conference yet.
                </div>
              )}

              {/* Conference Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {conference.contact_email && (
                    <div>
                      <span className="font-medium text-gray-700">Contact:</span>
                      <span className="ml-2 text-gray-600">{conference.contact_email}</span>
                    </div>
                  )}
                  {conference.timezone_iana && (
                    <div>
                      <span className="font-medium text-gray-700">Timezone:</span>
                      <span className="ml-2 text-gray-600">{conference.timezone_iana}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}