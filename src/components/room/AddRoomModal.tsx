import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
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
  onSubmit: (roomData: any) => Promise<void>;
  selectedScheduleForRoom: BackendSchedule | null;
  selectedRoomType: string;
  newRoom: {
    name: string;
    identifier: string;
    description: string;
    type: "MAIN" | "PARALLEL";
    onlineMeetingUrl: string;
    startTime: string;
    endTime: string;
  };
  setNewRoom: (room: any) => void;
  loading: boolean;
  scheduleId?: string | null;
}

export default function AddRoomModal({
  isOpen,
  onClose,
  onSubmit,
  selectedScheduleForRoom,
  selectedRoomType,
  newRoom,
  setNewRoom,
  loading,
  scheduleId,
}: Props) {
  
  const formatTime = (time?: string) => {
    if (!time) return "--:--";
    const normalizedTime = time.replace(/\./g, ":");
    return normalizedTime.length <= 5 ? normalizedTime : normalizedTime.substring(0, 5);
  };

  const handleSubmit = async () => {
    if (!selectedScheduleForRoom) return;

    const isValidUrl = (str: string): boolean => {
      if (!str) return false;
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    };

    const payload = {
      name: newRoom.name,
      identifier: newRoom.identifier,
      description: newRoom.description || "",
      type: newRoom.type,
      scheduleId: selectedScheduleForRoom. id,
      startTime: newRoom.startTime || selectedScheduleForRoom.start_time,
      endTime: newRoom.endTime || selectedScheduleForRoom.end_time,
      onlineMeetingUrl: isValidUrl(newRoom.onlineMeetingUrl) ? newRoom.onlineMeetingUrl : null,
      track: {
        name: `Track ${selectedRoomType}`,
        description: `Parallel track for Room ${selectedRoomType}`,
      },
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Add Room {selectedRoomType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Schedule Information</Label>
            <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <div>
                <strong>Time:</strong>{" "}
                {formatTime(selectedScheduleForRoom?.start_time)} -{" "}
                {formatTime(selectedScheduleForRoom?.end_time)}
              </div>
              <div>
                <strong>Type:</strong>{" "}
                {selectedRoomType && `Parallel Room ${selectedRoomType}`}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="room-name">Room Name *</Label>
            <Input
              id="room-name"
              value={newRoom.name}
              onChange={(e) =>
                setNewRoom((prev: any) => ({
                  ... prev,
                  name: e.target.value,
                }))
              }
              placeholder={`Room ${selectedRoomType}`}
            />
          </div>

          <div>
            <Label htmlFor="room-identifier">Room Identifier *</Label>
            <Input
              id="room-identifier"
              value={newRoom.identifier}
              onChange={(e) =>
                setNewRoom((prev: any) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
              }
              placeholder={`Parallel Session 1${selectedRoomType}`}
            />
          </div>

          <div>
            <Label htmlFor="room-description">Description</Label>
            <Input
              id="room-description"
              value={newRoom.description}
              onChange={(e) =>
                setNewRoom((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Moderator: Name"
            />
          </div>

          <div>
            <Label htmlFor="room-url">Online Meeting URL</Label>
            <Input
              id="room-url"
              value={newRoom.onlineMeetingUrl}
              onChange={(e) =>
                setNewRoom((prev: any) => ({
                  ... prev,
                  onlineMeetingUrl: e.target. value,
                }))
              }
              placeholder="https://zoom.us/..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding Room..." : "Add Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}