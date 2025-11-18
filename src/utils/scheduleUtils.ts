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
    
    console.log(`🔍 Processing ${data.name} with ${schedules.length} schedules`);

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

    console.log(`✅ Processed conference: ${result.days.length} days, ${result.days.reduce((sum, day) => sum + day.items.length, 0)} total items`);
    return result;
  }

  private static buildDaysFromSchedules(schedules: BackendSchedule[]): DaySchedule[] {
    const schedulesByDate = this.groupSchedulesByDate(schedules);
    const sortedDates = Array.from(schedulesByDate.keys()).sort();
    
    return sortedDates.map((date, index) => {
      const items = schedulesByDate.get(date)!;
      
      items.sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
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

    schedules.forEach(schedule => {
      const formattedDate = this.formatDate(schedule.date);
      
      if (!schedulesByDate.has(formattedDate)) {
        schedulesByDate.set(formattedDate, []);
      }

      const items = this.createScheduleItems(schedule, formattedDate);
      schedulesByDate.get(formattedDate)!.push(...items);
    });

    return schedulesByDate;
  }

  // ✅ Enhanced mapping logic based on backend data structure
  private static createScheduleItems(schedule: BackendSchedule, formattedDate: string): ScheduleItem[] {
    console.log(`📋 Processing schedule ${schedule.id} (${schedule.type}) with ${schedule.rooms?.length || 0} rooms`);

    // If schedule has rooms, create items per room
    if (schedule.rooms && schedule.rooms.length > 0) {
      return schedule.rooms.map(room => {
        console.log(`  └─ Creating item for room: ${room.name} (${room.type})`);
        
        return {
          id: `${schedule.id}-${room.id}`,
          // ✅ Title = room.description (contains moderator info)
          title: room.description || room.name || 'Schedule Item',
          // ✅ Description = room notes or schedule notes
          description: schedule.notes || room.description,
          // ✅ Speaker = track.name (subject/topic, not person name)
          speaker: room.track?.name,
          // ✅ Location = online_meeting_url if available, otherwise room name
          location: room.online_meeting_url || this.getLocationFromRoom(room),
          conference: undefined, // Will be set by parent component
          date: formattedDate,
          startTime: room.start_time || schedule.start_time,
          endTime: room.end_time || schedule.end_time,
          timeDisplay: this.createTimeDisplay(
            room.start_time || schedule.start_time,
            room.end_time || schedule.end_time
          ),
          type: schedule.type,
          scheduleType: room.type,
          rooms: [room],
          track: room.track,
          // ✅ Additional metadata for detail modal
          moderator: this.extractModerator(room.description),
          roomName: room.name,
          roomIdentifier: room.identifier,
          onlineUrl: room.online_meeting_url,
        };
      });
    }

    // If no rooms, create a single item for the schedule
    console.log(`  └─ Creating general item for schedule (no rooms)`);
    return [{
      id: schedule.id,
      title: this.getScheduleTitle(schedule.type, schedule.notes),
      description: schedule.notes,
      location: 'All Areas',
      conference: undefined,
      date: formattedDate,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      timeDisplay: this.createTimeDisplay(schedule.start_time, schedule.end_time),
      type: schedule.type,
      scheduleType: schedule.type,
    }];
  }

  // ✅ Extract moderator from description
  private static extractModerator(description?: string): string | undefined {
    if (!description) return undefined;
    
    // Look for patterns like "Moderator: Name" or "Moderator: Dr. Name"
    const moderatorMatch = description.match(/Moderator:\s*([^,\n.]+)/i);
    return moderatorMatch ? moderatorMatch[1].trim() : undefined;
  }

  static mapBackendScheduleToItem(schedule: BackendSchedule, data: Partial<NewScheduleData>): ScheduleItem {
    const room = schedule.rooms?.[0];
    
    return {
      id: schedule.id,
      title: data.title || room?.description || room?.name || 'Schedule Item',
      description: data.description,
      speaker: data.speaker || room?.track?.name,
      location: data.location || room?.online_meeting_url || this.getLocationFromRoom(room),
      conference: data.conference,
      date: this.formatDate(schedule.date),
      startTime: data.startTime || schedule.start_time,
      endTime: data.endTime || schedule.end_time,
      timeDisplay: this.createTimeDisplay(
        data.startTime || schedule.start_time,
        data.endTime || schedule.end_time
      ),
      type: schedule.type,
      scheduleType: data.scheduleType || room?.type,
      dayNumber: data.dayNumber,
      dayTitle: data.dayTitle,
      rooms: schedule.rooms,
      track: room?.track,
      moderator: this.extractModerator(room?.description),
      roomName: room?.name,
      roomIdentifier: room?.identifier,
      onlineUrl: room?.online_meeting_url,
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

  private static getScheduleTitle(type: string, notes?: string): string {
    switch (type) {
      case 'BREAK': return notes?.includes('Coffee') ? 'Coffee Break' : 'Break';
      case 'ONE_DAY_ACTIVITY': return notes?.includes('Tour') ? 'One Day Tour' : 'Activity';
      case 'TALK': return 'Conference Session';
      default: return 'Schedule Item';
    }
  }

  private static formatDate(isoString: string): string {
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return isoString.split('T')[0];
    }
  }

  private static generateDayTitle(date: string, dayNumber: number): string {
    try {
      const dateObj = new Date(date + 'T00:00:00Z');
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const day = dateObj.getUTCDate();
      const month = monthNames[dateObj.getUTCMonth()];

      return `Day ${dayNumber}: ${day} ${month}`;
    } catch (error) {
      console.error('Day title generation error:', error);
      return `Day ${dayNumber}: ${date}`;
    }
  }

  private static createTimeDisplay(startTime?: string, endTime?: string): string {
    if (!startTime && !endTime) return '';
    if (!startTime) return `Until ${endTime}`;
    if (!endTime) return `From ${startTime}`;
    return `${startTime} - ${endTime}`;
  }
}

export const mapUserRoleToConference = (role: string): 'ICICYTA' | 'ICODSA' => {
  if (role === 'ADMIN_ICICYTA') return 'ICICYTA';
  if (role === 'ADMIN_ICODSA') return 'ICODSA';
  return 'ICICYTA';
};

export const findConferenceByType = (
  conferences: BackendConferenceSchedule[], 
  conferenceType?: string
): BackendConferenceSchedule | null => {
  console.log('🔍 Finding conference by type:', conferenceType);
  
  let targetType: 'ICICYTA' | 'ICODSA' = 'ICICYTA';
  
  if (conferenceType?.toUpperCase() === 'ICICYTA' || conferenceType === 'ICICyTA') {
    targetType = 'ICICYTA';
  } else if (conferenceType?.toUpperCase() === 'ICODSA' || conferenceType === 'ICoDSA') {
    targetType = 'ICODSA';
  }
  
  const found = conferences.find(conf => conf.type === targetType);
  
  if (found) {
    console.log('✅ Found conference:', found.name, 'ID:', found.id);
  } else {
    console.log('❌ Conference not found. Available types:', conferences.map(c => c.type));
  }
  
  return found || null;
};