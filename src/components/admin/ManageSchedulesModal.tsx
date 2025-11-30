"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Eye, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type { BackendSchedule } from "@/types";

interface ManageSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: BackendSchedule[];
  onAddSchedule: () => void;
  onEditSchedule: (schedule: BackendSchedule) => void;
  onDeleteSchedule: (schedule: BackendSchedule) => void;
  onViewSchedule: (schedule: BackendSchedule) => void;
  formatDate: (dateStr: string) => string;
}

export default function ManageSchedulesModal({
  isOpen,
  onClose,
  schedules,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onViewSchedule,
  formatDate,
}: ManageSchedulesModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDeleteSchedule = async (schedule: BackendSchedule) => {
    if (!confirm(`Delete schedule "${schedule.notes || 'Unnamed'}"?`)) return;

    setLoading(true);
    try {
      await onDeleteSchedule(schedule);
      toast.success("Schedule deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "--:--";
    return timeStr.slice(0, 5); // HH:MM
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      TALK: "bg-blue-100 text-blue-800",
      BREAK: "bg-yellow-100 text-yellow-800",
      ONE_DAY_ACTIVITY: "bg-green-100 text-green-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Schedules</span>
            <Button
              onClick={onAddSchedule}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Schedules List */}
          <div className="space-y-2">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No schedules found. Click "Add Schedule" to create one.
              </div>
            ) : (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium text-sm">
                        {formatDate(schedule.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(schedule.type)}`}>
                        {schedule.type}
                      </span>
                    </div>
                    {schedule.notes && (
                      <div className="text-sm text-gray-700">
                        {schedule.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onViewSchedule(schedule)}
                      size="sm"
                      variant="ghost"
                      className="text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onEditSchedule(schedule)}
                      size="sm"
                      variant="ghost"
                      className="text-green-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteSchedule(schedule)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}