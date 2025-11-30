"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import { useConferenceSchedule } from '@/hooks/useConferenceSchedule';
import { useConferenceData } from '@/hooks/useConferenceData';
import conferenceScheduleService from '@/services/ConferenceScheduleService';
import scheduleService from '@/services/ScheduleService';
import { ScheduleProcessor } from '@/utils/scheduleUtils';

const ScheduleUI = () => {
  // --- KONFIGURASI WARNA ---
  const PRIMARY_COLOR = "#015B97";

  // Fetch data
  const { conferences, loading: confLoading, error: confError } = useConferenceSchedule();
  const { icicytaConferences, availableYears } = useConferenceData(conferences, '');
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Fetch ICICYTA schedule data
  useEffect(() => {
    const fetchICICYTAData = async () => {
      if (icicytaConferences.length === 0) {
        setScheduleLoading(false);
        return;
      }

      try {
        setScheduleLoading(true);
        const accessToken = await conferenceScheduleService.getAccessToken();
        if (!accessToken) {
          throw new Error('Access token not available');
        }

        // Get all schedules
        const allSchedules = await scheduleService.getAllSchedules(accessToken);

        // Filter schedules for ICICYTA conferences
        const icicytaSchedules = allSchedules.filter(schedule =>
          icicytaConferences.some(conf => conf.id === schedule.conference_schedule_id)
        );

        // Group schedules by conference and process each one
        const groupedData = icicytaConferences.map(conference => {
          const conferenceSchedules = icicytaSchedules.filter(s => s.conference_schedule_id === conference.id);

          // Process the conference with its schedules
          const conferenceWithSchedules = {
            ...conference,
            schedules: conferenceSchedules
          };

          const processed = ScheduleProcessor.processConferenceSchedule(conferenceWithSchedules);

          // Transform to UI format - each day becomes a separate entry
          const dayEntries = processed.days?.map(day => ({
            day: day.dayTitle || day.date, // Day header shows the date/day title
            slots: day.items?.map((item: any) => ({
              time: item.timeDisplay || "TBA", // Time slot shows the actual time
              isFullWidth: false,
              content: "",
              duration: "",
              events: [{
                id: item.id,
                type: item.type === "TALK" ? "green" : "orange",
                title: item.description || item.title, // Use description if available, fallback to title
                speaker: item.type || "TALK", // Show type instead of "TBA"
                location: item.location || "All Areas",
                duration: "Conference Session", // Show "Conference Session" instead of time
                hasButton: item.scheduleType === "PARALLEL"
              }]
            })) || []
          })) || [];

          return dayEntries;
        }).flat(); // Flatten since we have array of arrays

        setScheduleData(groupedData);
        console.log('Fetched ICICYTA schedule data:', groupedData);

      } catch (err: any) {
        console.error('Error fetching ICICYTA schedule:', err);
        setScheduleError(err.message || 'Failed to load schedule data');
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchICICYTAData();
  }, [icicytaConferences]);

  // Loading state
  if (confLoading || scheduleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading ICICYTA data...</p>
      </div>
    );
  }

  // Error state
  if (confError || scheduleError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Error Loading Data</h2>
          <p className="text-gray-600">{confError || scheduleError}</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Schedule data:', scheduleData);
  console.log('ICICYTA conferences:', icicytaConferences);

  // Get conference name for header
  const conferenceName = icicytaConferences.length > 0 ? icicytaConferences[0].name : "ICICyTA Conference";

  // Fallback to original hardcoded data if no fetched data
  const displayData = scheduleData.length > 0 ? scheduleData : [
    {
      day: "Wednesday, 22 November 2025",
      slots: [
        {
          time: "7.30 - 09.10",
          events: [
            {
              id: 1,
              type: "green",
              title: "Speech by General Chair Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
              speaker: "TALK",
              location: "Ballroom garden",
              duration: "Conference Session",
              hasButton: true
            },
            {
              id: 2,
              type: "green",
              title: "Speech by General Chair Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
              speaker: "TALK",
              location: "Ballroom garden",
              duration: "Conference Session",
              hasButton: true
            }
          ]
        },
        {
          time: "7.30 - 09.10",
          isFullWidth: true,
          content: "Signing MoU Telkom University dan Kyushu University",
          duration: "6h 30m"
        },
        {
          time: "7.30 - 09.10",
          events: [
            { id: 3, type: "orange", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session" },
            { id: 4, type: "orange", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session" },
            { id: 5, type: "green", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session", hasButton: true },
            { id: 6, type: "orange", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session" },
          ]
        }
      ]
    },
    {
      day: "Saturday, 23 November 2025",
      slots: [
        {
          time: "7.30 - 09.10",
          events: [
            { id: 9, type: "green", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session", hasButton: true },
            { id: 10, type: "orange", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session" }
          ]
        },
        {
          time: "7.30 - 09.10",
          events: [
            { id: 11, type: "orange", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session" },
            { id: 12, type: "green", title: "Speech by General Chair Representation...", speaker: "TALK", location: "Ballroom garden", duration: "Conference Session", hasButton: true }
          ]
        }
      ]
    }
  ];

  const getCardStyle = (type: string) => {
    switch(type) {
      case 'green': return "bg-[#E6F4EA] border-[#CEEAD6] hover:border-emerald-300"; 
      case 'orange': return "bg-[#FEF7E0] border-[#FEEFC3] hover:border-orange-300"; 
      default: return "bg-white border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 font-sans text-slate-800">
      {/* 1. Max Width 7xl */}
      <div className="max-w-11/12 mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div className="w-32 hidden md:block"></div>
          
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-slate-900">{conferenceName} Program</h1>
          </div>
          
          <div className="w-fit flex justify-end">
            <button className="bg-[#0FB47D] hover:bg-[#0d9e6e] text-white px-4 py-2 rounded shadow flex items-center gap-2 text-sm font-medium transition">
              <LinkIcon size={16} />
              Parallel Session
            </button>
          </div>
        </div>

        {/* Schedule Loop */}
        <div className="space-y-10">
          {displayData.map((day, dIndex) => (
            <div key={dIndex} className="space-y-6">
              
              {/* Day Header - Text Day dihapus (sisa tanggal), warna border tetap Primary */}
              <div className="bg-white py-4 px-6 rounded-lg shadow-sm w-full text-center border-t-4" style={{ borderColor: PRIMARY_COLOR }}>
                <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                  {day.day}
                </h2>
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                {day.slots.map((slot: { time: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; isFullWidth: any; content: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; duration: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; events: any[]; }, sIndex: React.Key | null | undefined) => (
                  <div key={sIndex} className="flex flex-col md:flex-row gap-4">
                    
                    {/* 2. Warna Jam KEMBALI KE AWAL (Blue-100) */}
                    <div className="md:w-48 flex-shrink-0">
                      <div className="bg-blue-100 text-blue-600 py-4 px-6 rounded-lg text-center h-full flex items-center justify-center shadow-sm text-lg font-medium">
                        {slot.time}
                      </div>
                    </div>

                    {/* Events Column (Right) */}
                    <div className="flex-1">
                      {slot.isFullWidth ? (
                        // Baris Biru Panjang (MoU) - Tetap menggunakan nuansa biru agar senada dengan jam
                        <div className="bg-blue-100/50 border border-blue-200 w-full rounded-lg p-4 flex justify-between items-center text-slate-700 shadow-sm">
                          <span className="font-semibold text-lg">{slot.content}</span>
                          <span className="text-sm opacity-75 font-medium">{slot.duration}</span>
                        </div>
                      ) : (
                        // Grid Kartu
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {slot.events?.map((event: { id: React.Key | null | undefined; type: string; title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; duration: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; speaker: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; location: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; hasButton: any; }) => (
                            <div 
                              key={event.id} 
                              className={`border rounded-lg p-3 shadow-sm transition-all ${getCardStyle(event.type)} relative group`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold leading-relaxed line-clamp-3 text-slate-800 mb-2 min-h-[40px]">
                                  {event.title}
                                </p>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{event.duration}</span>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-2">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}`} alt="avatar" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-800">{event.speaker}</span>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <MapPin size={10} />
                                    <span>{event.location}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Tombol Parallel Session */}
                              {event.hasButton && (
                                <div className="mt-3">
                                  <button className="bg-[#0FB47D] hover:bg-[#0d9e6e] text-white text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1 w-fit transition shadow-sm">
                                    <LinkIcon size={9} />
                                    Parallel Session
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleUI;