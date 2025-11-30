import { useMemo } from "react";
import type { BackendConferenceSchedule } from "@/types";

export function useConferenceDataICODSA(conferences: BackendConferenceSchedule[], selectedYear: string) {
  // Filter ICODSA conferences
  const icodsaConferences = useMemo(() => {
    const filtered = conferences.filter((conf) => {
      if (conf.type !== "ICODSA") return false;
      
      const startDate = new Date(conf.start_date);
      const endDate = new Date(conf.end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
      if (endDate < startDate) return false;
      
      return true;
    });
    console.log('ICODSA Conferences:', filtered);
    return filtered;
  }, [conferences]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(icodsaConferences.map((conf) => conf.year))
    ).sort((a, b) => parseInt(b) - parseInt(a));
    
    return years;
  }, [icodsaConferences]);

  // Get selected conference
  const selectedConference = useMemo(() => {
    return icodsaConferences.find((conf) => conf.year === selectedYear) || null;
  }, [icodsaConferences, selectedYear]);

  return {
    icodsaConferences,
    availableYears,
    selectedConference,
  };
}