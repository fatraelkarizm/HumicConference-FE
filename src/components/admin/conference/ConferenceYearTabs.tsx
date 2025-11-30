import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  availableYears: string[];
  selectedYear: string;
  onYearSelect: (year: string) => void;
  onCreateNew: () => void;
}

export default function ConferenceYearTabs({
  availableYears,
  selectedYear,
  onYearSelect,
  onCreateNew,
}: Props) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center space-x-1 py-4 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 mr-4 flex-shrink-0">
            Conference Series:
          </span>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => onYearSelect(year)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${
                selectedYear === year
                  ?  "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {year}
            </button>
          ))}
          
          <Button
            onClick={onCreateNew}
            variant="outline"
            size="sm"
            className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-50 flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            New ICICyTA Conference
          </Button>
        </div>
      </div>
    </div>
  );
}