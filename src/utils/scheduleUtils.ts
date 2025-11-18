import {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
  ProcessedConferenceSchedule,
  ScheduleItem,
  DaySchedule,
  NewScheduleData
} from '@/types/schedule';

export class ScheduleProcessor {
  static processConferenceSchedule(data: BackendConferenceSchedule): ProcessedConferenceSchedule {
    const schedules = data.schedules || [];

    const result: ProcessedConferenceSchedule = {
      id: data.id,
      name: data.name,
      description: data.description,
      year: data.year,
      startDate: this.formatDate(data.start_date),
      endDate: this.formatDate(data.end_date),
      type: data.type,
      contactEmail: data.contact_email,
      timezone: data.timezone_iana,
      onsiteLocation: data.onsite_presentation,
      onlineLocation: data.online_presentation,
      notes: data.notes,
      noShowPolicy: data.no_show_policy,
      days: schedules.length > 0 ? this.buildDaysFromSchedules(schedules) : [],
    };

    return result;
  }

  private static buildDaysFromSchedules(schedules: BackendSchedule[]): DaySchedule[] {
    const schedulesByDate = this.groupSchedulesByDate(schedules);
    const sortedDates = Array.from(schedulesByDate.keys()).sort();

    return sortedDates.map((date: string, index: number) => {
      const items = schedulesByDate.get(date)!;

      // ✅ FIX: Sort by start_time instead of startTime
      items.sort((a: ScheduleItem, b: ScheduleItem) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });

      return {
        date,
        dayNumber: index + 1,
        dayTitle: this.generateDayTitle(date, index + 1),
        items,
      };
    });
  }

  private static groupSchedulesByDate(schedules: BackendSchedule[]): Map<string, ScheduleItem[]> {
    const schedulesByDate = new Map<string, ScheduleItem[]>();

    schedules.forEach((schedule: BackendSchedule) => {
      const formattedDate = this.formatDate(schedule.date);

      if (!schedulesByDate.has(formattedDate)) {
        schedulesByDate.set(formattedDate, []);
      }

      const items = this.createScheduleItems(schedule, formattedDate);
      schedulesByDate.get(formattedDate)!.push(...items);
    });

    return schedulesByDate;
  }

  private static createScheduleItems(schedule: BackendSchedule, formattedDate: string): ScheduleItem[] {

    if (schedule.rooms && schedule.rooms.length > 0) {
      const mainRooms = schedule.rooms.filter((room: BackendRoom) => room.type === 'MAIN');
      const parallelRooms = schedule.rooms.filter((room: BackendRoom) => room.type === 'PARALLEL');

      return [{
        id: schedule.id,
        title: this.getScheduleTitle(schedule, mainRooms[0]),
        description: schedule.notes,
        speaker: this.extractSpeaker(schedule, mainRooms[0] || parallelRooms[0]),
        location: this.getLocationFromSchedule(schedule),
        conference: undefined, // Will be set by parent component
        date: formattedDate,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        timeDisplay: this.createTimeDisplay(schedule.start_time, schedule.end_time),
        type: schedule.type,
        scheduleType: schedule.type,
        rooms: schedule.rooms, // ✅ Include all rooms
        track: mainRooms[0]?.track || parallelRooms[0]?.track,
        moderator: this.extractModerator(mainRooms[0]?.description || parallelRooms[0]?.description),
        roomName: mainRooms[0]?.name,
        roomIdentifier: mainRooms[0]?.identifier,
        onlineUrl: mainRooms[0]?.online_meeting_url || parallelRooms[0]?.online_meeting_url,
      }];
    }

    // ✅ FIX: Handle schedules without rooms (like breaks)
    return [{
      id: schedule.id,
      title: this.getScheduleTitleFromType(schedule.type, schedule.notes),
      description: schedule.notes,
      location: 'All Areas',
      conference: undefined,
      date: formattedDate,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      timeDisplay: this.createTimeDisplay(schedule.start_time, schedule.end_time),
      type: schedule.type,
      scheduleType: schedule.type,
      rooms: [],
    }];
  }

  // ✅ NEW: Get title from schedule and main room
  private static getScheduleTitle(schedule: BackendSchedule, mainRoom?: BackendRoom): string {
    // Priority: main room description > schedule notes > default title
    if (mainRoom?.description) {
      return mainRoom.description;
    }

    if (schedule.notes) {
      return schedule.notes;
    }

    return this.getScheduleTitleFromType(schedule.type, schedule.notes);
  }

  // ✅ NEW: Extract speaker from room or schedule
  private static extractSpeaker(schedule: BackendSchedule, room?: BackendRoom): string | undefined {
    if (!room) return undefined;

    // Look for speaker names in description
    const description = room.description || '';

    // Pattern for extracting speaker name from descriptions like:
    // "Speech by IEEE IS Representative: Prof. Dr. Ir. Gamantyo Hendrantoro"
    const speechMatch = description.match(/(?:Speech by|Keynote by|by)\s*(?:[^:]*:)?\s*([^,\n.]+)/i);
    if (speechMatch) {
      return speechMatch[1].trim();
    }

    // Look for moderator as fallback
    const moderatorMatch = description.match(/Moderator:\s*([^,\n.]+)/i);
    if (moderatorMatch) {
      return moderatorMatch[1].trim();
    }

    return room.track?.name;
  }

  // ✅ Extract moderator from description
  private static extractModerator(description?: string): string | undefined {
    if (!description) return undefined;

    // Look for patterns like "Moderator: Name" or "Moderator: Dr. Name"
    const moderatorMatch = description.match(/Moderator:\s*([^,\n.]+)/i);
    return moderatorMatch ? moderatorMatch[1].trim() : undefined;
  }

  // ✅ NEW: Get location from entire schedule
  private static getLocationFromSchedule(schedule: BackendSchedule): string {
    if (!schedule.rooms || schedule.rooms.length === 0) {
      return 'All Areas';
    }

    const mainRoom = schedule.rooms.find((room: BackendRoom) => room.type === 'MAIN');
    if (mainRoom) {
      return mainRoom.online_meeting_url ?
        `${mainRoom.name} (Online)` :
        mainRoom.name;
    }

    const parallelRooms = schedule.rooms.filter((room: BackendRoom) => room.type === 'PARALLEL');
    if (parallelRooms.length > 0) {
      return `${parallelRooms.length} Parallel Sessions`;
    }

    return 'Conference Hall';
  }

  static mapBackendScheduleToItem(schedule: BackendSchedule, data: Partial<NewScheduleData>): ScheduleItem {
    const mainRoom = schedule.rooms?.find((room: BackendRoom) => room.type === 'MAIN');
    const firstRoom = schedule.rooms?.[0];

    return {
      id: schedule.id,
      title: data.title || this.getScheduleTitle(schedule, mainRoom),
      description: data.description || schedule.notes,
      speaker: data.speaker || this.extractSpeaker(schedule, mainRoom || firstRoom),
      location: data.location || this.getLocationFromSchedule(schedule),
      conference: data.conference,
      date: this.formatDate(schedule.date),
      startTime: data.startTime || schedule.start_time,
      endTime: data.endTime || schedule.end_time,
      timeDisplay: this.createTimeDisplay(
        data.startTime || schedule.start_time,
        data.endTime || schedule.end_time
      ),
      type: schedule.type,
      scheduleType: data.scheduleType || schedule.type,
      dayNumber: data.dayNumber,
      dayTitle: data.dayTitle,
      rooms: schedule.rooms || [],
      track: mainRoom?.track || firstRoom?.track,
      moderator: this.extractModerator(mainRoom?.description || firstRoom?.description),
      roomName: mainRoom?.name || firstRoom?.name,
      roomIdentifier: mainRoom?.identifier || firstRoom?.identifier,
      onlineUrl: mainRoom?.online_meeting_url || firstRoom?.online_meeting_url,
    };
  }

  private static getLocationFromRoom(room?: BackendRoom): string {
    if (!room) return 'All Areas';

    // Prefer online URL if available
    if (room.online_meeting_url) {
      return `${room.name} (Online)`;
    }

    return room.type === 'MAIN' ? 'Main Room' : `${room.name}`;
  }

  // ✅ RENAMED: More specific method name
  private static getScheduleTitleFromType(type: string, notes?: string): string {
    // Check notes for specific content
    if (notes) {
      const lowerNotes = notes.toLowerCase();
      if (lowerNotes.includes('coffee break')) return 'Coffee Break';
      if (lowerNotes.includes('lunch break')) return 'Lunch Break + ISOMA';
      if (lowerNotes.includes('opening')) return 'Opening Ceremony';
      if (lowerNotes.includes('closing')) return 'Closing Ceremony';
      if (lowerNotes.includes('registration')) return 'Registration';
      if (lowerNotes.includes('break')) return 'Break';
    }

    switch (type) {
      case 'BREAK': return 'Break';
      case 'ONE_DAY_ACTIVITY': return 'Activity Session';
      case 'TALK': return 'Conference Session';
      default: return 'Schedule Item';
    }
  }

  private static formatDate(isoString: string): string {
    try {
      const date = new Date(isoString);

      // ✅ FIX: Handle timezone properly
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      // ✅ FIX: Safer fallback
      return isoString.includes('T') ? isoString.split('T')[0] : isoString;
    }
  }

  private static generateDayTitle(date: string, dayNumber: number): string {
    try {
      // ✅ FIX: Better date parsing
      const dateObj = new Date(date + 'T12:00:00Z'); // Use noon to avoid timezone issues

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const day = dateObj.getUTCDate();
      const month = monthNames[dateObj.getUTCMonth()];
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

      return `${weekday}, ${day} ${month}`;
    } catch (error) {
      return `Day ${dayNumber}: ${date}`;
    }
  }

  private static createTimeDisplay(startTime?: string, endTime?: string): string {
    if (!startTime && !endTime) return '';
    if (!startTime) return `Until ${endTime}`;
    if (!endTime) return `From ${startTime}`;

    // ✅ FIX: Format time display consistently
    const formatTime = (time: string) => time.substring(0, 5); // HH:MM
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
}

