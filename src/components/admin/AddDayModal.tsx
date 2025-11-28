import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type { BackendConferenceSchedule } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conference: BackendConferenceSchedule;
  daysList: string[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onRefresh?: () => void;
  formatDate: (dateStr: string) => string;
}

export default function AddDayModal({
  isOpen,
  onClose,
  conference,
  daysList,
  loading,
  setLoading,
  onRefresh,
  formatDate,
}: Props) {
  const [extendedDays, setExtendedDays] = useState(0);

  const getNewEndDate = (currentEndDate: string, daysToAdd: number): Date => {
    const newDate = new Date(currentEndDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    return newDate;
  };

  const updateConferenceEndDate = async (conferenceId: string, newEndDate: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conference-schedule/${conferenceId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          end_date: newEndDate,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to update conference end date");
    }

    return response.json();
  };

  const handleExtendConference = async () => {
    if (extendedDays <= 0) {
      toast.error("Please specify the number of days to add");
      return;
    }

    setLoading(true);
    try {
      const newEndDate = getNewEndDate(conference.end_date, extendedDays);
      await updateConferenceEndDate(
        conference.id,
        newEndDate.toISOString(). split("T")[0]
      );

      toast.success(
        `Conference extended by ${extendedDays} day${
          extendedDays !== 1 ? "s" : ""
        }! `
      );
      onClose();
      setExtendedDays(0);
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to extend conference");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setExtendedDays(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2 text-purple-600" />
            Extend Conference Days
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Current Conference Duration</Label>
            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
              <div className="flex justify-between items-center">
                <span>
                  <strong>From:</strong>{" "}
                  {formatDate(conference.start_date. split("T")[0])}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>
                  <strong>To:</strong>{" "}
                  {formatDate(conference.end_date.split("T")[0])}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <strong>Current Days:</strong> {daysList.length}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="extend-days">Extend by Days</Label>
            <div className="flex items-center space-x-3 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExtendedDays(Math.max(0, extendedDays - 1))}
                disabled={extendedDays <= 0}
              >
                -
              </Button>
              <Input
                id="extend-days"
                type="number"
                min="0"
                max="30"
                value={extendedDays}
                onChange={(e) =>
                  setExtendedDays(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExtendedDays(Math.min(30, extendedDays + 1))}
                disabled={extendedDays >= 30}
              >
                +
              </Button>
            </div>
            {extendedDays > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                Adding {extendedDays} day{extendedDays !== 1 ? "s" : ""} will
                extend conference until{" "}
                {formatDate(
                  getNewEndDate(conference.end_date, extendedDays)
                    .toISOString()
                    .split("T")[0]
                )}
              </p>
            )}
          </div>

          {extendedDays > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
              <h4 className="font-medium text-sm mb-2 text-purple-800">
                Preview New Days:
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Array.from({ length: extendedDays }, (_, i) => {
                  const newDate = new Date(conference.end_date);
                  newDate.setDate(newDate.getDate() + i + 1);
                  return (
                    <div key={i} className="text-xs text-purple-700">
                      <strong>Day {daysList. length + i + 1}:</strong>{" "}
                      {formatDate(newDate.toISOString().split("T")[0])}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExtendConference}
            disabled={loading || extendedDays <= 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading
              ? "Extending..."
              : `Add ${extendedDays} Day${extendedDays !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}