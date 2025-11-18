"use client";

import { useState, useMemo } from "react";
import { useScheduleActions } from "@/hooks/useSchedule";
import { useRoom, useRoomActions } from "@/hooks/useRoom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Edit2,
  Eye,
  Trash2,
  Plus,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
} from "@/types";
import { JSX } from "react/jsx-runtime";

interface Props {
  conference: BackendConferenceSchedule;
  schedules: BackendSchedule[];
  onScheduleSelect: (schedule: BackendSchedule) => void;
  onScheduleEdit: (schedule: BackendSchedule) => void;
  onScheduleDetail: (schedule: BackendSchedule) => void;
  onRoomEdit: (room: BackendRoom) => void;
  onRoomDetail: (room: BackendRoom) => void;
  onRefresh?: () => void;
}

export default function ConferenceScheduleTable({
  conference,
  schedules,
  onScheduleSelect,
  onScheduleEdit,
  onScheduleDetail,
  onRoomEdit,
  onRoomDetail,
  onRefresh,
}: Props) {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [selectedScheduleForRoom, setSelectedScheduleForRoom] =
    useState<BackendSchedule | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: "",
    endTime: "",
  });
  const [newRoom, setNewRoom] = useState({
    name: "",
    identifier: "",
    description: "",
    type: "PARALLEL" as "MAIN" | "PARALLEL",
    onlineMeetingUrl: "",
    startTime: "",
    endTime: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    schedule: BackendSchedule | null;
  }>({ isOpen: false, schedule: null });
  const [loading, setLoading] = useState(false);

  const { createSchedule, deleteSchedule } = useScheduleActions();
  const { createRoom } = useRoomActions();

  // Group schedules by day and generate all days in conference range
  const schedulesByDay = useMemo(() => {
    const grouped: Record<string, BackendSchedule[]> = {};

    // Generate all days between conference start and end
    const startDate = new Date(conference.start_date);
    const endDate = new Date(conference.end_date);
    const daysList: string[] = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      daysList.push(dateStr);
      grouped[dateStr] = [];
    }

    // Add existing schedules to their respective days
    schedules.forEach((schedule) => {
      const date = new Date(schedule.date).toISOString().split("T")[0];
      if (grouped[date]) {
        grouped[date].push(schedule);
      }
    });

    // Sort schedules within each day by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = a.start_time || "00:00";
        const timeB = b.start_time || "00:00";
        return timeA.localeCompare(timeB);
      });
    });

    return { grouped, daysList };
  }, [schedules, conference.start_date, conference.end_date]);

  const { grouped, daysList } = schedulesByDay;
  const currentDay = selectedDay || daysList[0] || "";

  // Get all rooms and filter for current day schedules
  const {
    rooms: allRooms,
    loading: roomsLoading,
    refetch: refetchRooms,
  } = useRoom();

  const currentDayRooms = useMemo(() => {
    const daySchedules = grouped[currentDay] || [];
    const dayScheduleIds = daySchedules.map((schedule) => schedule.id);

    return allRooms.filter((room) => dayScheduleIds.includes(room.schedule_id));
  }, [allRooms, grouped, currentDay]);

  // Extract room ID from BackendRoom
  const extractRoomId = (room: BackendRoom): string | null => {
    const name = (room.name || "").toLowerCase().trim();
    const identifier = (room.identifier || "").toLowerCase().trim();

    // Match "Room A", "Room B", etc.
    const roomNameMatch = name.match(/^room\s+([a-e])$/i);
    if (roomNameMatch) {
      return roomNameMatch[1].toUpperCase();
    }

    // Backup: From identifier "Parallel Session 1A" -> "A"
    const identifierMatch = identifier.match(/parallel\s+session\s+1([a-e])$/i);
    if (identifierMatch) {
      return identifierMatch[1].toUpperCase();
    }

    return null;
  };

  // Generate room columns from BackendRoom data
  const roomColumnsForDay = useMemo(() => {
    const parallelRooms = currentDayRooms.filter(
      (room) => room.type === "PARALLEL"
    );
    const roomColumns: Array<{
      id: string;
      label: string;
      room: BackendRoom;
      sortOrder: number;
    }> = [];

    const roomMap = new Map<string, BackendRoom>();

    parallelRooms.forEach((room) => {
      const roomId = extractRoomId(room);
      if (roomId && !roomMap.has(roomId)) {
        roomMap.set(roomId, room);
      }
    });

    // Sort by letter A, B, C, D, E
    const sortedRoomIds = Array.from(roomMap.keys()).sort((a, b) =>
      a.localeCompare(b)
    );

    sortedRoomIds.forEach((roomId, index) => {
      const room = roomMap.get(roomId);
      if (room) {
        roomColumns.push({
          id: roomId,
          label: `Room ${roomId}`,
          room: room,
          sortOrder: index,
        });
      }
    });

    // If no parallel rooms, create default columns
    if (roomColumns.length === 0) {
      ["A", "B", "C", "D", "E"].forEach((letter, index) => {
        roomColumns.push({
          id: letter,
          label: `Room ${letter}`,
          room: null as any,
          sortOrder: index,
        });
      });
    }

    return roomColumns;
  }, [currentDayRooms]);

  // Get room content for specific column
  const getRoomContentForColumn = (
    columnId: string,
    schedule?: BackendSchedule
  ): JSX.Element | null => {
    // Find room by column ID and schedule ID
    const room = currentDayRooms.find((room) => {
      const extractedId = extractRoomId(room);
      const matchesColumn = extractedId === columnId;
      const matchesSchedule = room.schedule_id === schedule?.id;
      return matchesColumn && matchesSchedule;
    });

    if (!room) {
      return null;
    }

    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-blue-700">
          {room.identifier}
        </div>

        <div className="text-xs text-gray-600 mb-2">(Online)</div>

        {room.description && (
          <div className="text-xs text-gray-700 line-clamp-3 mb-2">
            {room.description}
          </div>
        )}

        {room.start_time && room.end_time && (
          <div className="text-xs text-gray-500 mb-2">
            {formatTime(room.start_time)} - {formatTime(room.end_time)}
          </div>
        )}

        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onRoomDetail(room);
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onRoomEdit(room);
            }}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    );
  };

  // Handle click on empty room cell
  const handleRoomCellClick = (columnId: string, schedule: BackendSchedule) => {
    const existingRoom = currentDayRooms.find((room) => {
      const extractedId = extractRoomId(room);
      return extractedId === columnId && room.schedule_id === schedule.id;
    });

    if (!existingRoom) {
      // Open add room modal with pre-filled data
      setSelectedScheduleForRoom(schedule);
      setSelectedRoomType(columnId);
      setNewRoom({
        name: `Room ${columnId}`,
        identifier: `Parallel Session 1${columnId}`,
        description: "",
        type: "PARALLEL",
        onlineMeetingUrl: conference.online_presentation || "",
        // ✅ Add required start_time and end_time from schedule
        startTime: schedule.start_time || "",
        endTime: schedule.end_time || "",
      });
      setShowAddRoom(true);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "--:--";
    const normalizedTime = time.replace(/\./g, ":");
    return normalizedTime.length <= 5
      ? normalizedTime
      : normalizedTime.substring(0, 5);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDayNumber = (dateStr: string) => {
    const confStart = new Date(conference.start_date);
    const currentDate = new Date(dateStr);
    const diffTime = currentDate.getTime() - confStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };

  const handleAddTimeSlot = async () => {
    if (!newTimeSlot.startTime || !newTimeSlot.endTime) {
      toast.error("Please provide both start and end times");
      return;
    }

    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    setLoading(true);
    try {
      await createSchedule(
        {
          title: `Time Slot ${newTimeSlot.startTime}-${newTimeSlot.endTime}`,
          conference: conference.type,
          date: currentDay,
          startTime: newTimeSlot.startTime,
          endTime: newTimeSlot.endTime,
          scheduleType: "TALK",
          description: "Empty time slot",
        },
        conference.id
      );

      toast.success("Time slot added successfully!");
      setShowAddTimeSlot(false);
      setNewTimeSlot({ startTime: "", endTime: "" });
      onRefresh?.();
      refetchRooms();
    } catch (error: any) {
      toast.error(error.message || "Failed to add time slot");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (
      !selectedScheduleForRoom ||
      !newRoom.name ||
      !newRoom.identifier ||
      !newRoom.startTime ||
      !newRoom.endTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // ✅ Check if there's an existing parallel room to copy track from
      const existingParallelRoom = currentDayRooms.find(
        (room) =>
          room.type === "PARALLEL" &&
          room.schedule_id === selectedScheduleForRoom.id
      );

      let roomData: any = {
        name: newRoom.name,
        identifier: newRoom.identifier,
        description: newRoom.description,
        type: newRoom.type,
        onlineMeetingUrl: newRoom.onlineMeetingUrl,
        scheduleId: selectedScheduleForRoom.id,
        startTime: newRoom.startTime,
        endTime: newRoom.endTime,
      };

      // ✅ If there's existing parallel room, copy its track
      if (existingParallelRoom && existingParallelRoom.track) {
        roomData.track = {
          name: existingParallelRoom.track.name,
          description: existingParallelRoom.track.description,
        };
      } else if (newRoom.type === "PARALLEL") {
        // ✅ Create new minimal track for PARALLEL rooms
        roomData.track = {
          name: `Track ${selectedRoomType}`,
          description: `Parallel track for Room ${selectedRoomType}`,
        };
      }

      await createRoom(roomData);

      toast.success("Room added successfully!");
      setShowAddRoom(false);
      setSelectedScheduleForRoom(null);
      setSelectedRoomType("");
      setNewRoom({
        name: "",
        identifier: "",
        description: "",
        type: "PARALLEL",
        onlineMeetingUrl: "",
        startTime: "",
        endTime: "",
      });
      refetchRooms();
    } catch (error: any) {
      toast.error(error.message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteConfirm.schedule) return;

    setLoading(true);
    try {
      await deleteSchedule(deleteConfirm.schedule.id);
      toast.success("Schedule deleted successfully!");
      setDeleteConfirm({ isOpen: false, schedule: null });
      onRefresh?.();
      refetchRooms();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const getMainRoomContent = (schedule?: BackendSchedule) => {
    if (!schedule) return null;

    if (schedule.notes?.toLowerCase().includes("coffee break")) {
      return (
        <div className="text-center py-2">
          <div className="font-medium text-sm">Coffee Break</div>
        </div>
      );
    }

    if (schedule.notes?.toLowerCase().includes("lunch")) {
      return (
        <div className="text-center py-2">
          <div className="font-medium text-sm">Lunch Break + ISOMA</div>
        </div>
      );
    }

    const mainRoom = currentDayRooms.find(
      (room) => room.type === "MAIN" && room.schedule_id === schedule.id
    );

    return (
      <div className="space-y-2">
        <div className="font-medium text-sm">
          {mainRoom?.description || schedule.notes || "Main Session"}
        </div>
        <Badge variant="outline" className="text-xs bg-gray-100">
          TALK
        </Badge>
      </div>
    );
  };

  const isSpanningSchedule = (schedule: BackendSchedule) => {
    const notes = schedule.notes?.toLowerCase() || "";
    return (
      notes.includes("coffee break") ||
      notes.includes("lunch break") ||
      notes.includes("break")
    );
  };

  if (daysList.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Conference Days Available
            </h3>
            <p className="text-gray-500">
              Please check the conference date settings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conference Days */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Conference Days</h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAddTimeSlot(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {daysList.map((day, index) => {
            const daySchedules = grouped[day] || [];
            const hasSchedules = daySchedules.length > 0;
            const isSelected = currentDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  relative gap-4 w-48 h-20 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                  ${
                    isSelected
                      ? "bg-[#015B97] text-white border-[#015B97] shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                  ${!hasSchedules ? "opacity-60" : ""}
                `}
              >
                <div className="flex items-center justify-center text-center gap-2">
                  <div
                    className={`text-sm font-bold ${
                      isSelected ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Day {getDayNumber(day)}
                  </div>
                  <div
                    className={`text-xs ${
                      isSelected ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    {new Date(day).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  {hasSchedules && (
                    <div
                      className={`
                      text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center
                      ${
                        isSelected
                          ? "bg-white text-black"
                          : "bg-gray-900 text-white"
                      }
                    `}
                    >
                      {daySchedules.length}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {roomsLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Loading rooms for {formatDate(currentDay)}...
          </div>
        </div>
      )}

      {/* Schedule Table */}
      {currentDay && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-[#015B97] text-white px-6 py-4 font-bold text-center">
              <div className="text-lg">
                Day {getDayNumber(currentDay)}: {formatDate(currentDay)}
              </div>
              <div className="text-sm font-normal mt-1">
                Indonesian Time (WITA) (GMT+8)
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-white">
                    <th className="text-left py-3 px-3 font-semibold border-r border-gray-300 bg-gray-50 w-20">
                      Start
                    </th>
                    <th className="text-left py-3 px-3 font-semibold border-r border-gray-300 bg-gray-50 w-20">
                      End
                    </th>
                    <th className="text-left py-3 px-4 font-semibold border-r border-gray-300 bg-gray-50 min-w-[350px]">
                      Main Room
                    </th>

                    {/* Dynamic room columns */}
                    {roomColumnsForDay.map((roomColumn, index) => (
                      <th
                        key={roomColumn.id}
                        className={`text-left py-3 px-4 font-semibold ${
                          index < roomColumnsForDay.length - 1
                            ? "border-r border-gray-300"
                            : ""
                        } bg-gray-50 min-w-[180px]`}
                        title={
                          roomColumn.room
                            ? `${roomColumn.room.name} (${roomColumn.room.identifier})`
                            : roomColumn.label
                        }
                      >
                        {roomColumn.label}
                        {roomColumn.room?.identifier && (
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            {roomColumn.room.identifier}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[currentDay]?.map((schedule, index) => {
                    const spanning = isSpanningSchedule(schedule);

                    return (
                      <tr
                        key={schedule.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 group ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        {/* Time Columns */}
                        <td className="py-4 px-3 border-r border-gray-200 font-mono text-sm">
                          {formatTime(schedule.start_time)}
                        </td>
                        <td className="py-4 px-3 border-r border-gray-200 font-mono text-sm">
                          {formatTime(schedule.end_time)}
                        </td>

                        {/* Main Room */}
                        <td className="py-4 px-4 border-r border-gray-200 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {getMainRoomContent(schedule)}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onScheduleDetail(schedule)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onScheduleEdit(schedule)}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Schedule
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setDeleteConfirm({ isOpen: true, schedule })
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>

                        {/* Room Columns */}
                        {roomColumnsForDay.map((roomColumn, roomIndex) => {
                          // Handle spanning schedules
                          if (spanning && roomIndex === 0) {
                            return (
                              <td
                                key={roomColumn.id}
                                colSpan={roomColumnsForDay.length}
                                className="py-4 px-4 text-center align-middle"
                              >
                                <div className="font-medium text-sm">
                                  {schedule.notes || "Break"}
                                </div>
                              </td>
                            );
                          } else if (spanning && roomIndex > 0) {
                            return null;
                          }

                          const roomContent = getRoomContentForColumn(
                            roomColumn.id,
                            schedule
                          );

                          return (
                            <td
                              key={roomColumn.id}
                              className={`py-4 px-4 ${
                                roomIndex < roomColumnsForDay.length - 1
                                  ? "border-r border-gray-200"
                                  : ""
                              } align-top cursor-pointer hover:bg-blue-50 transition-colors`}
                              onClick={() =>
                                !roomContent &&
                                handleRoomCellClick(roomColumn.id, schedule)
                              }
                            >
                              <div className="min-h-[60px] group">
                                {roomContent || (
                                  <div className="flex flex-col items-center justify-center h-full text-center">
                                    <span className="text-gray-400 text-xs italic mb-2">
                                      No room assigned
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 px-3 text-xs border border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoomCellClick(
                                          roomColumn.id,
                                          schedule
                                        );
                                      }}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Room
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Empty state */}
                  {(!grouped[currentDay] ||
                    grouped[currentDay].length === 0) && (
                    <tr>
                      <td
                        colSpan={3 + roomColumnsForDay.length}
                        className="py-12 text-center text-gray-500"
                      >
                        <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <div className="text-sm">No schedules for this day</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setShowAddTimeSlot(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Schedule
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Zoom Link Info */}
            <div className="bg-gray-100 px-6 py-4 text-sm border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  Link Zoom Main Room & Parallel Session:
                </span>
                <span className="font-mono text-blue-600">
                  {conference.online_presentation}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Time Slot Modal */}
      <Dialog open={showAddTimeSlot} onOpenChange={setShowAddTimeSlot}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-600" />
              Add Time Slot
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Selected Day</Label>
              <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Day {getDayNumber(currentDay)}:</strong>{" "}
                {formatDate(currentDay)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) =>
                    setNewTimeSlot((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) =>
                    setNewTimeSlot((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTimeSlot(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeSlot} disabled={loading}>
              {loading ? "Adding..." : "Add Time Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Modal */}
      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
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
                  setNewRoom((prev) => ({
                    ...prev,
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
                  setNewRoom((prev) => ({
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
                  setNewRoom((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Moderator: Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room-start-time">Start Time *</Label>
                <Input
                  id="room-start-time"
                  type="time"
                  value={newRoom.startTime}
                  onChange={(e) =>
                    setNewRoom((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="room-end-time">End Time *</Label>
                <Input
                  id="room-end-time"
                  type="time"
                  value={newRoom.endTime}
                  onChange={(e) =>
                    setNewRoom((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="room-url">Online Meeting URL</Label>
              <Input
                id="room-url"
                value={newRoom.onlineMeetingUrl}
                onChange={(e) =>
                  setNewRoom((prev) => ({
                    ...prev,
                    onlineMeetingUrl: e.target.value,
                  }))
                }
                placeholder="https://zoom.us/..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRoom(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRoom} disabled={loading}>
              {loading ? "Adding Room..." : "Add Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirm({
            isOpen: open,
            schedule: open ? deleteConfirm.schedule : null,
          })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-3">
              Are you sure you want to delete this schedule? This will also
              remove all associated rooms and sessions.
            </p>

            {deleteConfirm.schedule && (
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm">
                  <div>
                    <strong>Date:</strong>{" "}
                    {formatDate(deleteConfirm.schedule.date.split("T")[0])}
                  </div>
                  <div>
                    <strong>Time:</strong>{" "}
                    {formatTime(deleteConfirm.schedule.start_time)} -{" "}
                    {formatTime(deleteConfirm.schedule.end_time)}
                  </div>
                  <div>
                    <strong>Type:</strong> {deleteConfirm.schedule.type}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirm({ isOpen: false, schedule: null })
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSchedule}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