// ✅ FIX: More robust role mapping
export const mapUserRoleToConference = (role: string): 'ICICYTA' | 'ICODSA' => {
  const roleUpper = role?.toUpperCase() || '';

  if (roleUpper.includes('ICICYTA') || roleUpper.includes('ADMIN_ICICYTA')) {
    return 'ICICYTA';
  }

  if (roleUpper.includes('ICODSA') || roleUpper.includes('ADMIN_ICODSA')) {
    return 'ICODSA';
  }

  // Default fallback
  return 'ICICYTA';
};

// ✅ FIX: Better conference finding logic
export const findConferenceByType = (
  conferences: BackendConferenceSchedule[],
  conferenceType?: string
): BackendConferenceSchedule | null => {

  if (!conferenceType) {
    const defaultConf = conferences.find((conf: BackendConferenceSchedule) => conf.type === 'ICICYTA');
    return defaultConf || conferences[0] || null;
  }

  // ✅ FIX: More flexible type matching
  const typeUpper = conferenceType.toUpperCase();
  let targetType: 'ICICYTA' | 'ICODSA' = 'ICICYTA';

  if (typeUpper === 'ICICYTA' || typeUpper === 'ICYCTA' || typeUpper.includes('ICICYTA')) {
    targetType = 'ICICYTA';
  } else if (typeUpper === 'ICODSA' || typeUpper === 'ICODSA' || typeUpper.includes('ICODSA')) {
    targetType = 'ICODSA';
  }

  const found = conferences.find((conf: BackendConferenceSchedule) => conf.type === targetType);

  if (found) {
  } else {
  }

  return found || null;
};


