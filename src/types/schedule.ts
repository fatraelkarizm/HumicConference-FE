// types/schedule.ts
export type NewScheduleData = {
  title: string;
  conference: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  speaker?: string;
  description?: string;
  location?: string;
  scheduleType?: string; // e.g. "Reporting", "Speech"
  // NEW: day info
  dayNumber?: number; // 1,2,3...
  dayTitle?: string; // "Day 1: Opening Ceremony"
};

export type ScheduleItem = {
  id: string;
  title: string;
  conference: string;
  date: string;
  startTime?: string;
  endTime?: string;
  timeDisplay?: string; // computed "HH:MM - HH:MM"
  speaker?: string;
  description?: string;
  location?: string;
  scheduleType?: string;
  createdAt: string;
  // NEW: day info stored
  dayNumber?: number;
  dayTitle?: string;
};