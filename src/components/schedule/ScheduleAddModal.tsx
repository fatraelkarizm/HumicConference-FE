import React, { useEffect, useRef, useState } from "react";
import type { NewScheduleData, ScheduleItem } from "@/types/schedule";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NewScheduleData, id?: string) => Promise<void>;
  initialData?: ScheduleItem | null;
  mode?: "create" | "edit";
};

type DayEntry = { dayNumber: number; dayTitle: string };

const DAYS_STORAGE = "hc_schedule_days_v1";

export default function ScheduleAddModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  mode = "create",
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

  const [days, setDays] = useState<DayEntry[]>(() => {
    try {
      const raw = localStorage.getItem(DAYS_STORAGE);
      if (raw) return JSON.parse(raw) as DayEntry[];
    } catch {}
    return [
      { dayNumber: 1, dayTitle: "" },
      { dayNumber: 2, dayTitle: "" },
      { dayNumber: 3, dayTitle: "" },
      { dayNumber: 4, dayTitle: "" },
    ];
  });
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title ?? "");
      setConference(initialData.conference ?? "");
      setDate(initialData.date ?? "");
      setStartTime(initialData.startTime ?? "");
      setEndTime(initialData.endTime ?? "");
      setSpeaker(initialData.speaker ?? "");
      setDescription(initialData.description ?? "");
      setLocation(initialData.location ?? "");
      setScheduleType(initialData.scheduleType ?? "");
      setSelectedDayNumber(initialData.dayNumber ?? 1);
      
      if (initialData.dayNumber && initialData.dayTitle) {
        setDays((prev) => {
          const exists = prev.find((d) => d.dayNumber === initialData.dayNumber);
          if (exists) {
            return prev.map((d) =>
              d.dayNumber === initialData.dayNumber
                ? { ...d, dayTitle: initialData.dayTitle ?? "" }
                : d
            );
          } else {
            return [
              ...prev,
              {
                dayNumber: initialData.dayNumber!,
                dayTitle: initialData.dayTitle ?? "",
              },
            ].sort((a, b) => a.dayNumber - b.dayNumber);
          }
        });
      }
    }

    if (isOpen && !initialData) {
      setTitle("");
      setConference("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setSpeaker("");
      setDescription("");
      setLocation("");
      setScheduleType("");
      setSelectedDayNumber(1);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    try {
      localStorage.setItem(DAYS_STORAGE, JSON.stringify(days));
    } catch {}
  }, [days]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === modalRef.current) onClose();
  }

  function addDay() {
    setDays((prev) => {
      const max = prev.reduce((m, d) => Math.max(m, d.dayNumber), 0);
      const next = max + 1;
      const nextList = [...prev, { dayNumber: next, dayTitle: "" }];
      setSelectedDayNumber(next);
      return nextList;
    });
  }

  function updateDayTitle(dayNum: number, value: string) {
    setDays((prev) =>
      prev.map((d) => (d.dayNumber === dayNum ? { ...d, dayTitle: value } : d))
    );
  }

  async function handleSave() {
    // ✅ Basic validation
    if (!title.trim()) {
      alert("Judul sesi harus diisi.");
      return;
    }

    if (!date) {
      alert("Tanggal harus dipilih.");
      return;
    }

    if (!startTime || !endTime) {
      alert("Waktu mulai dan selesai harus diisi.");
      return;
    }

    if (startTime >= endTime) {
      alert("Waktu mulai harus lebih awal dari waktu selesai.");
      return;
    }

    if (!conference) {
      alert("Konferensi harus dipilih.");
      return;
    }

    const dayEntry = days.find((d) => d.dayNumber === selectedDayNumber) ?? {
      dayNumber: selectedDayNumber,
      dayTitle: "",
    };
    const normalizedDayTitle = dayEntry.dayTitle?.trim()
      ? `Day ${dayEntry.dayNumber}: ${dayEntry.dayTitle.trim()}`
      : `Day ${dayEntry.dayNumber}`;

    const payload: NewScheduleData = {
      title: title.trim(),
      conference,
      date,
      startTime,
      endTime,
      speaker: speaker.trim() || undefined,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      scheduleType: scheduleType || "Speech", // ✅ Default to safe value
      dayNumber: dayEntry.dayNumber,
      dayTitle: normalizedDayTitle,
    };

    console.log("💾 Submitting payload:", payload);

    try {
      await onSave(payload, initialData?.id);
    } catch (error) {
      console.error("❌ Save failed in modal:", error);
      // Error will be handled by parent component
    }
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-4xl rounded-lg bg-white shadow-lg ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-3">
          <h3 className="text-lg font-medium text-black">
            {mode === "create" ? "Form Schedule Baru" : "Edit Schedule"}
          </h3>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 rounded p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Days Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-black">Days</div>

              <select
                value={String(selectedDayNumber)}
                onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
                className="ml-2 rounded-md border border-gray-300 px-3 py-1 text-black"
              >
                {days.map((d) => (
                  <option key={d.dayNumber} value={d.dayNumber}>
                    {`Day ${d.dayNumber}${d.dayTitle ? ` — ${d.dayTitle}` : ""}`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addDay}
                className="inline-flex items-center justify-center ml-2 rounded-md bg-green-600 text-white px-3 py-1 hover:bg-green-700"
                title="Add Day"
              >
                +
              </button>
            </div>

            <div className="mt-3">
              <label className="block text-sm text-black">Title untuk Day</label>
              <input
                value={
                  days.find((d) => d.dayNumber === selectedDayNumber)?.dayTitle ?? ""
                }
                onChange={(e) =>
                  updateDayTitle(selectedDayNumber, e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400"
                placeholder={`Judul untuk Day ${selectedDayNumber} (contoh: Opening Ceremony)`}
              />
              <div className="text-xs text-gray-500 mt-1">
                Judul akan disimpan sebagai "Day {selectedDayNumber}: &lt;judul&gt;" saat disimpan.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400"
                  placeholder="Masukkan judul sesi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Waktu Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Waktu Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Pembicara/Moderator
                </label>
                <input
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400"
                  placeholder="Nama pembicara (opsional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400"
                  rows={3}
                  placeholder="Deskripsi sesi (opsional)"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Konferensi <span className="text-red-500">*</span>
                </label>
                <select
                  value={conference}
                  onChange={(e) => setConference(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                >
                  <option value="">Pilih Konferensi</option>
                  <option value="ICICYTA">ICICyTA</option>
                  <option value="ICODSA">ICoDSA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Jenis Schedule
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                >
                  <option value="">Pilih Jenis (opsional)</option>
                  <option value="Speech">Speech/Keynote</option>
                  <option value="Reporting">Reporting/Presentation</option>
                  <option value="Panel">Panel Discussion</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Break">Coffee Break</option>
                  <option value="Activity">Activity/Tour</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Default: Speech jika tidak dipilih
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Lokasi/Link
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400"
                  placeholder="Nama ruangan atau link virtual (opsional)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-md bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}