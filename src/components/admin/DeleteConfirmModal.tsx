import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { BackendSchedule } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: BackendSchedule | null;
  onConfirm: () => void;
  formatDate: (dateStr: string) => string;
  loading: boolean;
  isConferenceDelete?: boolean; // ✅ Add this prop
  conferenceName?: string; // ✅ Add this prop
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  schedule,
  onConfirm,
  formatDate,
  loading,
  isConferenceDelete = false, // ✅ Add this prop
  conferenceName, // ✅ Add this prop
}: Props) {
  
  const formatTime = (time?: string) => {
    if (!time) return "--:--";
    const normalizedTime = time.replace(/\./g, ":");
    return normalizedTime.length <= 5 ? normalizedTime : normalizedTime.substring(0, 5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <Trash2 className="w-5 h-5 mr-2" />
            {isConferenceDelete ? "Delete Conference" : "Delete Schedule"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* ✅ Conference Delete Content */}
          {isConferenceDelete ?  (
            <>
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete this entire conference?  This will permanently remove:
              </p>
              
              <ul className="text-sm text-gray-600 mb-4 space-y-1 ml-4">
                <li>• All schedules and time slots</li>
                <li>• All rooms and sessions</li>
                <li>• All track sessions and papers</li>
                <li>• All conference data and settings</li>
              </ul>

              {conferenceName && (
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm">
                    <div>
                      <strong>Conference:</strong> {conferenceName}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone.  All data will be permanently lost.
                </p>
              </div>
            </>
          ) : (
            // ✅ Schedule Delete Content (existing)
            <>
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete this schedule?  This will also
                remove all associated rooms and sessions.
              </p>

              {schedule && (
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm">
                    <div>
                      <strong>Date:</strong>{" "}
                      {formatDate(schedule.date.  split("T")[0])}
                    </div>
                    <div>
                      <strong>Time:</strong>{" "}
                      {formatTime(schedule.start_time)} -{" "}
                      {formatTime(schedule.end_time)}
                    </div>
                    <div>
                      <strong>Type:</strong> {schedule.type}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone.  
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ?  
              (isConferenceDelete ? "Deleting Conference..." : "Deleting Schedule...") : 
              (isConferenceDelete ? "Delete Conference" : "Delete Schedule")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}