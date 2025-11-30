"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type { BackendRoom, BackendSchedule } from "@/types";

interface ManageRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: BackendRoom[];
  schedules: BackendSchedule[];
  onAddRoom: (roomData: any) => Promise<void>;
  onEditRoom: (room: BackendRoom) => void;
  onDeleteRoom: (room: BackendRoom) => Promise<void>;
  onViewRoom: (room: BackendRoom) => void;
}

export default function ManageRoomsModal({
  isOpen,
  onClose,
  rooms,
  schedules,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onViewRoom,
}: ManageRoomsModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<BackendRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    identifier: "",
    description: "",
    type: "MAIN" as "MAIN" | "PARALLEL",
    online_meeting_url: "",
    schedule_id: "",
  });

  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.schedule_id) {
      toast.error("Name and Schedule are required");
      return;
    }

    setLoading(true);
    try {
      await onAddRoom({
        ...newRoom,
        startTime: "", // Will be set from schedule
        endTime: "",
        track: newRoom.type === "PARALLEL" ? { name: `Track ${newRoom.name}`, description: "" } : undefined,
      });
      setNewRoom({
        name: "",
        identifier: "",
        description: "",
        type: "MAIN",
        online_meeting_url: "",
        schedule_id: "",
      });
      setShowAddForm(false);
      toast.success("Room added successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (room: BackendRoom) => {
    if (!confirm(`Delete room "${room.name}"?`)) return;

    setLoading(true);
    try {
      await onDeleteRoom(room);
      toast.success("Room deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  const getScheduleInfo = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    return schedule ? `${schedule.date} ${schedule.start_time || ""}-${schedule.end_time || ""}` : "Unknown";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Rooms</span>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Room Form */}
          {showAddForm && (
            <div className="border border-gray-200 rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Add New Room</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="Room name"
                  />
                </div>
                <div>
                  <Label>Identifier</Label>
                  <Input
                    value={newRoom.identifier}
                    onChange={(e) => setNewRoom({ ...newRoom, identifier: e.target.value })}
                    placeholder="Room identifier"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newRoom.type}
                    onValueChange={(value: "MAIN" | "PARALLEL") => setNewRoom({ ...newRoom, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAIN">Main</SelectItem>
                      <SelectItem value="PARALLEL">Parallel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Schedule</Label>
                  <Select
                    value={newRoom.schedule_id}
                    onValueChange={(value) => setNewRoom({ ...newRoom, schedule_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {getScheduleInfo(schedule.id)} - {schedule.notes || "No notes"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="Room description"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Online Meeting URL</Label>
                  <Input
                    value={newRoom.online_meeting_url}
                    onChange={(e) => setNewRoom({ ...newRoom, online_meeting_url: e.target.value })}
                    placeholder="Online meeting URL"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddRoom} disabled={loading}>
                  Add Room
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Rooms List */}
          <div className="space-y-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {room.name} ({room.identifier})
                  </div>
                  <div className="text-xs text-gray-500">
                    {room.type} - Schedule: {getScheduleInfo(room.schedule_id)}
                  </div>
                  {room.description && (
                    <div className="text-xs text-gray-600 mt-1">
                      {room.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onViewRoom(room)}
                    size="sm"
                    variant="ghost"
                    className="text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onEditRoom(room)}
                    size="sm"
                    variant="ghost"
                    className="text-green-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteRoom(room)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}