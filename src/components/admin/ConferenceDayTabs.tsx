import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { BackendSchedule } from "@/types";

interface Props {
  daysList: string[];
  grouped: Record<string, BackendSchedule[]>;
  selectedDay: string;
  onDaySelect: (day: string) => void;
  onManageDays: () => void;
  onManageRooms: () => void;
  onManageSchedules: () => void;
  formatDate: (dateStr: string) => string;
  getDayNumber: (dateStr: string) => number;
}

export default function ConferenceDayTabs({
  daysList,
  grouped,
  selectedDay,
  onDaySelect,
  onManageDays,
  onManageRooms,
  onManageSchedules,
  formatDate,
  getDayNumber,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Conference Days</h3>
        <div className="flex gap-2">

          <Button
            onClick={onManageRooms}
            size="sm"
            variant="outline"
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Parallels
          </Button>
          <Button
            onClick={onManageSchedules}
            size="sm"
            variant="outline"
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Schedules
          </Button>
          <Button
            onClick={onManageDays}
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Days
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {daysList.map((day) => {
          const daySchedules = grouped[day] || [];
          const hasSchedules = daySchedules.length > 0;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => onDaySelect(day)}
              className={`
                flex-shrink-0 w-24 h-20 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center
                ${isSelected
                  ? "bg-[#015B97] text-white border-[#015B97] shadow-lg"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
                ${!hasSchedules ? "opacity-60" : ""}
              `}
            >
              <div className="text-center">
                <div
                  className={`text-sm font-bold mb-1 ${isSelected ? "text-white" : "text-gray-900"
                    }`}
                >
                  Day {getDayNumber(day)}
                </div>
                <div
                  className={`text-xs ${isSelected ? "text-gray-200" : "text-gray-600"
                    }`}
                >
                  {new Date(day).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                {hasSchedules && (
                  <div
                    className={`
                      text-xs font-bold mt-1 w-5 h-5 rounded-full flex items-center justify-center
                      ${isSelected
                        ? "bg-white text-[#015B97] "
                        : "bg-gray-900 text-white"
                      }
                    `}
                  >
                    {daySchedules.length}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}