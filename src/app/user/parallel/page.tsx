"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTrack } from '@/hooks/useTrack';
import trackSessionService from '@/services/TrackSessionService';
import conferenceScheduleService from '@/services/ConferenceScheduleService';
import roomService from '@/services/RoomServices';
import scheduleService from '@/services/ScheduleService';
import type { BackendConferenceSchedule, BackendTrackSession, BackendRoom } from '@/types';

interface Paper {
  no: number;
  paperId: string;
  title: string;
  authors: string;
  mode: string;
}

interface Session {
  id: string;
  title: string;
  roomBadge: {
    texts: string[];
    type: string;
  };
  papers: Paper[];
}

const roomNamesFallback = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E'];

const ParallelSessionScheduleContent = () => {
  const searchParams = useSearchParams();
  const conferenceIdParam = searchParams.get('conferenceId');
  const { tracks, loading: tracksLoading, error: tracksError } = useTrack();
  const [parallelSessionsData, setParallelSessionsData] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conferenceSchedules, setConferenceSchedules] = useState<BackendConferenceSchedule[]>([]);
  const [trackSessions, setTrackSessions] = useState<BackendTrackSession[]>([]);
  const [rooms, setRooms] = useState<BackendRoom[]>([]);

  // --- LOGIKA UTAMA YANG DIPERBAIKI ---
  const getRoomNameFromSchedules = React.useCallback((session: BackendTrackSession, schedules: BackendConferenceSchedule[], rooms: BackendRoom[], trackIndex: number) => {
    // Prioritas: Cek langsung di rooms API berdasarkan track_id
    if (rooms && rooms.length > 0) {
      const foundRoom = rooms.find((room) => room.track_id === session.track_id);
      if (foundRoom) {
        return foundRoom.name || "Room Assigned";
      }
    }

    // Fallback: Cek relasi di conferenceSchedules -> schedules -> rooms
    for (const conferenceSchedule of schedules) {
      if (conferenceSchedule.schedules && Array.isArray(conferenceSchedule.schedules)) {
        for (const schedule of conferenceSchedule.schedules) {
          if (schedule.rooms && Array.isArray(schedule.rooms)) {
            const foundRoom = schedule.rooms.find((room) => room.track_id === session.track_id);
            if (foundRoom) {
              return foundRoom.name || "Room Assigned";
            }
          }
        }
      }
    }

    // Fallback terakhir: Ambil dari array manual berdasarkan urutan track
    return roomNamesFallback[trackIndex % roomNamesFallback.length];
  }, []);

  // Fetch track sessions for all tracks
  useEffect(() => {
    const fetchAllTrackSessions = async () => {
      if (tracks.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const accessToken = await trackSessionService.getAccessToken();
        if (!accessToken) throw new Error('Access token not available');

        // 1. Fetch Conference Schedules to identify active conference
        const conferenceSchedulesData = await conferenceScheduleService.getAllConferenceSchedules(accessToken, true);
        setConferenceSchedules(conferenceSchedulesData);

        // 2. Identify target conference (Active one, or latest year as fallback)
        const activeConference = conferenceSchedulesData.find(conf => conf.is_active === true);
        let targetConferenceId: string | undefined;

        if (conferenceIdParam) {
          targetConferenceId = conferenceIdParam;
        } else {
          if (activeConference) {
            targetConferenceId = activeConference.id;
          } else if (conferenceSchedulesData.length > 0) {
            const sorted = [...conferenceSchedulesData].sort((a, b) => parseInt(b.year) - parseInt(a.year));
            targetConferenceId = sorted[0].id;
          }
        }

        // 3. Fetch ALL necessary data separately (Robustness check)
        const [allTrackSessions, allSchedules] = await Promise.all([
          trackSessionService.getAllTrackSessions(accessToken),
          scheduleService.getAllSchedules(accessToken)
        ]);


        // 4. Client-side Filter logic: Chain Filtering (Conf -> Sch -> Room -> Track)
        let filteredSessions = allTrackSessions;
        const validTrackIds = new Set<string>();

        if (targetConferenceId) {
          // A. Find all schedules belonging to the active conference
          let validSchedules = allSchedules.filter((s: any) => s.conference_schedule_id === targetConferenceId);

          if (validSchedules.length === 0) {

            // Group schedules by conference_schedule_id and count
            const conferenceScheduleCounts = new Map<string, number>();
            allSchedules.forEach((s: any) => {
              const confId = s.conference_schedule_id;
              conferenceScheduleCounts.set(confId, (conferenceScheduleCounts.get(confId) || 0) + 1);
            });

            // Find conference with most schedules
            let maxCount = 0;
            let fallbackConferenceId = targetConferenceId;
            conferenceScheduleCounts.forEach((count, confId) => {
              if (count > maxCount) {
                maxCount = count;
                fallbackConferenceId = confId;
              }
            });

            targetConferenceId = fallbackConferenceId;
            validSchedules = allSchedules.filter((s: any) => s.conference_schedule_id === targetConferenceId);
          }

          const validScheduleIds = validSchedules.map((s: any) => s.id);

          const roomsPromises = validScheduleIds.map(scheduleId =>
            roomService.getAllRooms(accessToken, scheduleId).catch(() => [])
          );
          const roomsArrays = await Promise.all(roomsPromises);
          const validRooms = roomsArrays.flat();


          setRooms(validRooms); // Update state with fetched rooms

          validRooms.forEach((room: any) => {
            if (room.track_id) validTrackIds.add(room.track_id);
            if (room.track && room.track.id) validTrackIds.add(room.track.id);
          });


          // D. Filter sessions
          if (validTrackIds.size > 0) {
            filteredSessions = allTrackSessions.filter((session: any) => validTrackIds.has(session.track_id));
          } else {
            filteredSessions = [];
          }
        } else {
          // No target conference, fetch all rooms as fallback
          const allRooms = await roomService.getAllRooms(accessToken);
          setRooms(allRooms);
        }


        setTrackSessions(filteredSessions);
        setLoading(false);

      } catch (err: any) {
        setError(err.message || 'Failed to load parallel sessions');
        setLoading(false);
      }
    };

    fetchAllTrackSessions();
  }, [tracks, conferenceIdParam]);

  useEffect(() => {

    const transformData = () => {
      try {
        const groupedSessions = new Map();

        // Grouping Logic
        trackSessions.forEach(session => {
          const timeKey = `${session.start_time}-${session.end_time}`;
          const track = tracks.find(t => t.id === session.track_id);

          if (!groupedSessions.has(timeKey)) {
            groupedSessions.set(timeKey, {
              timeSlot: timeKey,
              startTime: session.start_time,
              endTime: session.end_time,
              tracks: new Map()
            });
          }

          const timeGroup = groupedSessions.get(timeKey);
          if (!timeGroup.tracks.has(session.track_id)) {
            timeGroup.tracks.set(session.track_id, {
              track: track,
              sessions: []
            });
          }
          timeGroup.tracks.get(session.track_id).sessions.push(session);
        });

        // UI Transformation Logic
        const uiData = Array.from(groupedSessions.values()).map(timeGroup => {
          const sessions: Session[] = [];

          // Kita butuh index untuk fallback room name jika API gagal mapping
          let trackIteratorIndex = 0;

          timeGroup.tracks.forEach((trackData: any) => {
            const { track, sessions: trackSessionsList } = trackData;
            const onlineSessions = trackSessionsList.filter((s: any) => s.mode === 'ONLINE');
            const onsiteSessions = trackSessionsList.filter((s: any) => s.mode === 'ONSITE');

            // --- ONLINE SESSION ---
            if (onlineSessions.length > 0) {
              // Ambil nama ruangan untuk online sessions juga
              const roomName = getRoomNameFromSchedules(
                onlineSessions[0],
                conferenceSchedules,
                rooms,
                trackIteratorIndex
              );

              // Format Badge Texts: ["Track Name", "Room Name"]
              const badgeTexts = [
                track?.name || 'Unknown Track',
                roomName || 'Online'
              ];

              sessions.push({
                id: `${timeGroup.timeSlot}-${track?.id}-online`,
                title: `Parallel Session (${timeGroup.startTime} - ${timeGroup.endTime})`,
                roomBadge: {
                  texts: badgeTexts,
                  type: 'light-blue'
                },
                papers: onlineSessions.map((session: any, index: number) => ({
                  no: index + 1,
                  paperId: session.paper_id,
                  title: session.title,
                  authors: session.authors,
                  mode: 'Online'
                }))
              });
            }

            // --- ONSITE SESSION ---
            if (onsiteSessions.length > 0) {
              const roomName = getRoomNameFromSchedules(
                onsiteSessions[0],
                conferenceSchedules,
                rooms,
                trackIteratorIndex
              );

              const badgeTexts = [
                track?.name || 'Unknown Track',
                roomName
              ];

              sessions.push({
                id: `${timeGroup.timeSlot}-${track?.id}-onsite`,
                title: `Parallel Session (${timeGroup.startTime} - ${timeGroup.endTime})`,
                roomBadge: {
                  texts: badgeTexts,
                  type: 'blue'
                },
                papers: onsiteSessions.map((session: any, index: number) => ({
                  no: index + 1,
                  paperId: session.paper_id,
                  title: session.title,
                  authors: session.authors,
                  mode: roomName // Tampilkan Room Name juga di kolom mode jika perlu
                }))
              });
            }

            trackIteratorIndex++;
          });

          return sessions;
        }).flat();

        setParallelSessionsData(uiData);

      } catch (err: any) {
        setError(err.message || 'Failed to transform parallel sessions data');
      }
    };

    transformData();
  }, [tracks, conferenceSchedules, trackSessions, rooms, getRoomNameFromSchedules]); // Dependencies

  if (tracksLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className=" mx-auto mt-2 text-gray-600">Loading Parallel Sessions...</p>
      </div>
    );
  }

  if (tracksError || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Error Loading Data</h2>
          <p className="text-gray-600">{tracksError || error}</p>
        </div>
      </div>
    );
  }

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'blue': return "bg-blue-100 text-blue-600";
      case 'light-blue': return "bg-sky-100 text-sky-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const filteredSessionsData = parallelSessionsData.map(session => ({
    ...session,
    papers: session.papers.filter(paper =>
      paper.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.paperId?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(session => session.papers.length > 0);

  const renderAuthors = (authorsStr: string) => {
    if (!authorsStr) return "-";
    return authorsStr.split(';').map((author: string, index: number) => (
      <div key={index} className={index > 0 ? "mt-1" : ""}>
        {author.trim()}{index < authorsStr.split(';').length - 1 ? ';' : ''}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Parallel Session Schedule</h1>
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Paper, Name Author/Presenter"
              className="w-full pl-5 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm bg-white text-slate-600 placeholder-slate-400 transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
              <Search size={20} />
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {filteredSessionsData.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b border-gray-100 bg-gray-50/30">
                <h2 className="text-xl font-bold text-slate-800">
                  {session.title}
                </h2>
                {/* Badge Room Disini */}
                {session.roomBadge.texts.map((text, index) => (
                  <span key={index} className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(session.roomBadge.type)} ${index < session.roomBadge.texts.length - 1}`}>
                    {text}
                  </span>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-6 font-medium w-16">No</th>
                      <th className="py-4 px-6 font-medium w-32">Paper ID</th>
                      <th className="py-4 px-6 font-medium w-1/4">Title</th>
                      <th className="py-4 px-6 font-medium">Authors with affiliation and country</th>
                      <th className="py-4 px-6 font-medium w-32">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {session.papers.map((paper: Paper, pIndex: number) => (
                      <tr key={pIndex} className="hover:bg-gray-50/30 transition-colors align-top">
                        <td className="py-5 px-6 text-slate-500 font-medium">{paper.no}</td>
                        <td className="py-5 px-6 text-slate-500 font-medium">{paper.paperId}</td>
                        <td className="py-5 px-6 font-bold text-slate-700 leading-snug pr-8">
                          {paper.title}
                        </td>
                        <td className="py-5 px-6 text-slate-600 leading-relaxed pr-8">
                          {renderAuthors(paper.authors)}
                        </td>
                        <td className="py-5 px-6 text-slate-500 font-medium">{paper.mode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ParallelSessionSchedulePage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ParallelSessionScheduleContent />
    </React.Suspense>
  );
}