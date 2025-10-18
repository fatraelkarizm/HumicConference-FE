import React, { useEffect, useRef, useState } from "react";
import type { NewScheduleData, ScheduleItem } from "@/types/schedule";
import { updateSchedule } from "@/services/ScheduleService";

type Props = {
  open: boolean;
  item: ScheduleItem | null;
  onClose: () => void;
  onSaved: (updated: ScheduleItem) => void;
};

export default function ScheduleEditModal({
  open,
  item,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState("");
  const [conference, setConference] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [dayNumber, setDayNumber] = useState<number | undefined>(1);
  const [dayTitle, setDayTitle] = useState<string | undefined>("");

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && item) {
      setTitle(item.title ?? "");
      setConference(item.conference ?? "");
      setDate(item.date ?? "");
      setStartTime(item.startTime ?? "");
      setEndTime(item.endTime ?? "");
      setSpeaker(item.speaker ?? "");
      setDescription(item.description ?? "");
      setLocation(item.location ?? "");
      setScheduleType(item.scheduleType ?? "");
      setDayNumber(item.dayNumber ?? 1);
      setDayTitle(item.dayTitle ?? "");
    }
  }, [open, item]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  function handleOverlay(e: React.MouseEvent) {
    if (e.target === ref.current) onClose();
  }

  async function handleSave() {
    // basic validation
    if (!title.trim() || !date) {
      alert("Judul dan tanggal wajib.");
      return;
    }

    // ensure item is available before proceeding
    if (!item) {
      alert("Item tidak tersedia.");
      return;
    }

    const payload: Partial<NewScheduleData> = {
      title,
      conference,
      date,
      startTime,
      endTime,
      speaker,
      description,
      location,
      scheduleType,
      dayNumber,
      dayTitle,
    };

    try {
      const updated = await updateSchedule(item.id, payload);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan perubahan.");
    }
  }

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-60 flex items-start justify-center bg-black/30 p-4"
      onMouseDown={handleOverlay}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-black">Edit Schedule</h3>
          <button onClick={onClose} className="text-black">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm text-black">Judul</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-black placeholder:text-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="block text-sm text-black">Tanggal</label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm text-black"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-black">Waktu mulai</label>
                <input
                  type="time"
                  className="w-full rounded-md border px-3 py-2 text-sm text-black"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-black">
                  Waktu selesai
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border px-3 py-2 text-sm text-black"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <label className="block text-sm text-black">Pembicara</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-black"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-black">Konferensi</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-black"
              value={conference}
              onChange={(e) => setConference(e.target.value)}
            />

            <label className="block text-sm text-black">Lokasi/Link</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-black"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <label className="block text-sm text-black">Jenis Schedule</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm text-black"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
            />

            <div>
              <label className="block text-sm text-black">Day number</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-md border px-3 py-2 text-sm text-black"
                value={dayNumber ?? 1}
                onChange={(e) => setDayNumber(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm text-black">Day title</label>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm text-black"
                value={dayTitle ?? ""}
                onChange={(e) => setDayTitle(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-black border"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-green-600 text-white"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
