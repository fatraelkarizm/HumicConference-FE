import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { BackendSchedule } from "@/types";

interface Props {
  daysList: string[];
  grouped: Record<string, BackendSchedule[]>;
  selectedDay: string;
  onDaySelect: (day: string) => void;
  onAddDay: () => void;
  onAddTimeSlot: () => void;
  formatDate: (dateStr: string) => string;
  getDayNumber: (dateStr: string) => number;
}

export default function ConferenceDayTabs({
  daysList,
  grouped,
  selectedDay,
  onDaySelect,
  onAddDay,
  onAddTimeSlot,
  formatDate,
  getDayNumber,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Conference Days</h3>
        <div className="flex space-x-2">
          <Button
            onClick={onAddDay}
            size="sm"
            variant="outline"
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Day
          </Button>
          <Button
            onClick={onAddTimeSlot}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
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
                ${
                  isSelected
                    ?  "bg-black text-white border-black shadow-lg"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
                ${! hasSchedules ? "opacity-60" : ""}
              `}
            >
              <div className="text-center">
                <div
                  className={`text-sm font-bold mb-1 ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}
                >
                  Day {getDayNumber(day)}
                </div>
                <div
                  className={`text-xs ${
                    isSelected ? "text-gray-200" : "text-gray-600"
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
                      ${
                        isSelected
                          ?  "bg-white text-black"
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

        {/* Add Day Button */}
        <button
          onClick={onAddDay}
          className="flex-shrink-0 w-24 h-20 rounded-lg border-2 border-dashed border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center"
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Add Day</span>
        </button>
      </div>
    </div>
  );
}