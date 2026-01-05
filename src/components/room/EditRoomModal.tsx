"use client";

import { useState, useEffect } from "react";
import { useRoomActions } from "@/hooks/useRoom";
import { useTrackOptions } from "@/hooks/useTrack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit2, Building, Globe, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import type { BackendRoom, UpdateRoomData } from "@/types/room";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  room: BackendRoom;
}

export default function EditRoomModal({ isOpen, onClose, room }: Props) {
  const [formData, setFormData] = useState<UpdateRoomData>({
    name: "",
    identifier: "",
    description: "",
    type: "MAIN",
    onlineMeetingUrl: "",
    trackId: "",
  });
  const [loading, setLoading] = useState(false);

  const { updateRoom } = useRoomActions();
  const { trackOptions } = useTrackOptions();

  // Initialize form data from room
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || "",
        identifier: room.identifier || "",
        description: room.description || "",
        type: room.type,
        onlineMeetingUrl: room.online_meeting_url || "",
        trackId: room.track_id || "",
      });
    }
  }, [room]);

  const roomTypes = [
    {
      value: "MAIN",
      label: "Main Room",
      description: "Primary session room for main activities",
      icon: "",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "PARALLEL",
      label: "Parallel Session",
      description: "Concurrent session room for breakout activities",
      icon: "",
      color: "bg-green-100 text-green-800",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        toast.error("Room name cannot be empty");
        return;
      }

      // Validate URL format if provided
      if (formData.onlineMeetingUrl && !isValidUrl(formData.onlineMeetingUrl)) {
        toast.error("Please enter a valid URL for online meeting");
        return;
      }



      const updateData: UpdateRoomData = {
        name: formData.name.trim(),
        identifier: formData.identifier?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        type: formData.type,
        onlineMeetingUrl: formData.onlineMeetingUrl?.trim() || undefined,
        trackId: formData.trackId || undefined,
      };



      await updateRoom(room.id, updateData);
      toast.success("Room updated successfully! ");
      onClose();
    } catch (error: any) {

      // Show detailed validation errors
      const data = error?.data;
      if (data?.errors?.validation) {
        const validations: Record<string, string[]> = data.errors.validation;
        const messages = Object.keys(validations).map(
          (k) => `${k}: ${validations[k].join(", ")}`
        );
        toast.error(`Validation failed: ${messages.join(" | ")}`, {
          duration: 8000,
        });
      } else {
        const serverMsg = data?.message || error?.message || String(error);
        toast.error(`Failed to update room: ${serverMsg}`, { duration: 8000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateRoomData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const selectedRoomType = roomTypes.find(
    (type) => type.value === formData.type
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit2 className="w-5 h-5 mr-2 text-blue-600" />
            Edit Room
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Building className="w-4 h-4" />
              <span>Room Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Room name"
                />
              </div>

              <div>
                <Label htmlFor="type">Room Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    handleInputChange("type", value as "MAIN" | "PARALLEL")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <span className="mr-2">{type.icon}</span>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="identifier">Room Identifier</Label>
                <Input
                  id="identifier"
                  value={formData.identifier || ""}
                  onChange={(e) =>
                    handleInputChange("identifier", e.target.value)
                  }
                  placeholder="e.g., Room A, Session 1A"
                />
              </div>
            </div>

            {selectedRoomType && (
              <div className={`p-4 rounded-lg ${selectedRoomType.color}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedRoomType.icon}</span>
                  <div>
                    <div className="font-medium">{selectedRoomType.label}</div>
                    <div className="text-sm">
                      {selectedRoomType.description}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Room description, moderator info, or special notes"
                rows={3}
              />
            </div>
          </div>

          {/* Online Meeting Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Globe className="w-4 h-4" />
              <span>Online Configuration</span>
            </div>

            <div>
              <Label htmlFor="onlineMeetingUrl">Online Meeting URL</Label>
              <Input
                id="onlineMeetingUrl"
                type="url"
                value={formData.onlineMeetingUrl || ""}
                onChange={(e) =>
                  handleInputChange("onlineMeetingUrl", e.target.value)
                }
                placeholder="https://zoom.us/j/...  or https://teams.microsoft.com/..."
              />
            </div>

            {formData.onlineMeetingUrl && (
              <div className="flex items-center space-x-2 text-sm">
                {isValidUrl(formData.onlineMeetingUrl) ? (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    ✓ Valid URL
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-200"
                  >
                    ✗ Invalid URL
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Track Assignment (for Parallel Rooms) */}
          {formData.type === "PARALLEL" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4" />
                <span>Track Assignment</span>
              </div>

              <div>
                <Label htmlFor="trackId">Associated Track</Label>
                <Select
                  value={formData.trackId || "no-track"}
                  onValueChange={(value) =>
                    handleInputChange(
                      "trackId",
                      value === "no-track" ? "" : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a track (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-track">No track assigned</SelectItem>
                    {trackOptions.map((track) => (
                      <SelectItem key={track.value} value={track.value}>
                        <div>
                          <div className="font-medium">{track.label}</div>
                          {track.description && (
                            <div className="text-xs text-gray-500">
                              {track.description}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Current Data Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">
              Current Room Information:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">ID:</span> {room.id}
              </div>
              <div>
                <span className="font-medium">Schedule ID:</span>{" "}
                {room.schedule_id}
              </div>
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(room.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Modified:</span>{" "}
                {new Date(room.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
