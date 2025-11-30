import { useSchedule } from "@/hooks/useSchedule";
import { useRoom } from "@/hooks/useRoom";
import { useTrack } from "@/hooks/useTrack";
import { useTrackSession } from "@/hooks/useTrackSession";
import { useMemo } from "react";

export function useConferenceTabsData(conferenceId: string) {
  // Fetch all data
  const { schedules, loading: scheduleLoading, refetch: refetchSchedules } = useSchedule();
  const { rooms, loading: roomsLoading, refetch: refetchRooms } = useRoom();
  const { tracks, loading: tracksLoading, refetch: refetchTracks } = useTrack();
  const { trackSessions, loading: trackSessionsLoading, refetch: refetchTrackSessions } = useTrackSession();

  // Debug logging
  console.log('🔍 useConferenceTabsData Dynamic Debug:');
  console.log('- Conference ID:', conferenceId);
  console.log('- Total schedules:', schedules.length);
  console.log('- Total rooms:', rooms.length);

  // ✅ Filter schedules for this conference with better logging
  const conferenceSchedules = useMemo(() => {
    const filtered = schedules.filter(schedule => {
      const matches = schedule.conference_schedule_id === conferenceId;
      return matches;
    });
    
    console.log(`✅ Conference ${conferenceId} has ${filtered.length} schedules`);
    
    // ✅ Log detailed schedule info
    if (filtered.length > 0) {
      console.log('✅ Conference schedules:', filtered. map(s => ({
        id: s.id,
        date: s.date,
        time: `${s.start_time}-${s.end_time}`,
        notes: s.notes,
        hasRooms: (s as any).rooms ?  (s as any).rooms.length : 0
      })));
    }
    
    if (filtered.length === 0) {
      console.log(`⚠️ No schedules found for conference ${conferenceId}`);
      console.log('Available conference_schedule_ids in data:', 
        [... new Set(schedules.map(s => s.conference_schedule_id))]);
    }
    
    return filtered;
  }, [schedules, conferenceId]);

  // ✅ Enhanced room filtering - include nested rooms from schedules
  const conferenceRooms = useMemo(() => {
    const scheduleIds = conferenceSchedules.map(s => s.id);
    
    // Get rooms from standard rooms list
    const roomsFromApi = rooms.filter(room => scheduleIds.includes(room.schedule_id));
    
    // ✅ Also extract rooms from nested schedule data
    const roomsFromSchedules: any[] = [];
    conferenceSchedules.forEach(schedule => {
      if ((schedule as any).rooms && Array. isArray((schedule as any).rooms)) {
        roomsFromSchedules.push(...(schedule as any).rooms);
      }
    });
    
    // Combine and deduplicate
    const allRooms = [...roomsFromApi, ...roomsFromSchedules];
    const uniqueRooms = allRooms.filter((room, index, self) => 
      index === self.findIndex(r => r.id === room.id)
    );
    
    console.log(`✅ Conference ${conferenceId} has ${uniqueRooms.length} rooms`);
    console.log('✅ Room details:', uniqueRooms. map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      schedule_id: r.schedule_id
    })));
    
    return uniqueRooms;
  }, [rooms, conferenceSchedules, conferenceId]);

  // Filter tracks
  const conferenceTracks = useMemo(() => {
    const trackIds = conferenceRooms.map(room => room.track_id). filter(Boolean);
    const filtered = tracks.filter(track => trackIds.includes(track.id));
    
    console.log(`✅ Conference ${conferenceId} has ${filtered.length} tracks`);
    return filtered;
  }, [tracks, conferenceRooms, conferenceId]);

  // Filter track sessions
  const conferenceTrackSessions = useMemo(() => {
    const trackIds = conferenceTracks.map(t => t.id);
    const filtered = trackSessions.filter(session => trackIds. includes(session.track_id));
    
    console.log(`✅ Conference ${conferenceId} has ${filtered.length} track sessions`);
    return filtered;
  }, [trackSessions, conferenceTracks, conferenceId]);

  const loading = scheduleLoading || roomsLoading || tracksLoading || trackSessionsLoading;

  // Enhanced refetch
  const refetchAll = async () => {
    console.log(`🔄 Force refetching ALL data for conference: ${conferenceId}`);
    
    try {
      await Promise.all([
        refetchSchedules(),
        refetchRooms(),
        refetchTracks(),
        refetchTrackSessions(),
      ]);
      
      console.log('✅ All data refetched successfully');
    } catch (error) {
      console.error('❌ Error refetching data:', error);
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