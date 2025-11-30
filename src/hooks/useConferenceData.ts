import { useMemo } from "react";
import type { BackendConferenceSchedule } from "@/types";

export function useConferenceData(conferences: BackendConferenceSchedule[], selectedYear: string) {
  // Filter ICICYTA conferences
  const icicytaConferences = useMemo(() => {
    return conferences.filter((conf) => {
      if (conf.type !== "ICICYTA") return false;
      
      const startDate = new Date(conf.start_date);
      const endDate = new Date(conf.end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
      if (endDate < startDate) return false;
      
      return true;
    });
  }, [conferences]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(icicytaConferences.map((conf) => conf.year))
    ). sort((a, b) => parseInt(b) - parseInt(a));
    
    return years;
  }, [icicytaConferences]);

  // Get selected conference
  const selectedConference = useMemo(() => {
    return icicytaConferences.find((conf) => conf.year === selectedYear) || null;
  }, [icicytaConferences, selectedYear]);

  return {
    icicytaConferences,
    availableYears,
    selectedConference,
  };
}