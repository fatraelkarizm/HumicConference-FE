import React, { useEffect, useRef } from "react";
import type { ScheduleItem } from "@/types/schedule";

type Props = {
  open: boolean;
  item: ScheduleItem | null;
  onClose: () => void;
  onDetail: (item: ScheduleItem) => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
};

export default function ScheduleActionModal({ open, item, onClose, onDetail, onEdit, onDelete }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

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

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={handleOverlay}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-black mb-2">Actions</h3>

        <div className="text-sm text-gray-800 mb-3">
          <div className="font-semibold text-black">{item.title}</div>
          <div className="text-xs text-gray-600">{item.speaker}</div>
          <div className="text-xs text-gray-600">{item.timeDisplay ?? `${item.startTime ?? ""} ${item.endTime ?? ""}`}</div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onDetail(item);
              onClose();
            }}
            className="w-full text-left px-4 py-2 rounded-md border border-gray-200 bg-white text-black"
          >
            Detail
          </button>

          <button
            onClick={() => {
              onEdit(item);
              onClose();
            }}
            className="w-full text-left px-4 py-2 rounded-md border border-gray-200 bg-white text-black"
          >
            Edit
          </button>

          <button
            onClick={() => {
              if (confirm("Hapus schedule ini?")) {
                onDelete(item.id);
                onClose();
              }
            }}
            className="w-full text-left px-4 py-2 rounded-md border border-gray-200 bg-white text-red-600"
          >
            Delete
          </button>

          <button onClick={onClose} className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-200 text-black">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}