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
  updateConferenceDates: (id: string, startDate: string, endDate: string) => Promise<any>;
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
  updateConferenceDates,
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
                  <strong>Start:</strong> {formatDate(conference.start_date.split("T")[0])}
                </div>
                <div>
                  <strong>End:</strong> {formatDate(conference.end_date.split("T")[0])}
                </div>
                <div>
                  <strong>Total Days:</strong> {daysList.length}
                </div>
                <div>
                  <strong>Year:</strong> {new Date(conference.start_date).getFullYear()}
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
                const hasSchedules = daySchedules.length > 0;
                const isFirstDay = index === 0;
                const isLastDay = index === daysList.length - 1;
                const canDelete = daysList.length > 1 && (isFirstDay || isLastDay);

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

                      {canDelete && (
                        <Button
                          onClick={async () => {
                            if (hasSchedules) {
                              if (!confirm(`This day has ${daySchedules.length} schedules. Deleting it will remove them. Continue?`)) {
                                return;
                              }
                            } else {
                              if (!confirm(`Are you sure you want to delete Day ${getDayNumber(day)}?`)) {
                                return;
                              }
                            }



                            setLoading(true);
                            try {
                              let newStartDate = conference.start_date.split("T")[0];
                              let newEndDate = conference.end_date.split("T")[0];

                              if (isFirstDay && daysList.length > 1) {
                                // Deleting first day -> Start date becomes next day (index 1)
                                const nextDay = daysList[1];
                                if (!nextDay) throw new Error("Next day logic failed: Day 1 is missing");
                                newStartDate = nextDay;
                                newStartDate = nextDay;

                              } else if (isLastDay && daysList.length > 1) {
                                // Deleting last day -> End date becomes previous day (2nd to last)
                                const prevDay = daysList[daysList.length - 2];
                                if (!prevDay) throw new Error("Previous day logic failed");
                                newEndDate = prevDay;
                                newEndDate = prevDay;

                              } else {
                                throw new Error("Invalid delete operation: Not first or last day, or only 1 day left");
                              }

                              // Safety Check
                              if (newStartDate > newEndDate) {
                                throw new Error(`Invalid date range calculated: ${newStartDate} to ${newEndDate}`);
                              }


                              await updateConferenceDates(conference.id, newStartDate, newEndDate);

                              toast.success(`Day ${getDayNumber(day)} deleted successfully!`);

                              if (selectedDay === day) {
                                // Move selection to safe fallback
                                if (isLastDay) setSelectedDay(daysList[daysList.length - 2]);
                                else if (isFirstDay) setSelectedDay(daysList[1]);
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
                    className="w-40"
                  />
                  <Button
                    onClick={async () => {
                      const input = document.getElementById('add-date') as HTMLInputElement;
                      const selectedDate = input.value;



                      if (!selectedDate) {
                        toast.error("Please select a date");
                        return;
                      }

                      // We use string comparison for YYYY-MM-DD to avoid timezone issues with Date objects
                      const newDateStr = selectedDate;
                      const currentStartStr = conference.start_date.split("T")[0];
                      const currentEndStr = conference.end_date.split("T")[0];

                      let finalStart = currentStartStr;
                      let finalEnd = currentEndStr;

                      if (newDateStr < currentStartStr) {
                        finalStart = newDateStr;
                      } else if (newDateStr > currentEndStr) {
                        finalEnd = newDateStr;
                      } else {
                        toast.error("Date is already included in the conference duration");
                        return;
                      }

                      setLoading(true);
                      try {
                        await updateConferenceDates(conference.id, finalStart, finalEnd);
                        toast.success(`Day added successfully!`);
                        input.value = '';
                        onRefresh?.();
                      } catch (error: any) {
                        toast.error(error.message || "Failed to add day");
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
                  Adding a date before start or after end will extend the conference.
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