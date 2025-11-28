"use client";

import { useState, useEffect, useMemo } from "react";
import { useConferenceSchedule } from "@/hooks/useConferenceSchedule";
import { useSchedule } from "@/hooks/useSchedule";
import { useRoom, useRoomActions } from "@/hooks/useRoom";
import { useTrack } from "@/hooks/useTrack";
import {
  useTrackSession,
  useTrackSessionActions,
} from "@/hooks/useTrackSession";
import ConferenceScheduleTable from "@/components/admin/ConferenceScheduleTable";
import AddScheduleModal from "@/components/schedule/AddScheduleModal";
import EditScheduleModal from "@/components/schedule/EditScheduleModal";
import DetailScheduleModal from "@/components/schedule/DetailScheduleModal";
import AddRoomModal from "@/components/room/AddRoomModal";
import EditRoomModal from "@/components/room/EditRoomModal";
import DetailRoomModal from "@/components/room/DetailRoomModal";
import AddTrackSessionModal from "@/components/trackSession/AddTrackSessionModal";
import EditTrackSessionModal from "@/components/trackSession/EditTrackSessionModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Plus,
  Settings,
  Filter,
  Search,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import type {
  BackendConferenceSchedule,
  BackendSchedule,
  BackendRoom,
  BackendTrackSession,
} from "@/types";
import DetailTrackSessionModal from "@/components/trackSession/DetailTrackSessionModal";

