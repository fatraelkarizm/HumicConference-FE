import { useSchedule } from "@/hooks/useSchedule";
import { useRoom } from "@/hooks/useRoom";
import { useTrack } from "@/hooks/useTrack";
import { useTrackSession } from "@/hooks/useTrackSession";
import { useMemo } from "react";
import type { BackendConferenceSchedule } from "@/types";

export function useConferenceTabsData(conference: BackendConferenceSchedule) {
  // Fetch all data
  const { schedules, loading: scheduleLoading, refetch: refetchSchedules } = useSchedule();
  const { rooms, loading: roomsLoading, refetch: refetchRooms } = useRoom();
  const { tracks, loading: tracksLoading, refetch: refetchTracks } = useTrack();
  const { trackSessions, loading: trackSessionsLoading, refetch: refetchTrackSessions } = useTrackSession();

  // ✅ Combine nested schedules from conference and global filtered schedules
  const conferenceSchedules = useMemo(() => {
    const nestedSchedules = conference.schedules && Array.isArray(conference.schedules) ? conference.schedules : [];
    const globalFiltered = schedules.filter(schedule => schedule.conference_schedule_id === conference.id);

    // Combine and deduplicate by id
    const allSchedules = [...nestedSchedules, ...globalFiltered];
    const uniqueSchedules = allSchedules.filter((schedule, index, self) =>
      index === self.findIndex(s => s.id === schedule.id)
    );

    return uniqueSchedules;
  }, [conference, schedules]);

  // ✅ Enhanced room filtering - include nested rooms from schedules
  const conferenceRooms = useMemo(() => {
    const scheduleIds = conferenceSchedules.map(s => s.id);

    // Get rooms from standard rooms list
    const roomsFromApi = rooms.filter(room => scheduleIds.includes(room.schedule_id));

    // ✅ Also extract rooms from nested schedule data
    const roomsFromSchedules: any[] = [];
    conferenceSchedules.forEach(schedule => {
      if ((schedule as any).rooms && Array.isArray((schedule as any).rooms)) {
        roomsFromSchedules.push(...(schedule as any).rooms);
      }
    });

    // Combine and deduplicate
    const allRooms = [...roomsFromApi, ...roomsFromSchedules];
    const uniqueRooms = allRooms.filter((room, index, self) =>
      index === self.findIndex(r => r.id === room.id)
    );

    return uniqueRooms;
  }, [rooms, conferenceSchedules, conference.id]);

  // Filter tracks
  const conferenceTracks = useMemo(() => {
    const trackIds = conferenceRooms.map(room => room.track_id).filter(Boolean);
    const filtered = tracks.filter(track => trackIds.includes(track.id));

    return filtered;
  }, [tracks, conferenceRooms, conference.id]);

  // Filter track sessions
  const conferenceTrackSessions = useMemo(() => {
    const trackIds = conferenceTracks.map(t => t.id);
    const filtered = trackSessions.filter(session => trackIds.includes(session.track_id));

    return filtered;
  }, [trackSessions, conferenceTracks, conference.id]);

  const loading = scheduleLoading || roomsLoading || tracksLoading || trackSessionsLoading;

  // Enhanced refetch
  const refetchAll = async () => {
    try {
      await Promise.all([
        refetchSchedules(),
        refetchRooms(),
        refetchTracks(),
        refetchTrackSessions(),
      ]);
    } catch (error) {
    }
  };

  return {
    schedules: conferenceSchedules,
    rooms: conferenceRooms,
    tracks: conferenceTracks,
    trackSessions: conferenceTrackSessions,
    loading,
    refetchAll,
  };
}