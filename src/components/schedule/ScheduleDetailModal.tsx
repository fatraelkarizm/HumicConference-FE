import React, { useEffect, useRef } from "react";
import type { ScheduleItem } from "@/types/schedule";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  open: boolean;
  item: ScheduleItem | null;
  onClose: () => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
};

export default function ScheduleDetailModal({ open, item, onClose, onEdit, onDelete }: Props) {
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
    <div ref={ref} className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4" onMouseDown={handleOverlay} role="dialog" aria-modal="true">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-4" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black mb-1">{item.title}</h3>
            <div className="text-sm text-gray-600">{item.speaker}</div>
            <div className="text-xs text-gray-500 mt-1">{item.location} • {item.date} • {item.timeDisplay}</div>
          </div>

          <div className="flex items-start gap-2">
            <button onClick={() => onEdit(item)} title="Edit" className="p-2 rounded-md bg-gray-50 border text-black">
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm("Hapus schedule ini?")) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              title="Delete"
              className="p-2 rounded-md bg-gray-50 border text-red-600"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button onClick={onClose} title="Close" className="p-2 rounded-md bg-gray-50 border text-black">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {item.description && <div className="mt-3 text-sm text-gray-700">{item.description}</div>}

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">Conference</div>
            <div className="text-black">{item.conference}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Day</div>
            <div className="text-black">{item.dayTitle ?? `Day ${item.dayNumber ?? 1}`}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="text-black">{item.location}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Type</div>
            <div className="text-black">{item.scheduleType}</div>
          </div>
        </div>
      </div>
    </div>
  );
}