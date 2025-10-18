"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import TimelineRow from "@/components/TimelineRow";
import SessionModal from "@/components/schedule/ScheduleAddModal";

// --- INITIAL DUMMY DATA ---
// no color fields here so you can replace with fetched data later
const initialEvents = [
  {
    id: 1,
    title:
      "Speech by General Chair Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
    time: "1h 40m",
    speaker: "Mahananta",
    room: "Room A",
  },
  {
    id: 2,
    title:
      "Speech by General Chair Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
    time: "1h 40m",
    speaker: "Mahananta",
    room: "Room B",
  },
  {
    id: 3,
    title:
      "Speech by General Chair Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
    time: "1h 40m",
    speaker: "Mahananta",
    room: "Room C",
  },
];

const ReportingRow = ({
  time,
  title,
  duration,
}: {
  time: string;
  title: string;
  duration: string;
}) => (
  <div className="grid grid-cols-[140px_1fr] items-stretch gap-4">
    <div className="h-full">
      <div className="h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm shadow-sm">
        {time}
      </div>
    </div>

    <div className="h-full">
      <div className="h-full bg-white rounded-lg p-4 shadow-sm border border-blue-50 flex flex-col justify-start">
        <div className="text-gray-800 font-medium break-words">{title}</div>
        <div className="text-gray-500 text-sm mt-1">{duration}</div>
      </div>
    </div>
  </div>
);

const ColorSeparator = ({
  time,
  title,
  duration,
  bgColor,
}: {
  time: string;
  title: string;
  duration: string;
  bgColor: string;
}) => (
  <div className="grid grid-cols-[140px_1fr] items-stretch gap-4">
    <div className="h-full">
      <div className="h-full flex items-center justify-center rounded-lg px-4 py-3 text-gray-700 text-sm">
        {time}
      </div>
    </div>

    <div className="h-full">
      <div className={`h-full rounded-lg p-4 shadow-sm ${bgColor}`}>
        <div className="font-bold text-gray-800 break-words">{title}</div>
        <div className="text-sm mt-1 text-gray-600">{duration}</div>
      </div>
    </div>
  </div>
);

export default function JadwalIcodsaPage() {
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleAddSessionClick() {
    setIsModalOpen(true);
  }

  function handleSaveSession(data: {
    title: string;
    conference: string;
    date: string;
    startTime: string;
    endTime: string;
    speaker: string;
    description: string;
    location: string;
    sessionType: string;
  }) {
    // create a minimal event object to add to the list.
    const newEvent = {
      id: Date.now(),
      title: data.title,
      // store time as "HH:MM - HH:MM" for now; adapt as needed when you fetch real data
      time:
        data.startTime && data.endTime
          ? `${data.startTime} - ${data.endTime}`
          : "",
      speaker: data.speaker,
      room: data.location || "",
      date: data.date,
    };

    setEvents((prev) => [newEvent, ...prev]);
  }

  return (
    <>
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-4">
          <span
            className="inline-flex items-center justify-center rounded-md"
            style={{ backgroundColor: "#FFB84D", padding: 8 }}
          >
            <CalendarDaysIcon className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 leading-tight">
              Jadwal ICoDSA
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Lorem ipsum</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSessionClick}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: "#10B981" }}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Tambah Sesi Baru</span>
          </button>

          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: "#2563EB" }}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Import Data</span>
          </button>

          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: "#949CA2" }}
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Konten Jadwal */}
      <div className="space-y-4">
        <ReportingRow
          time="7.30 - 09.10"
          title="Reporting: Design concept of visual dashboard"
          duration="6h 30m"
        />
        <ReportingRow
          time="7.30 - 09.10"
          title="Reporting: Design concept of visual dashboard"
          duration="6h 30m"
        />
        <ReportingRow
          time="7.30 - 09.10"
          title="Reporting: Design concept of visual dashboard"
          duration="6h 30m"
        />

        <TimelineRow time="7.30 - 09.10">
          <div className="p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
              {events.map((event) => (
                <ScheduleCard
                        key={event.id}
                        title={event.title}
                        time={event.time}
                        speaker={event.speaker}
                        room={event.room}
                        description="" bgColor={""} borderColor={""}                />
              ))}
            </div>
          </div>
        </TimelineRow>
        <ReportingRow
          time="7.30 - 09.10"
          title="Reporting: Design concept of visual dashboard"
          duration="6h 30m"
        />
        <ReportingRow
          time="7.30 - 09.10"
          title="Reporting: Design concept of visual dashboard"
          duration="6h 30m"
        />

        <TimelineRow time="09.30 - 11.00">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="col-span-full text-center text-gray-500 p-8">
                Sesi berikutnya...
              </div>
            </div>
          </div>
        </TimelineRow>
      </div>

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => handleSaveSession(data)}
      />
    </>
  );
}
