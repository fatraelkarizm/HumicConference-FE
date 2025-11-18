import {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
  BackendApiResponse,
  ProcessedConferenceSchedule,
  ScheduleItem,
  DaySchedule,
  NewScheduleData,
  UpdateScheduleData
} from '@/types/schedule';

/**
 * Service class for handling schedule-related operations
 * Manages CRUD operations for conference schedules, rooms, and tracks
 */
class ScheduleService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Get conference schedule by type with fallback support
   */
  async getConferenceSchedule(conferenceType: 'ICICYTA' | 'ICODSA'): Promise<ProcessedConferenceSchedule> {
    try {
      console.log(`🔍 Fetching ${conferenceType} conference schedule`);

      const allSchedules = await this.getAllConferenceSchedules();
      
      if (allSchedules.length === 0) {
        console.log('⚠️ No backend data available, using fallback');
        return this.createFallbackData();
      }

      const matchingSchedules = allSchedules.filter(schedule => schedule.type === conferenceType);
      
      if (matchingSchedules.length === 0) {
        console.log(`⚠️ No ${conferenceType} conference found, using fallback`);
        return this.createFallbackData();
      }

      const selectedSchedule = matchingSchedules.find(schedule => 
        schedule.schedules && schedule.schedules.length > 0
      ) || matchingSchedules[0];

      console.log(`✅ Selected: ${selectedSchedule.name} (${selectedSchedule.schedules?.length || 0} schedules)`);
      
      return this.processConferenceSchedule(selectedSchedule);
    } catch (error) {
      console.error('❌ Error fetching conference schedule:', error);
      return this.createFallbackData();
    }
  }

  /**
   * Get all conference schedules from backend
   */
  async getAllConferenceSchedules(): Promise<BackendConferenceSchedule[]> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    const response = await this.makeRequest(
      `/api/v1/conference-schedule?include_relation[0]=schedules`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    const schedules = Array.isArray(response.data) ? response.data : [];
    
    schedules.forEach(schedule => {
      console.log(`📊 ${schedule.name} (${schedule.type}): ${schedule.schedules?.length || 0} schedules`);
    });

    return schedules;
  }

  /**
   * Get user-specific conference schedule based on role
   */
  async getUserConferenceSchedule(): Promise<ProcessedConferenceSchedule | null> {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const userResponse = await this.makeRequest('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const user = userResponse.data;
      const conferenceType = this.mapUserRoleToConference(user.role);

      console.log(`👤 User: ${user.name} | Role: ${user.role} | Conference: ${conferenceType}`);

      return this.getConferenceSchedule(conferenceType);
    } catch (error) {
      console.error('❌ Error getting user conference schedule:', error);
      return null;
    }
  }

  /**
   * Create new schedule
   */
  async createSchedule(data: NewScheduleData): Promise<ScheduleItem> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    // Get target conference
    const targetConference = await this.findConferenceByType(data.conference);
    
    if (!targetConference) {
      throw new Error(`${data.conference} conference not found. Please create conference first.`);
    }

    // Create schedule
    const schedulePayload = this.buildSchedulePayload(data, targetConference.id);
    console.log('🔍 Creating schedule:', schedulePayload);

    const scheduleResponse = await this.makeRequest('/api/v1/schedule', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(schedulePayload)
    });

    console.log('✅ Schedule created:', scheduleResponse.data);

    // Create associated room if needed
    if (data.title || data.speaker || data.location) {
      await this.createRoom(scheduleResponse.data.id, data);
    }

    return this.mapBackendScheduleToItem(scheduleResponse.data, data);
  }

  /**
   * Update existing schedule
   */
  async updateSchedule(id: string, data: UpdateScheduleData): Promise<ScheduleItem> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    const updatePayload = this.buildUpdatePayload(data);
    console.log('🔄 Updating schedule:', updatePayload);

    const response = await this.makeRequest(`/api/v1/schedule/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(updatePayload)
    });

    console.log('✅ Schedule updated:', response.data);

    return this.mapBackendScheduleToItem(response.data, data);
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(id: string): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Access token not available');
    }

    console.log('🗑️ Deleting schedule:', id);

    const response = await this.makeRequest(`/api/v1/schedule/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const success = response.code === 200;
    console.log(`${success ? '✅' : '❌'} Delete operation ${success ? 'successful' : 'failed'}`);
    
    return success;
  }

  /**
   * Get detailed schedule item
   */
  async getScheduleItemDetail(scheduleId: string, roomId?: string): Promise<ScheduleItem | null> {
    const allSchedules = await this.getAllConferenceSchedules();

    for (const conference of allSchedules) {
      if (!conference.schedules) continue;

      for (const schedule of conference.schedules) {
        if (schedule.id === scheduleId) {
          return this.extractScheduleItem(schedule, roomId);
        }
      }
    }

    return null;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Get access token from auth API
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.data?.accessToken || null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Generic HTTP request handler
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<BackendApiResponse<any>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(result.message || 'Request failed');
    }

    return result;
  }

  /**
   * Find conference by type
   */
  private async findConferenceByType(conferenceType?: string): Promise<BackendConferenceSchedule | null> {
    const allSchedules = await this.getAllConferenceSchedules();
    const type = conferenceType === 'ICICYTA' ? 'ICICYTA' : 'ICODSA';
    return allSchedules.find(conf => conf.type === type) || null;
  }

  /**
   * Map user role to conference type
   */
  private mapUserRoleToConference(role: string): 'ICICYTA' | 'ICODSA' {
    if (role === 'ADMIN_ICICYTA') return 'ICICYTA';
    if (role === 'ADMIN_ICODSA') return 'ICODSA';
    return 'ICICYTA'; // Default fallback
  }

  /**
   * Map frontend schedule type to backend enum
   */
  private mapScheduleTypeToBackend(scheduleType?: string): 'TALK' | 'BREAK' | 'ONE_DAY_ACTIVITY' {
    switch (scheduleType) {
      case 'BREAK': return 'BREAK';
      case 'ACTIVITY':
      case 'WORKSHOP':
      case 'ONE_DAY_ACTIVITY': return 'ONE_DAY_ACTIVITY';
      default: return 'TALK';
    }
  }

  /**
   * Build schedule creation payload
   */
  private buildSchedulePayload(data: NewScheduleData, conferenceId: string) {
    return {
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      type: this.mapScheduleTypeToBackend(data.scheduleType),
      notes: data.description || null,
      conference_schedule_id: conferenceId,
    };
  }

  /**
   * Build schedule update payload
   */
  private buildUpdatePayload(data: UpdateScheduleData) {
    const payload: any = {};
    
    if (data.date) payload.date = data.date;
    if (data.startTime) payload.start_time = data.startTime;
    if (data.endTime) payload.end_time = data.endTime;
    if (data.description) payload.notes = data.description;

    if (data.title || data.speaker || data.location) {
      payload.rooms = [{
        name: data.title,
        description: data.description,
        start_time: data.startTime,
        end_time: data.endTime,
        track: data.speaker ? { name: data.speaker } : undefined
      }];
    }

    return payload;
  }

  /**
   * Create room for schedule
   */
  private async createRoom(scheduleId: string, data: NewScheduleData): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return;

      const roomPayload = {
        name: data.title,
        identifier: `room-${Date.now()}`,
        description: data.description || null,
        type: data.scheduleType === 'PARALLEL' ? 'PARALLEL' : 'MAIN',
        start_time: data.startTime,
        end_time: data.endTime,
        schedule_id: scheduleId,
      };

      console.log('🏢 Creating room:', roomPayload);

      const response = await this.makeRequest('/api/v1/room', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(roomPayload)
      });

      console.log('✅ Room created:', response.data);

      // Create track if speaker provided
      if (data.speaker && response.data?.id) {
        await this.createTrack(response.data.id, data.speaker);
      }
    } catch (error) {
      console.warn('⚠️ Room creation failed (schedule still created):', error);
    }
  }

  /**
   * Create track for speaker
   */
  private async createTrack(roomId: string, speakerName: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return;

      const trackPayload = {
        name: speakerName,
        description: `Track by ${speakerName}`,
      };

      console.log('🎯 Creating track:', trackPayload);

      await this.makeRequest('/api/v1/track', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(trackPayload)
      });

      console.log('✅ Track created');
    } catch (error) {
      console.warn('⚠️ Track creation failed:', error);
    }
  }

  /**
   * Map backend schedule to frontend item
   */
  private mapBackendScheduleToItem(schedule: BackendSchedule, data: Partial<NewScheduleData>): ScheduleItem {
    const room = schedule.rooms?.[0];
    
    return {
      id: schedule.id,
      title: data.title || room?.name || 'Schedule Item',
      description: data.description,
      speaker: data.speaker || room?.track?.name,
      location: data.location || this.getLocationFromRoom(room),
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
      track: room?.track
    };
  }

  /**
   * Extract schedule item from backend data
   */
  private extractScheduleItem(schedule: BackendSchedule, roomId?: string): ScheduleItem | null {
    if (roomId && schedule.rooms) {
      const room = schedule.rooms.find(r => r.id === roomId);
      if (!room) return null;

      return {
        id: `${schedule.id}-${room.id}`,
        title: room.name || room.identifier || 'Schedule Item',
        description: room.description,
        speaker: room.track?.name,
        location: this.getLocationFromRoom(room),
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

  /**
   * Get location string from room data
   */
  private getLocationFromRoom(room?: BackendRoom): string {
    if (!room) return 'All Areas';
    return room.type === 'MAIN' ? 'Main Room' : `${room.name} (Online)`;
  }

  /**
   * Get schedule title based on type and notes
   */
  private getScheduleTitle(type: string, notes?: string): string {
    switch (type) {
      case 'BREAK': return notes?.includes('Coffee') ? 'Coffee Break' : 'Break';
      case 'ONE_DAY_ACTIVITY': return notes?.includes('Tour') ? 'One Day Tour' : 'Activity';
      case 'TALK': return 'Conference Session';
      default: return 'Schedule Item';
    }
  }

  /**
   * Process conference schedule data
   */
  private async processConferenceSchedule(data: BackendConferenceSchedule): Promise<ProcessedConferenceSchedule> {
    const schedules = data.schedules || [];
    
    console.log(`🔍 Processing ${data.name} (${schedules.length} schedules)`);

    if (schedules.length === 0) {
      return this.buildEmptyConference(data);
    }

    const schedulesByDate = this.groupSchedulesByDate(schedules);
    const days = this.buildDaysFromSchedules(schedulesByDate);

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

    console.log(`✅ Processed: ${result.name} (${result.days.length} days, ${result.days.reduce((total, day) => total + day.items.length, 0)} sessions)`);
    
    return result;
  }

  /**
   * Build empty conference structure
   */
  private buildEmptyConference(data: BackendConferenceSchedule): ProcessedConferenceSchedule {
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

  /**
   * Group schedules by date
   */
  private groupSchedulesByDate(schedules: BackendSchedule[]): Map<string, ScheduleItem[]> {
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

  /**
   * Create schedule items from backend schedule
   */
  private createScheduleItems(schedule: BackendSchedule, formattedDate: string): ScheduleItem[] {
    if (schedule.rooms && schedule.rooms.length > 0) {
      return schedule.rooms.map(room => ({
        id: `${schedule.id}-${room.id}`,
        title: room.name || room.identifier || 'Schedule Item',
        description: room.description,
        speaker: room.track?.name,
        location: this.getLocationFromRoom(room),
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
      }));
    }

    return [{
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
    }];
  }

  /**
   * Build days structure from grouped schedules
   */
  private buildDaysFromSchedules(schedulesByDate: Map<string, ScheduleItem[]>): DaySchedule[] {
    const sortedDates = Array.from(schedulesByDate.keys()).sort();
    
    return sortedDates.map((date, index) => {
      const items = schedulesByDate.get(date)!;
      
      // Sort items by time
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

  /**
   * Utility methods
   */
  private formatDate(isoString: string): string {
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

  /**
   * Create fallback data for when backend is unavailable
   */
  private createFallbackData(): ProcessedConferenceSchedule {
    return {
      id: 'fallback-conference',
      name: 'Conference Schedule',
      description: 'ICICYTA',
      year: '2024',
      startDate: '2024-12-17',
      endDate: '2024-12-19',
      type: 'ICICYTA',
      contactEmail: 'contact@conference.com',
      timezone: 'GMT+8',
      onsiteLocation: 'Conference Center',
      onlineLocation: 'Virtual Meeting',
      noShowPolicy: 'Please attend scheduled sessions',
      days: [
        {
          date: '2024-12-17',
          dayNumber: 1,
          dayTitle: 'Day 1: 17 December',
          items: [
            {
              id: 'demo-1',
              title: 'Registration & Opening',
              description: 'Conference registration and opening ceremony',
              location: 'Main Hall',
              date: '2024-12-17',
              startTime: '08:30',
              endTime: '09:30',
              timeDisplay: '08:30 - 09:30',
              type: 'TALK',
              scheduleType: 'MAIN'
            }
          ]
        }
      ]
    };
  }
}

// ==================== EXPORT ====================

const scheduleService = new ScheduleService();
export default scheduleService;

// Export bound methods for direct usage
export const {
  getConferenceSchedule,
  getAllConferenceSchedules,
  getUserConferenceSchedule,
  getScheduleItemDetail,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = {
  getConferenceSchedule: scheduleService.getConferenceSchedule.bind(scheduleService),
  getAllConferenceSchedules: scheduleService.getAllConferenceSchedules.bind(scheduleService),
  getUserConferenceSchedule: scheduleService.getUserConferenceSchedule.bind(scheduleService),
  getScheduleItemDetail: scheduleService.getScheduleItemDetail.bind(scheduleService),
  createSchedule: scheduleService.createSchedule.bind(scheduleService),
  updateSchedule: scheduleService.updateSchedule.bind(scheduleService),
  deleteSchedule: scheduleService.deleteSchedule.bind(scheduleService)
};

// Legacy aliases
export const getSchedules = getAllConferenceSchedules;