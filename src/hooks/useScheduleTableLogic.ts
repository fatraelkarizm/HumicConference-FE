import { useMemo, useState } from "react";
import type { BackendConferenceSchedule, BackendSchedule } from "@/types";

export function useScheduleTableLogic(
  conference: BackendConferenceSchedule,
  schedules: BackendSchedule[]
) {
  const [selectedDay, setSelectedDay] = useState<string>("");

  const schedulesByDay = useMemo(() => {
    const grouped: Record<string, BackendSchedule[]> = {};
    const startDate = new Date(conference.start_date);
    const endDate = new Date(conference.end_date);
    const daysList: string[] = [];

    // Helper that returns a UTC date key 'YYYY-MM-DD' to avoid local timezone shifts
    const toUtcDateKey = (d: Date | string) => {
      const dt = typeof d === 'string' ? new Date(d) : d;
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dt.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = toUtcDateKey(d);
      daysList.push(dateStr);
      grouped[dateStr] = [];
    }

    schedules.forEach((schedule) => {
      const date = toUtcDateKey(schedule.date);
      if (grouped[date]) {
        grouped[date].push(schedule);
      }
    });

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = a.start_time || "00:00";
        const timeB = b.start_time || "00:00";
        return timeA.localeCompare(timeB);
      });
    });

    return { grouped, daysList };
  }, [schedules, conference.start_date, conference.end_date]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDayNumber = (dateStr: string) => {
    const confStart = new Date(conference.start_date);
    const currentDate = new Date(dateStr);
    const diffTime = currentDate.getTime() - confStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };

  return {
    ... schedulesByDay,
    selectedDay: selectedDay || schedulesByDay.daysList[0] || "",
    setSelectedDay,
    formatDate,
    getDayNumber,
  };
}