export default function ICICyTAAdminPage() {
  const [selectedConference, setSelectedConference] =
    useState<BackendConferenceSchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<BackendSchedule | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<BackendRoom | null>(null);
  const [selectedTrackSession, setSelectedTrackSession] =
    useState<BackendTrackSession | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter states
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [trackSessionFilter, setTrackSessionFilter] = useState<string>("all");
  const [trackSessionSearchTerm, setTrackSessionSearchTerm] = useState("");

  // Hooks
  const {
    conferences,
    loading: confLoading,
    error: confError,
  } = useConferenceSchedule();
  const { schedules, loading: scheduleLoading } = useSchedule();
  const { rooms, refetch: refetchRooms } = useRoom(selectedSchedule?.id);
  const { tracks } = useTrack();
  const { trackSessions, refetch: refetchTrackSessions } = useTrackSession();
  const { deleteRoom } = useRoomActions();
  const { deleteTrackSession } = useTrackSessionActions();

  // Find ICICYTA conference
  useEffect(() => {
    if (conferences.length > 0) {
      const icicytaConf = conferences.find((conf) => conf.type === "ICICYTA");
      if (icicytaConf) {
        setSelectedConference(icicytaConf);
      }
    }
  }, [conferences]);

  // ✅ Room filtering logic
  const filteredRooms = useMemo(() => {
    let filtered = rooms;

    if (roomFilter !== "all") {
      if (roomFilter === "main") {
        filtered = filtered.filter((room) => room.type === "MAIN");
      } else if (roomFilter === "parallel") {
        filtered = filtered.filter((room) => room.type === "PARALLEL");
      } else {
        filtered = filtered.filter(
          (room) =>
            room.name.toLowerCase().includes(roomFilter.toLowerCase()) ||
            room.identifier?.toLowerCase().includes(roomFilter.toLowerCase())
        );
      }
    }

    if (roomSearchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
          room.identifier
            ?.toLowerCase()
            .includes(roomSearchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(roomSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [rooms, roomFilter, roomSearchTerm]);

  // ✅ Track session filtering logic
  const filteredTrackSessions = useMemo(() => {
    let filtered = trackSessions;

    if (trackSessionFilter !== "all") {
      if (trackSessionFilter === "online") {
        filtered = filtered.filter((session) => session.mode === "ONLINE");
      } else if (trackSessionFilter === "onsite") {
        filtered = filtered.filter((session) => session.mode === "ONSITE");
      } else {
        const relatedRooms = rooms.filter(
          (room) =>
            room.identifier
              ?.toLowerCase()
              .includes(trackSessionFilter.toLowerCase()) ||
            room.name.toLowerCase().includes(trackSessionFilter.toLowerCase())
        );
        const relatedTrackIds = relatedRooms
          .map((room) => room.track_id)
          .filter(Boolean);
        filtered = filtered.filter((session) =>
          relatedTrackIds.includes(session.track_id)
        );
      }
    }

    if (trackSessionSearchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.title
            .toLowerCase()
            .includes(trackSessionSearchTerm.toLowerCase()) ||
          session.authors
            .toLowerCase()
            .includes(trackSessionSearchTerm.toLowerCase()) ||
          session.paper_id
            .toLowerCase()
            .includes(trackSessionSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [trackSessions, rooms, trackSessionFilter, trackSessionSearchTerm]);

  // Get unique room options for filtering
  const roomFilterOptions = useMemo(() => {
    const options = [
      { value: "all", label: "All Rooms", count: rooms.length },
      {
        value: "main",
        label: "Main Room",
        count: rooms.filter((r) => r.type === "MAIN").length,
      },
      {
        value: "parallel",
        label: "Parallel Sessions",
        count: rooms.filter((r) => r.type === "PARALLEL").length,
      },
    ];

    const roomNames = Array.from(
      new Set(
        rooms.map((room) => {
          const match =
            room.name.match(/Room\s+([A-Z])/i) ||
            room.identifier?.match(/Room\s+([A-Z])/i);
          return match ? `Room ${match[1]}` : room.name;
        })
      )
    ).sort();

    roomNames.forEach((roomName) => {
      const count = rooms.filter(
        (room) =>
          room.name.includes(roomName) || room.identifier?.includes(roomName)
      ).length;
      if (count > 0) {
        options.push({ value: roomName.toLowerCase(), label: roomName, count });
      }
    });

    return options;
  }, [rooms]);

  // Get unique session options for filtering
  const sessionFilterOptions = useMemo(() => {
    const options = [
      { value: "all", label: "All Sessions", count: trackSessions.length },
      {
        value: "online",
        label: "Online Sessions",
        count: trackSessions.filter((s) => s.mode === "ONLINE").length,
      },
      {
        value: "onsite",
        label: "Onsite Sessions",
        count: trackSessions.filter((s) => s.mode === "ONSITE").length,
      },
    ];

    const sessionTypes = Array.from(
      new Set(
        rooms
          .filter((room) => room.identifier && room.type === "PARALLEL")
          .map((room) => {
            const match = room.identifier?.match(/Parallel Session\s+(\w+)/i);
            return match ? match[1] : null;
          })
          .filter(Boolean)
      )
    ).sort();

    sessionTypes.forEach((sessionType: any) => {
      const relatedRooms = rooms.filter((room) =>
        room.identifier?.includes(`Parallel Session ${sessionType}`)
      );
      const relatedTrackIds = relatedRooms
        .map((room) => room.track_id)
        .filter(Boolean);
      const count = trackSessions.filter((session) =>
        relatedTrackIds.includes(session.track_id)
      ).length;

      if (count > 0) {
        options.push({
          value: `session-${sessionType.toLowerCase()}`,
          label: `Parallel Session ${sessionType}`,
          count,
        });
      }
    });

    return options;
  }, [trackSessions, rooms]);

  // ✅ Delete handlers
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    setDeleteLoading(true);
    try {
      await deleteRoom(selectedRoom.id);
      toast.success("Room deleted successfully!");
      setActiveModal(null);
      setSelectedRoom(null);
      refetchRooms();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteTrackSession = async () => {
    if (!selectedTrackSession) return;

    setDeleteLoading(true);
    try {
      await deleteTrackSession(selectedTrackSession.id);
      toast.success("Track session deleted successfully!");
      setActiveModal(null);
      setSelectedTrackSession(null);
      refetchTrackSessions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete track session");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalClose = () => {
    setActiveModal(null);
    setSelectedSchedule(null);
    setSelectedRoom(null);
    setSelectedTrackSession(null);
  };

  const handleScheduleSelect = (schedule: BackendSchedule) => {
    setSelectedSchedule(schedule);
  };

  const handleRoomSelect = (room: BackendRoom) => {
    setSelectedRoom(room);
  };

  if (confLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (confError || !selectedConference) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Conference Not Found
          </h2>
          <p className="text-gray-600">
            ICICYTA conference data is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedConference.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedConference.start_date).toLocaleDateString()} -{" "}
                {new Date(selectedConference.end_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <CalendarDays className="w-4 h-4 mr-1" />
                {selectedConference.type}
              </Badge>
              <Button
                onClick={() => setActiveModal("add-schedule")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto py-8">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Schedule Overview</TabsTrigger>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="tracks">Track Sessions</TabsTrigger>
            <TabsTrigger value="schedule">Schedule Table</TabsTrigger>
          </TabsList>

          {/* Schedule Overview Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Conference Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">General Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Year:</span>{" "}
                        {selectedConference.year}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {selectedConference.type}
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>{" "}
                        {selectedConference.contact_email}
                      </div>
                      <div>
                        <span className="font-medium">Timezone:</span>{" "}
                        {selectedConference.timezone_iana}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Presentation Locations</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Onsite:</span>{" "}
                        {selectedConference.onsite_presentation}
                      </div>
                      <div>
                        <span className="font-medium">Online:</span>{" "}
                        {selectedConference.online_presentation}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ ENHANCED Room Management Tab with Delete */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Room Management</span>
                  <Badge variant="outline">
                    {filteredRooms.length} of {rooms.length} rooms
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Room Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Filter by Room
                        </span>
                      </div>
                      <Select value={roomFilter} onValueChange={setRoomFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomFilterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  {option.count}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Search Rooms
                        </span>
                      </div>
                      <Input
                        placeholder="Search by name, identifier, or description..."
                        value={roomSearchTerm}
                        onChange={(e) => setRoomSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(roomFilter !== "all" || roomSearchTerm) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        Active filters:
                      </span>
                      {roomFilter !== "all" && (
                        <Badge variant="outline" className="text-xs">
                          {
                            roomFilterOptions.find(
                              (opt) => opt.value === roomFilter
                            )?.label
                          }
                          <button
                            onClick={() => setRoomFilter("all")}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                      {roomSearchTerm && (
                        <Badge variant="outline" className="text-xs">
                          Search: "{roomSearchTerm}"
                          <button
                            onClick={() => setRoomSearchTerm("")}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ Filtered Rooms Grid with Delete Option */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{room.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              room.type === "MAIN" ? "default" : "secondary"
                            }
                          >
                            {room.type}
                          </Badge>
                          {/* ✅ Room Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setActiveModal("detail-room");
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setActiveModal("edit-room");
                                }}
                              >
                                Edit Room
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setActiveModal("delete-room");
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Room
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {room.identifier && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {room.identifier}
                        </p>
                      )}

                      {room.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {room.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-1 text-xs text-gray-500">
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

                {filteredRooms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rooms found matching the current filters.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRoomFilter("all");
                        setRoomSearchTerm("");
                      }}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ ENHANCED Track Sessions Tab with Delete */}
          <TabsContent value="tracks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Track Sessions</span>
                  <Badge variant="outline">
                    {filteredTrackSessions.length} of {trackSessions.length}{" "}
                    sessions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Track Session Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Filter by Session
                        </span>
                      </div>
                      <Select
                        value={trackSessionFilter}
                        onValueChange={setTrackSessionFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                        <SelectContent>
                          {sessionFilterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  {option.count}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Search Sessions
                        </span>
                      </div>
                      <Input
                        placeholder="Search by title, authors, or paper ID..."
                        value={trackSessionSearchTerm}
                        onChange={(e) =>
                          setTrackSessionSearchTerm(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(trackSessionFilter !== "all" || trackSessionSearchTerm) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        Active filters:
                      </span>
                      {trackSessionFilter !== "all" && (
                        <Badge variant="outline" className="text-xs">
                          {
                            sessionFilterOptions.find(
                              (opt) => opt.value === trackSessionFilter
                            )?.label
                          }
                          <button
                            onClick={() => setTrackSessionFilter("all")}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                      {trackSessionSearchTerm && (
                        <Badge variant="outline" className="text-xs">
                          Search: "{trackSessionSearchTerm}"
                          <button
                            onClick={() => setTrackSessionSearchTerm("")}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ Filtered Track Sessions - Grouped by Track with Delete Option */}
                <div className="space-y-6">
                  {tracks.map((track) => {
                    const trackFilteredSessions = filteredTrackSessions.filter(
                      (session) => session.track_id === track.id
                    );

                    if (trackFilteredSessions.length === 0) return null;

                    return (
                      <div key={track.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-lg">{track.name}</h3>
                          <Badge variant="outline">
                            {trackFilteredSessions.length} session
                            {trackFilteredSessions.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        <div className="grid gap-4">
                          {trackFilteredSessions.map((session) => {
                            const relatedRoom = rooms.find(
                              (room) => room.track_id === session.track_id
                            );

                            return (
                              <div
                                key={session.id}
                                className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-medium">
                                        {session.title}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        #{session.paper_id}
                                      </Badge>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2">
                                      {session.authors}
                                    </p>

                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {session.start_time} -{" "}
                                        {session.end_time}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          session.mode === "ONLINE"
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-green-50 text-green-700"
                                        }`}
                                      >
                                        {session.mode}
                                      </Badge>
                                      {relatedRoom && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-purple-50 text-purple-700"
                                        >
                                          {relatedRoom.identifier ||
                                            relatedRoom.name}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* ✅ Track Session Actions Dropdown */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedTrackSession(session);
                                          setActiveModal(
                                            "detail-track-session"
                                          );
                                        }}
                                      >
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedTrackSession(session);
                                          setActiveModal("edit-track-session");
                                        }}
                                      >
                                        Edit Session
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedTrackSession(session);
                                          setActiveModal(
                                            "delete-track-session"
                                          );
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Session
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {filteredTrackSessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        No track sessions found matching the current filters.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTrackSessionFilter("all");
                          setTrackSessionSearchTerm("");
                        }}
                        className="mt-2"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Conference Schedule Table
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal("add-track-session")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Session
                  </Button>
                  
                </div>
              </CardHeader>
              <CardContent>
                <ConferenceScheduleTable
                  conference={selectedConference}
                  schedules={schedules}
                  onScheduleSelect={(schedule) => {
                    setSelectedSchedule(schedule);
                    if (schedule.id) {
                      setActiveModal("edit-schedule");
                    } else {
                      setActiveModal("add-schedule");
                    }
                  }}
                  onScheduleEdit={(schedule) => {
                    setSelectedSchedule(schedule);
                    setActiveModal("edit-schedule");
                  }}
                  onScheduleDetail={(schedule) => {
                    setSelectedSchedule(schedule);
                    setActiveModal("detail-schedule");
                  }}
                  onRoomEdit={(room) => {
                    setSelectedRoom(room);
                    setActiveModal("edit-room");
                  }}
                  onRoomDetail={(room) => {
                    setSelectedRoom(room);
                    setActiveModal("detail-room");
                  }}
                  onRefresh={() => {
                    // Refresh all data
                    return
                      // Refresh all data
                      // Refresh all data
                      // Refresh all data
                      window.location.reload(); // Simple refresh, or implement proper refetch
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {activeModal === "add-schedule" && (
        <AddScheduleModal
          isOpen={true}
          onClose={handleModalClose}
          conferenceId={selectedConference.id}
        />
      )}

      {activeModal === "edit-schedule" && selectedSchedule && (
        <EditScheduleModal
          isOpen={true}
          onClose={handleModalClose}
          schedule={selectedSchedule}
        />
      )}

      {activeModal === "detail-schedule" && selectedSchedule && (
        <DetailScheduleModal
          isOpen={true}
          onClose={handleModalClose}
          schedule={selectedSchedule}
        />
      )}

      {activeModal === "add-room" && selectedSchedule && (
        <AddRoomModal
          isOpen={true}
          onClose={handleModalClose}
          scheduleId={selectedSchedule.id}
        />
      )}

      {activeModal === "edit-room" && selectedRoom && (
        <EditRoomModal
          isOpen={true}
          onClose={handleModalClose}
          room={selectedRoom}
        />
      )}

      {activeModal === "detail-room" && selectedRoom && (
        <DetailRoomModal
          isOpen={true}
          onClose={handleModalClose}
          room={selectedRoom}
        />
      )}

      {activeModal === "add-track-session" && (
        <AddTrackSessionModal isOpen={true} onClose={handleModalClose} />
      )}

      {activeModal === "edit-track-session" && selectedTrackSession && (
        <EditTrackSessionModal
          isOpen={true}
          onClose={handleModalClose}
          session={selectedTrackSession}
        />
      )}

      {/* ✅ Detail Track Session Modal */}
      {activeModal === "detail-track-session" && selectedTrackSession && (
        <DetailTrackSessionModal
          isOpen={true}
          onClose={handleModalClose}
          session={selectedTrackSession}
        />
      )}

      {/* ✅ Delete Confirmation Modals */}
      {activeModal === "delete-room" && selectedRoom && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={handleModalClose}
          onConfirm={handleDeleteRoom}
          title="Delete Room"
          description="Are you sure you want to delete this room? This action will permanently remove the room and all its associated data."
          itemName={selectedRoom.name}
          loading={deleteLoading}
        />
      )}

      {activeModal === "delete-track-session" && selectedTrackSession && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={handleModalClose}
          onConfirm={handleDeleteTrackSession}
          title="Delete Track Session"
          description="Are you sure you want to delete this track session? This action will permanently remove the session and all its data."
          itemName={selectedTrackSession.title}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
