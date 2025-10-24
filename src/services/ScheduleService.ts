import {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
  BackendTrack,
  BackendApiResponse,
  ProcessedConferenceSchedule,
  ProcessedScheduleItem,
  DaySchedule
} from '@/types/schedule';

class ScheduleService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  }
  // Add this method to ScheduleService class

  private createFallbackData(): ProcessedConferenceSchedule {
    return {
      id: 'fallback-icicyta',
      name: 'ICICyTA 2024 Conference Program',
      description: '17th - 19th December 2024 (Hybrid)',
      year: '2024',
      startDate: '2024-12-17',
      endDate: '2024-12-19',
      type: 'ICICYTA',
      contactEmail: 'icicyta@telkomuniversity.ac.id',
      timezone: 'Indonesian Time (WITA) (GMT+8)',
      onsiteLocation: 'THE EVITEL RESORT UBUD, BALI, INDONESIA',
      onlineLocation: 'ZOOM MEETING',
      noShowPolicy: 'Please take note that IEEE has a strict policy on No-Show.',
      days: [
        {
          date: '2024-12-17',
          dayNumber: 1,
          dayTitle: 'Day 1: 17 December',
          items: [
            {
              id: 'fallback-1',
              title: 'Registration',
              description: 'Open Registration Onsite Day 1',
              location: 'Main Room',
              date: '2024-12-17',
              startTime: '08:30',
              endTime: '09:00',
              timeDisplay: '08:30 - 09:00',
              type: 'TALK',
              scheduleType: 'MAIN'
            },
            {
              id: 'fallback-2',
              title: 'Opening Performance',
              description: 'Live dance Tari Sekar Jagad',
              location: 'Main Room',
              date: '2024-12-17',
              startTime: '09:00',
              endTime: '09:10',
              timeDisplay: '09:00 - 09:10',
              type: 'TALK',
              scheduleType: 'MAIN'
            },
            {
              id: 'fallback-3',
              title: 'Keynote Speech #1',
              description: 'Prof. Kazutaka Shimada - Sentiment Analysis with Language Models',
              location: 'Main Room',
              date: '2024-12-17',
              startTime: '09:30',
              endTime: '10:30',
              timeDisplay: '09:30 - 10:30',
              type: 'TALK',
              scheduleType: 'MAIN'
            }
          ]
        },
        {
          date: '2024-12-18',
          dayNumber: 2,
          dayTitle: 'Day 2: 18 December',
          items: [
            {
              id: 'fallback-4',
              title: 'Coffee Break',
              description: 'Networking and refreshments',
              location: 'All Areas',
              date: '2024-12-18',
              startTime: '16:15',
              endTime: '16:25',
              timeDisplay: '16:15 - 16:25',
              type: 'BREAK',
              scheduleType: 'BREAK'
            }
          ]
        },
        {
          date: '2024-12-19',
          dayNumber: 3,
          dayTitle: 'Day 3: 19 December',
          items: [
            {
              id: 'fallback-5',
              title: 'One Day Tour',
              description: 'Botanical Garden -> Handara Gate -> Beratan Lake',
              location: 'Tour Bus',
              date: '2024-12-19',
              timeDisplay: 'Full Day',
              type: 'ONE_DAY_ACTIVITY',
              scheduleType: 'ACTIVITY'
            }
          ]
        }
      ]
    };
  }

  // Update getConferenceSchedule method
  async getConferenceSchedule(conferenceType: 'ICICYTA' | 'ICODSA'): Promise<ProcessedConferenceSchedule> {
    try {
      console.log('🔍 Getting conference schedule for:', conferenceType);

      const allSchedules = await this.getAllConferenceSchedules();
      console.log('📊 Total conferences found:', allSchedules.length);

      if (allSchedules.length === 0) {
        console.log('⚠️ No data from backend, using fallback data');
        return this.createFallbackData();
      }

      const matchingSchedules = allSchedules.filter(schedule => schedule.type === conferenceType);
      console.log('📊 Matching conferences:', matchingSchedules.length);

      if (matchingSchedules.length === 0) {
        console.log('⚠️ No matching conference found, using fallback data');
        return this.createFallbackData();
      }

      let selectedSchedule = matchingSchedules.find(schedule =>
        schedule.schedules && schedule.schedules.length > 0
      );

      if (!selectedSchedule) {
        console.log('⚠️ No schedule with items found, using fallback data');
        return this.createFallbackData();
      }

      console.log('✅ Selected schedule:', selectedSchedule.name);
      console.log('✅ Schedule items:', selectedSchedule.schedules?.length || 0);

      return await this.processConferenceSchedule(selectedSchedule);

    } catch (error) {
      console.error('❌ Error getting conference schedule, using fallback:', error);
      return this.createFallbackData();
    }
  }
  private async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.data?.accessToken || null;
    } catch (error) {
      return null;
    }
  }

  private formatDate(isoString: string): string {
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', isoString);
      return isoString.split('T')[0];
    }
  }

  private generateDayTitle(date: string, dayNumber: number): string {
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

  private createTimeDisplay(startTime?: string, endTime?: string): string {
    if (!startTime && !endTime) return '';
    if (!startTime) return `Until ${endTime}`;
    if (!endTime) return `From ${startTime}`;
    return `${startTime} - ${endTime}`;
  }

  private getScheduleTitle(type: string, notes?: string): string {
    switch (type) {
      case 'BREAK':
        return notes?.includes('Coffee') ? 'Coffee Break' : 'Break';
      case 'ONE_DAY_ACTIVITY':
        return notes?.includes('Tour') ? 'One Day Tour' : 'Activity';
      case 'TALK':
        return 'Conference Session';
      default:
        return 'Schedule Item';
    }
  }

  async getAllConferenceSchedules(): Promise<BackendConferenceSchedule[]> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${this.baseUrl}/api/v1/conference-schedule?include_relation[0]=schedules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result: BackendApiResponse<BackendConferenceSchedule[]> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to fetch conference schedules');
      }

      const schedules = Array.isArray(result.data) ? result.data : [];

      schedules.forEach(schedule => {
        console.log(`📊   - ${schedule.name} (${schedule.type}): ${schedule.schedules?.length || 0} schedules`);
      });

      return schedules;
    } catch (error) {
      console.error('❌ Error fetching conference schedules:', error);
      throw error;
    }
  }

  private async processConferenceSchedule(data: BackendConferenceSchedule): Promise<ProcessedConferenceSchedule> {
    const schedules: BackendSchedule[] = data.schedules || [];

    console.log('🔍 DEBUG: Processing conference schedule');
    console.log('📋 Conference:', data.name, '(ID:', data.id + ')');
    console.log('📋 Raw schedules count:', schedules.length);

    if (!schedules || schedules.length === 0) {
      console.log('⚠️ No schedules found in data');
      return {
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
        days: [],
      };
    }

    const schedulesByDate = new Map<string, ProcessedScheduleItem[]>();
    let totalItemsCreated = 0;

    schedules.forEach((schedule: BackendSchedule, index: number) => {
      console.log(`\n🔍 Processing schedule ${index + 1}/${schedules.length}:`);
      console.log('  - ID:', schedule.id);
      console.log('  - Date:', schedule.date);
      console.log('  - Type:', schedule.type);
      console.log('  - Start:', schedule.start_time);
      console.log('  - End:', schedule.end_time);
      console.log('  - Rooms:', schedule.rooms?.length || 0);

      const formattedDate = this.formatDate(schedule.date);
      console.log('  - Formatted date:', formattedDate);

      if (!schedulesByDate.has(formattedDate)) {
        schedulesByDate.set(formattedDate, []);
        console.log('  ✅ Created new date group:', formattedDate);
      }

      if (schedule.rooms && schedule.rooms.length > 0) {
        console.log(`  🏢 Processing ${schedule.rooms.length} rooms:`);

        schedule.rooms.forEach((room: BackendRoom, roomIndex: number) => {
          console.log(`    Room ${roomIndex + 1}: ${room.name} (${room.type})`);

          const item: ProcessedScheduleItem = {
            id: `${schedule.id}-${room.id}`,
            title: room.name || room.identifier || 'Schedule Item',
            description: room.description,
            speaker: room.track?.name,
            location: room.type === 'MAIN' ? 'Main Room' : `${room.name} (Online)`,
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
          };

          console.log(`    ✅ Created item: ${item.title} (${item.timeDisplay})`);
          schedulesByDate.get(formattedDate)!.push(item);
          totalItemsCreated++;
        });
      } else {
        console.log('  📋 Processing schedule without rooms');

        const item: ProcessedScheduleItem = {
          id: schedule.id,
          title: this.getScheduleTitle(schedule.type, schedule.notes),
          description: schedule.notes,
          location: 'All Areas',
          date: formattedDate,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          timeDisplay: this.createTimeDisplay(schedule.start_time, schedule.end_time),
          type: schedule.type,
          scheduleType: schedule.type,
        };

        console.log(`  ✅ Created item: ${item.title} (${item.timeDisplay})`);
        schedulesByDate.get(formattedDate)!.push(item);
        totalItemsCreated++;
      }
    });

    console.log('\n📊 Summary after processing:');
    console.log('📊 Total items created:', totalItemsCreated);
    console.log('📊 Dates found:', Array.from(schedulesByDate.keys()));

    const days: DaySchedule[] = [];
    const sortedDates = Array.from(schedulesByDate.keys()).sort();

    console.log('\n📅 Creating days from sorted dates:', sortedDates);

    sortedDates.forEach((date, index) => {
      const items = schedulesByDate.get(date)!;
      console.log(`📅 Day ${index + 1} - ${date}: ${items.length} items`);

      items.sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });

      const daySchedule: DaySchedule = {
        date,
        dayNumber: index + 1,
        dayTitle: this.generateDayTitle(date, index + 1),
        items,
      };

      console.log(`  ✅ Created: ${daySchedule.dayTitle} with ${daySchedule.items.length} items`);
      days.push(daySchedule);
    });

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
      days,
    };

    console.log('\n🎯 FINAL RESULT:');
    console.log('🎯 Conference:', result.name);
    console.log('🎯 Days count:', result.days.length);
    console.log('🎯 Total sessions:', result.days.reduce((total, day) => total + day.items.length, 0));

    return result;
  }

  // async getConferenceSchedule(conferenceType: 'ICICYTA' | 'ICODSA'): Promise<ProcessedConferenceSchedule> {
  //   try {
  //     console.log('🔍 Getting conference schedule for:', conferenceType);

  //     const allSchedules = await this.getAllConferenceSchedules();
  //     console.log('📊 Total conferences found:', allSchedules.length);

  //     const matchingSchedules = allSchedules.filter(schedule => schedule.type === conferenceType);
  //     console.log('📊 Matching conferences:', matchingSchedules.length);

  //     if (matchingSchedules.length === 0) {
  //       throw new Error(`No conference schedule found for type: ${conferenceType}. Available: ${allSchedules.map(s => s.type).join(', ')}`);
  //     }

  //     let selectedSchedule = matchingSchedules.find(schedule =>
  //       schedule.schedules && schedule.schedules.length > 0
  //     );

  //     if (!selectedSchedule) {
  //       selectedSchedule = matchingSchedules[0];
  //       console.log('⚠️ No schedule with items found, using first match');
  //     }

  //     console.log('✅ Selected schedule:', selectedSchedule.name);
  //     console.log('✅ Schedule items:', selectedSchedule.schedules?.length || 0);

  //     return await this.processConferenceSchedule(selectedSchedule);

  //   } catch (error) {
  //     console.error('❌ Error getting conference schedule:', error);
  //     throw error;
  //   }
  // }

  async getUserConferenceSchedule(): Promise<ProcessedConferenceSchedule | null> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const userResponse = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user data');
      }

      const userResult = await userResponse.json();
      const user = userResult.data;

      let conferenceType: 'ICICYTA' | 'ICODSA';

      if (user.role === 'ADMIN_ICICYTA') {
        conferenceType = 'ICICYTA';
      } else if (user.role === 'ADMIN_ICODSA') {
        conferenceType = 'ICODSA';
      } else {
        conferenceType = 'ICICYTA';
      }

      console.log('👤 User:', user.name, '| Role:', user.role, '| Conference:', conferenceType);

      return await this.getConferenceSchedule(conferenceType);
    } catch (error) {
      console.error('❌ Error getting user conference schedule:', error);
      return null;
    }
  }

  async getScheduleItemDetail(scheduleId: string, roomId?: string): Promise<ProcessedScheduleItem | null> {
    try {
      const allSchedules = await this.getAllConferenceSchedules();

      for (const conference of allSchedules) {
        if (conference.schedules) {
          for (const schedule of conference.schedules) {
            if (schedule.id === scheduleId) {
              if (roomId && schedule.rooms) {
                const room = schedule.rooms.find(r => r.id === roomId);
                if (room) {
                  return {
                    id: `${schedule.id}-${room.id}`,
                    title: room.name || room.identifier || 'Schedule Item',
                    description: room.description,
                    speaker: room.track?.name,
                    location: room.type === 'MAIN' ? 'Main Room' : `${room.name} (Online)`,
                    date: this.formatDate(schedule.date),
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
                  };
                }
              } else {
                return {
                  id: schedule.id,
                  title: this.getScheduleTitle(schedule.type, schedule.notes),
                  description: schedule.notes,
                  location: 'All Areas',
                  date: this.formatDate(schedule.date),
                  startTime: schedule.start_time,
                  endTime: schedule.end_time,
                  timeDisplay: this.createTimeDisplay(schedule.start_time, schedule.end_time),
                  type: schedule.type,
                  scheduleType: schedule.type,
                };
              }
            }
          }
        }
      }

      return null;
    } catch (error) {
      throw error;
    }
  }
}

const scheduleService = new ScheduleService();
export default scheduleService;

export const getConferenceSchedule = scheduleService.getConferenceSchedule.bind(scheduleService);
export const getAllConferenceSchedules = scheduleService.getAllConferenceSchedules.bind(scheduleService);
export const getUserConferenceSchedule = scheduleService.getUserConferenceSchedule.bind(scheduleService);
export const getScheduleItemDetail = scheduleService.getScheduleItemDetail.bind(scheduleService);

export const getSchedules = scheduleService.getAllConferenceSchedules.bind(scheduleService);
export const createSchedule = async () => { throw new Error('Not implemented yet'); };
export const updateSchedule = async () => { throw new Error('Not implemented yet'); };
export const deleteSchedule = async () => { throw new Error('Not implemented yet'); };