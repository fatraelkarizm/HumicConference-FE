"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Filter, Search, Clock, MoreHorizontal, Trash2, Eye, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { useRoomActions } from "@/hooks/useRoom";
import type { BackendRoom, BackendSchedule } from "@/types";

interface Props {
  conferenceId: string;
  rooms: BackendRoom[];
  schedules: BackendSchedule[];
  loading: boolean;
  onModalOpen: (modal: string) => void;
  onRoomSelect: (room: BackendRoom) => void;
  onRefresh: () => void;
}

export default function RoomManagementTab({
  conferenceId,
  rooms,
  schedules,
  loading,
  onModalOpen,
  onRoomSelect,
  onRefresh,
}: Props) {
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { deleteRoom } = useRoomActions();

  // ✅ Filter rooms belonging to this conference only
  const conferenceRooms = useMemo(() => {
    const conferenceScheduleIds = schedules.map(s => s.id);
    return rooms.filter(room => conferenceScheduleIds.includes(room.schedule_id));
  }, [rooms, schedules]);

  // Apply filters
  const filteredRooms = useMemo(() => {
    let filtered = conferenceRooms;

    if (roomFilter !== "all") {
      if (roomFilter === "main") {
        filtered = filtered.filter((room) => room.type === "MAIN");
      } else if (roomFilter === "parallel") {
        filtered = filtered.filter((room) => room.type === "PARALLEL");
      }
    }

    if (roomSearchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
          room.identifier?.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(roomSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [conferenceRooms, roomFilter, roomSearchTerm]);

  // ✅ Bulk Selection State
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  // Toggle All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRooms(filteredRooms.map(r => r.id));
    } else {
      setSelectedRooms([]);
    }
  };

  // Toggle Single
  const handleSelectRoom = (roomId: string) => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  // ✅ Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedRooms.length === 0) return;
    if (!confirm(`⚠️ WARNING: Are you sure you want to delete ${selectedRooms.length} selected rooms? This action cannot be undone.`)) return;

    setDeleteLoading(true);
    const toastId = toast.loading("Deleting rooms...");
    let successCount = 0;

    try {
      // Use parallel deletion for speed
      const promises = selectedRooms.map(async (roomId) => {
        try {
          await deleteRoom(roomId);
          successCount++;
        } catch (error) {
        }
      });

      await Promise.all(promises);

      toast.success(`Successfully deleted ${successCount} rooms!`, { id: toastId });
      setSelectedRooms([]);
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to delete some rooms", { id: toastId });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ Handle Delete Room
  const handleDeleteRoom = async (room: BackendRoom) => {
    if (!confirm(`Are you sure you want to delete room "${room.name}"?`)) return;

    setDeleteLoading(true);
    try {
      await deleteRoom(room.id);
      toast.success("Room deleted successfully!");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Room Management</span>
            {selectedRooms.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedRooms.length})
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {filteredRooms.length} of {conferenceRooms.length} rooms
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ✅ Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Checkbox Select All */}
            <div className="flex items-center justify-center bg-gray-50 border rounded-md px-4 w-auto">
              <input
                type="checkbox"
                id="select-all"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                checked={filteredRooms.length > 0 && selectedRooms.length === filteredRooms.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                Select All
              </label>
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Filter by Room</span>
              </div>
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="main">Main Room</SelectItem>
                  <SelectItem value="parallel">Parallel Sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Search Rooms</span>
              </div>
              <Input
                placeholder="Search by name, identifier, or description..."
                value={roomSearchTerm}
                onChange={(e) => setRoomSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ✅ Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No rooms found for this conference. </p>
            <Button
              onClick={() => onModalOpen("add-room")}
              className="mt-3 bg-[#015B97] hover:bg-[#014f7a]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow relative ${selectedRooms.includes(room.id) ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : ''
                  }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    checked={selectedRooms.includes(room.id)}
                    onChange={() => handleSelectRoom(room.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex justify-between items-start pl-8">
                  <h3 className="font-medium">{room.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={room.type === "MAIN" ? "default" : "secondary"}>
                      {room.type}
                    </Badge>

                    {/* ✅ Room Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            onRoomSelect(room);
                            onModalOpen("detail-room");
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onRoomSelect(room);
                            onModalOpen("edit-room");
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Room
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRoom(room)}
                          className="text-red-600"
                          disabled={deleteLoading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="pl-8">
                  {room.identifier && (
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                      {room.identifier}
                    </p>
                  )}

                  {room.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-gray-500 pl-8">
                  {room.online_meeting_url && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  )}
                  {room.start_time && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {room.start_time}-{room.end_time}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}