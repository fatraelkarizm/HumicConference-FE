import React, { useEffect, useRef, useState } from "react";

type NewSessionData = {
  title: string;
  conference: string;
  date: string;
  startTime: string;
  endTime: string;
  speaker: string;
  description: string;
  location: string;
  sessionType: string;
};

type SessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewSessionData) => void;
};

export default function SessionModal({ isOpen, onClose, onSave }: SessionModalProps) {
  const [title, setTitle] = useState("");
  const [conference, setConference] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [sessionType, setSessionType] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setConference("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setSpeaker("");
      setDescription("");
      setLocation("");
      setSessionType("");
    }
  }, [isOpen]);

  // Close on ESC
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

  function handleSave() {
    // simple validation
    if (!title.trim() || !date || !startTime || !endTime) {
      // Basic client-side feedback (could be improved)
      alert("Tolong isi minimal: Judul sesi, Tanggal, Waktu mulai dan selesai.");
      return;
    }

    onSave({
      title,
      conference,
      date,
      startTime,
      endTime,
      speaker,
      description,
      location,
      sessionType,
    });

    onClose();
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-lg ring-1 ring-black/5" onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-medium text-[#64748B]">Form Sesi Baru</h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#64748B] rounded p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm text-[#64748B]">Judul Sesi</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md bordert text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter Judul Sesi"
              />

              <label className="block text-sm text-[#64748B] mt-2">Tanggal Pelaksanaan</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-sm text-[#64748B]">Waktu mulai</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-md border text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#64748B]">Waktu selesai</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-md borde text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <label className="block text-sm text-[#64748B] mt-2">Pembicara</label>
              <input
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full rounded-md border text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Type your pembicara"
              />

              <label className="block text-sm text-[#64748B] mt-2">Deskripsi Sesi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={4}
                placeholder="Type your Deskripsi"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-[#64748B]">Konferensi</label>
              <select
                value={conference}
                onChange={(e) => setConference(e.target.value)}
                className="w-full rounded-md border text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Pilih Konferensi</option>
                <option value="ICICyTA">ICICyTA</option>
                <option value="ICoDSA">ICoDSA</option>
              </select>

              <label className="block text-sm text-[#64748B] mt-2">Jenis Sesi</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full rounded-md border text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Pilih Jenis Sesi</option>
                <option value="Speech">Speech</option>
                <option value="Workshop">Workshop</option>
                <option value="Panel">Panel</option>
              </select>

              <label className="block text-sm text-[#64748B] mt-2">Lokasi/Link</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border text-[#64748B] border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Type your nama ruangan/link virtual"
              />

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                >
                  Save
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
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