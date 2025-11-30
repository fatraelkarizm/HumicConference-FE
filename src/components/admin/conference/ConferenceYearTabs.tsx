import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, EyeOff } from "lucide-react";
import type { BackendConferenceSchedule } from "@/types";

interface Props {
  availableYears: string[];
  selectedYear: string;
  onYearSelect: (year: string) => void;
  onCreateNew: () => void;
  conferenceType?: "ICICYTA" | "ICODSA";
  conferences?: BackendConferenceSchedule[];
  onToggleActive?: (conferenceId: string, isActive: boolean) => void;
}

export default function ConferenceYearTabs({
  availableYears,
  selectedYear,
  onYearSelect,
  onCreateNew,
  conferenceType = "ICICYTA",
  conferences = [],
  onToggleActive,
}: Props) {
  const conferenceName = conferenceType === "ICODSA" ? "ICODSA" : "ICICyTA";

  // Get conference for each year to show status
  const getConferenceForYear = (year: string) => {
    return conferences.find(conf => conf.year === year && conf.type === conferenceType);
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center space-x-1 py-4 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 mr-4 flex-shrink-0">
            Conference Series:
          </span>
          {availableYears.map((year) => {
            const conference = getConferenceForYear(year);
            const isActive = conference?.is_active !== false; // Default to true if not set

            return (
              <div key={year} className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => onYearSelect(year)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                    selectedYear === year
                      ?  "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span>{year}</span>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`text-xs ${
                      selectedYear === year
                        ? "bg-white text-blue-600"
                        : isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </button>

                {conference && onToggleActive && (
                  <Button
                    onClick={() => onToggleActive(conference.id, !isActive)}
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-8 w-8 ${
                      isActive
                        ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                    title={isActive ? "Deactivate conference" : "Activate conference"}
                  >
                    {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            );
          })}

          <Button
            onClick={onCreateNew}
            variant="outline"
            size="sm"
            className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-50 flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            New {conferenceName} Conference
          </Button>
        </div>
      </div>
    </div>
  );
}