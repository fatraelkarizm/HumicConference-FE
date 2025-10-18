import React from "react";
import type { ScheduleItem } from "@/types/schedule";

type Props = {
  item: ScheduleItem;
  className?: string;
  // optional: if provided the card becomes clickable and will call onOpenDetail(id)
  onOpenDetail?: (id?: string) => void;
};

export default function ScheduleCard({ item, className = "", onOpenDetail }: Props) {
  const clickable = typeof onOpenDetail === "function";

  const rootClass =
    (clickable ? "cursor-pointer " : "") +
    "h-full rounded-lg border border-orange-200 bg-[#FFF5E6] p-4 shadow-sm flex flex-col justify-between " +
    className;

  return (
    <article
      onClick={clickable ? () => onOpenDetail?.(item.id) : undefined}
      className={rootClass}
      role={clickable ? "button" : "article"}
      tabIndex={clickable ? 0 : -1}
      aria-disabled={clickable ? undefined : true}
    >
      <div className="flex flex-col gap-2">
        <div className="text-sm leading-snug font-medium text-black">{item.title}</div>
        {item.description && <div className="text-xs text-gray-600 line-clamp-2">{item.description}</div>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0" />
          <div>
            {item.speaker && <div className="text-xs font-semibold text-black">{item.speaker}</div>}
            {item.location && <div className="text-xs text-gray-500">{item.location}</div>}
          </div>
        </div>

        {item.timeDisplay && <div className="text-xs text-gray-600">{item.timeDisplay}</div>}
      </div>
    </article>
  );
}