import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type { BackendConferenceSchedule, BackendSchedule } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conference: BackendConferenceSchedule;
  daysList: string[];
  grouped: Record<string, BackendSchedule[]>;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  updateConferenceEndDate: (id: string, date: string) => Promise<any>;
  formatDate: (dateStr: string) => string;
  getDayNumber: (dateStr: string) => number;
  onRefresh?: () => void;
}

export default function ManageDaysModal({
  isOpen,
  onClose,
  conference,
  daysList,
  grouped,
  selectedDay,
  setSelectedDay,
  updateConferenceEndDate,
  formatDate,
  getDayNumber,
  onRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Manage Conference Days
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Conference Info */}
          <div>
            <Label>Current Conference Duration</Label>
            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Start:</strong> {formatDate(conference.start_date. split("T")[0])}
                </div>
                <div>
                  <strong>End:</strong> {formatDate(conference. end_date.split("T")[0])}
                </div>
                <div>
                  <strong>Total Days:</strong> {daysList.length}
                </div>
                <div>
                  <strong>Year:</strong> {new Date(conference.start_date). getFullYear()}
                </div>
              </div>
            </div>
          </div>

          {/* Days List */}
          <div>
            <Label>Conference Days</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-3">
              {daysList.map((day, index) => {
                const daySchedules = grouped[day] || [];
                const hasSchedules = daySchedules. length > 0;
                const isLastDay = index === daysList.length - 1;

                return (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Day {getDayNumber(day)} - {formatDate(day)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {hasSchedules ? `${daySchedules.length} schedule(s)` : "No schedules"}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setSelectedDay(day)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {!hasSchedules && daysList.length > 1 && (
                        <Button
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const dayIndex = daysList.indexOf(day);
                              
                              // Set end date to the previous day's date
                              const newEndDate = daysList[dayIndex - 1];
                              
                              if (!newEndDate) {
                                toast.error("Cannot delete the first day");
                                return;
                              }
                              
                              await updateConferenceEndDate(
                                conference.id, 
                                newEndDate
                              );

                              toast.success(`Day ${getDayNumber(day)} deleted successfully!`);
                              
                              if (selectedDay === day) {
                                setSelectedDay(daysList[dayIndex - 1] || daysList[0] || "");
                              }
                              
                              onRefresh?.();
                            } catch (error: any) {
                              toast.error(error.message || "Failed to delete day");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple Add Day */}
          <div className="border-t pt-4">
            <Label>Add New Day</Label>
            <div className="mt-2">
              <div className="p-3 border border-green-200 rounded bg-green-50">
                <h4 className="font-medium text-sm mb-2">Add Day by Date</h4>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="add-date" className="text-sm">Select date:</Label>
                  <Input
                    id="add-date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-40"
                  />
                  <Button
                    onClick={async () => {
                      const input = document.getElementById('add-date') as HTMLInputElement;
                      const selectedDate = input.value;
                      
                      if (! selectedDate) {
                        toast.error("Please select a date");
                        return;
                      }

                      const newDate = new Date(selectedDate);
                      const currentStartDate = new Date(conference.start_date);
                      const currentEndDate = new Date(conference. end_date);

                      if (newDate < currentStartDate) {
                        toast.error("Cannot add day before conference start date");
                        return;
                      }

                      let needsUpdate = false;
                      if (newDate > currentEndDate) {
                        needsUpdate = true;
                      }

                      setLoading(true);
                      try {
                        if (needsUpdate) {
                          await updateConferenceEndDate(conference.id, selectedDate);
                        }

                        toast.success(`Day ${formatDate(selectedDate)} added successfully! `);
                        input.value = '';
                        onRefresh?.();
                      } catch (error: any) {
                        toast.error(error. message || "Failed to add day");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    size="sm"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Day
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Add any specific date.  If date is after current end date, conference will be extended automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}