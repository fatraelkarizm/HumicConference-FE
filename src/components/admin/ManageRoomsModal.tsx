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
import roomService from "@/services/RoomServices";
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
  const [filterType, setFilterType] = useState<string>("ALL");
  const [newRoom, setNewRoom] = useState({
    name: "",
    identifier: "",
    description: "",
    type: "PARALLEL" as "MAIN" | "PARALLEL",
    online_meeting_url: "",
    schedule_id: "",
    trackName: "", // Add trackName to state
  });

  const handleAddRoom = async () => {
    // Auto-select the first schedule if none selected (since we removed the UI)
    const targetScheduleId = newRoom.schedule_id || schedules[0]?.id;

    if (!newRoom.name || !targetScheduleId) {
      toast.error("Name and valid Schedule are required");
      return;
    }

    if (newRoom.type === "PARALLEL" && !newRoom.trackName.trim()) {
      toast.error("Track Name is required for Parallel Rooms");
      return;
    }

    setLoading(true);

    try {
      // ✅ FETCH FRESH ROOMS DATA for this schedule to ensure complete duplicate check
      const accessToken = await roomService.getAccessToken();
      if (!accessToken) {
        throw new Error("Authentication required");
      }

      const existingRoomsForSchedule = await roomService.getAllRooms(accessToken, targetScheduleId);

      // CHECK FOR DUPLICATE IDENTIFIER
      // ✅ If identifier is empty, auto-generate from name
      let finalIdentifier = newRoom.identifier?.trim() || newRoom.name?.trim() || `Room ${Date.now()}`;

      if (finalIdentifier) {
        const identifierExists = existingRoomsForSchedule.some(
          r => r.identifier?.toLowerCase() === finalIdentifier.toLowerCase()
        );

        if (identifierExists) {
          // Auto-generate unique identifier by adding/incrementing number
          let counter = 2;
          let candidate = `${finalIdentifier} ${counter}`;
          while (existingRoomsForSchedule.some(r => r.identifier?.toLowerCase() === candidate.toLowerCase())) {
            counter++;
            candidate = `${finalIdentifier} ${counter}`;
          }
          finalIdentifier = candidate;
          toast(`Identifier auto-generated: "${finalIdentifier}"`, { duration: 4000 });
        }
      }

      const selectedSchedule = schedules.find(s => s.id === targetScheduleId);

      const ensureHHMM = (time?: string) => {
        if (!time) return "";
        const parts = time.replace(/\./g, ":").split(":");
        if (parts.length >= 2) {
          const hh = parts[0].padStart(2, "0");
          const mm = parts[1].padStart(2, "0");
          return `${hh}:${mm}`;
        }
        return time;
      };

      await onAddRoom({
        ...newRoom,
        identifier: finalIdentifier, // Use validated/auto-generated identifier
        startTime: ensureHHMM(selectedSchedule?.start_time),
        endTime: ensureHHMM(selectedSchedule?.end_time),
        scheduleId: targetScheduleId,
        onlineMeetingUrl: newRoom.online_meeting_url,
        track: newRoom.type === "PARALLEL" ? { name: newRoom.trackName, description: `Track for room ${newRoom.name}` } : undefined,
      });
      setNewRoom({
        name: "",
        identifier: "",
        description: "",
        type: "PARALLEL",
        online_meeting_url: "",
        schedule_id: "",
        trackName: "",
      });
      setShowAddForm(false);
      toast.success("Room and Track added successfully");
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

  const extractRoomId = (room: BackendRoom): string | null => {
    const name = (room.name || "").toLowerCase().trim();
    const identifier = (room.identifier || "").toLowerCase().trim();

    const roomNameMatch = name.match(/^room\s+([a-e])$/i);
    if (roomNameMatch) return roomNameMatch[1].toUpperCase();

    const identifierMatch = identifier.match(/parallel\s+session\s+1([a-e])$/i);
    if (identifierMatch) return identifierMatch[1].toUpperCase();

    return null;
  };

  const filteredRooms = rooms.filter(r => {
    if (r.type !== 'PARALLEL') return false;
    if (filterType === 'ALL') return true;

    const roomId = extractRoomId(r);
    return roomId === filterType;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Parallel Rooms</span>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Rooms</SelectItem>
                  {['A', 'B', 'C', 'D', 'E'].map(label => (
                    <SelectItem key={label} value={label}>Room {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Room Form */}
          {showAddForm && (
            <div className="border border-gray-200 rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Add New Room</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room-name">Name</Label>
                    <Input
                      id="room-name"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      placeholder="e.g. Room A"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 text-gray-500 text-sm flex items-center">
                      Parallel Room
                    </div>
                  </div>
                </div>

                {/* Track Name Input - Only for Parallel Rooms */}
                {newRoom.type === "PARALLEL" && (
                  <div>
                    <Label htmlFor="track-name" className="text-blue-700 font-medium">Track Category Name</Label>
                    <Input
                      id="track-name"
                      value={newRoom.trackName}
                      onChange={(e) => setNewRoom({ ...newRoom, trackName: e.target.value })}
                      placeholder="e.g. Cybernetics and Data Science"
                      className="border-blue-200 bg-blue-50 focus:border-blue-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will create a new Track Category associated with this room.</p>
                  </div>
                )}

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="Room description"
                  />
                </div>
                <div>
                  <Label>Online Meeting URL</Label>
                  <Input
                    value={newRoom.online_meeting_url}
                    onChange={(e) => setNewRoom({ ...newRoom, online_meeting_url: e.target.value })}
                    placeholder="Online meeting URL"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddRoom} disabled={loading}>
                    Add Room & Track
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rooms List - Show only MAIN rooms */}
          <div className="space-y-2">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border border-dashed rounded-lg">
                No rooms match the filter.
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {room.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Schedule: {getScheduleInfo(room.schedule_id)}
                    </div>
                    {room.description && (
                      <div className="text-xs text-gray-600 mt-1">
                        {room.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Actions */}
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
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}