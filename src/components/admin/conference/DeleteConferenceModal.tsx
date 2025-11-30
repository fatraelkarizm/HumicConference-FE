"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import type { BackendConferenceSchedule } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conference: BackendConferenceSchedule;
  onSuccess: () => void;
}

export default function DeleteConferenceModal({ isOpen, onClose, conference, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!conference.id) {
      toast.error("Conference ID is missing");
      return;
    }

    setLoading(true);
    try {
      const accessToken = await conferenceScheduleService.getAccessToken();
      if (!accessToken) {
        toast.error("Authentication failed");
        return;
      }
      console.log("🗑️ Deleting conference:", conference.id);
      await conferenceScheduleService.deleteConferenceSchedule(accessToken, conference.id);

      toast.success("Conference deleted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete conference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-600">Delete Conference</DialogTitle>
              <DialogDescription className="mt-2">
                Are you sure you want to delete this conference? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            <strong>Conference to be deleted:</strong>
            <br />
            {conference.name} ({conference.year})
            <br />
            <span className="text-red-600 font-medium">
              This will permanently delete all schedules, rooms, and track sessions associated with this conference.
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Conference"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}