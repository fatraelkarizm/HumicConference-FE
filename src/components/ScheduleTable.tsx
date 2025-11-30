import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MoreHorizontal, Edit2, Eye, Trash2, Plus, Clock, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { 
  BackendConferenceSchedule, 
  BackendSchedule, 
  BackendRoom 
} from "@/types";

interface Props {
  conference: BackendConferenceSchedule;
  currentDay: string;
  schedules: BackendSchedule[];
  currentDayRooms: BackendRoom[];
  roomColumnsForDay: Array<{
    id: string;
    label: string;
    room: BackendRoom;
    sortOrder: number;
  }>;
  onRoomEdit: (room: BackendRoom) => void;
  onRoomDetail: (room: BackendRoom) => void;
  onScheduleEdit: (schedule: BackendSchedule) => void;
  onScheduleDetail: (schedule: BackendSchedule) => void;
  onDeleteSchedule: (schedule: BackendSchedule) => void;
  onRoomCellClick: (columnId: string, schedule: BackendSchedule) => void;
  onAddSchedule: () => void;
  formatDate: (dateStr: string) => string;
  getDayNumber: (dateStr: string) => number;
  extractRoomId: (room: BackendRoom) => string | null;
}

export default function ScheduleTable({
  conference,
  currentDay,
  schedules,
  currentDayRooms,
  roomColumnsForDay,
  onRoomEdit,
  onRoomDetail,
  onScheduleEdit,
  onScheduleDetail,
  onDeleteSchedule,
  onRoomCellClick,
  onAddSchedule,
  formatDate,
  getDayNumber,
  extractRoomId,
}: Props) {
  
  const formatTime = (time?: string) => {
    if (! time) return "--:--";
    const normalizedTime = time.replace(/\./g, ":");
    return normalizedTime.length <= 5 ? normalizedTime : normalizedTime.substring(0, 5);
  };

  const getRoomContentForColumn = (columnId: string, schedule?: BackendSchedule) => {
    const room = currentDayRooms.find((r) => {
      const extractedId = extractRoomId(r);
      const matchesColumn = extractedId === columnId;
      const matchesSchedule = r.schedule_id === schedule?.id;
      return matchesColumn && matchesSchedule;
    });

    if (!room) return null;

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
            {room.start_time} - {room.end_time}
          </div>
        )}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e. stopPropagation();
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

  const getMainRoomContent = (schedule?: BackendSchedule) => {
    if (!schedule) return null;

    if (schedule.notes?. toLowerCase().includes("coffee break")) {
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

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-yellow-400 text-black px-6 py-4 font-bold text-center">
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

                {roomColumnsForDay. map((roomColumn, index) => (
                  <th
                    key={roomColumn.id}
                    className={`text-left py-3 px-4 font-semibold ${
                      index < roomColumnsForDay.length - 1
                        ? "border-r border-gray-300"
                        : ""
                    } bg-gray-50 min-w-[180px]`}
                    title={
                      roomColumn.room
                        ? `${roomColumn. room.name} (${roomColumn.room. identifier})`
                        : roomColumn.label
                    }
                  >
                    {roomColumn.label}
                    {roomColumn.room?. identifier && (
                      <div className="text-xs font-normal text-gray-500 mt-1">
                        {roomColumn.room.identifier}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, index) => {
                const isBreak = schedule.type === 'BREAK';
                const mainRoom = currentDayRooms.find(
                  (r) => r.type === "MAIN" && r.schedule_id === schedule.id
                ) || null;

                if (isBreak) {
                  // Render break as spanning from main room to room E
                  return (
                    <tr
                      key={schedule.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      {/* Time Columns */}
                      <td 
                        className="py-4 px-3 border-r border-gray-200 font-mono text-sm"
                      >
                        {formatTime(schedule.start_time)}
                      </td>
                      <td className="py-4 px-3 border-r border-gray-200 font-mono text-sm">
                        {formatTime(schedule.end_time)}
                      </td>

                      {/* Main Room and spanning to room E */}
                      <td colSpan={1 + roomColumnsForDay.length} className="py-4 px-4 text-center bg-yellow-50 border-r border-gray-200">
                        <div className="font-medium text-sm">
                          {schedule.notes || "Break"}
                        </div>
                        <Badge variant="outline" className="text-xs bg-yellow-100 mt-1">
                          BREAK
                        </Badge>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={schedule.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 group ${
                      index % 2 === 0 ?  "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Time Columns */}
                    <td 
                      className="py-4 px-3 border-r border-gray-200 font-mono text-sm cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => onAddSchedule()}
                    >
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
                            {mainRoom ?  (
                              <>
                                <DropdownMenuItem onClick={() => onRoomDetail(mainRoom)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Main Room
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRoomEdit(mainRoom)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Main Room
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onDeleteSchedule(schedule)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Schedule
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => onScheduleDetail(schedule)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onScheduleEdit(schedule)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Schedule
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onDeleteSchedule(schedule)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Schedule
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>

                    {/* Room Columns */}
                    {roomColumnsForDay.map((roomColumn, roomIndex) => {
                      const roomContent = getRoomContentForColumn(roomColumn.id, schedule);

                      return (
                        <td
                          key={roomColumn.id}
                          className={`py-4 px-4 ${
                            roomIndex < roomColumnsForDay.length - 1
                              ? "border-r border-gray-200"
                              : ""
                          } align-top cursor-pointer hover:bg-blue-50 transition-colors`}
                          onClick={() => onRoomCellClick(roomColumn.id, schedule)}
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
                                    onRoomCellClick(roomColumn.id, schedule);
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

              {/* ✅ Enhanced Empty State with Better UX */}
              {schedules.length === 0 && (
                <tr>
                  <td
                    colSpan={3 + roomColumnsForDay.length}
                    className="py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Calendar className="w-16 h-16 text-gray-400 opacity-50" />
                      <div className="space-y-2">
                        <div className="text-lg font-medium text-gray-700">No schedules for this day</div>
                        <div className="text-sm text-gray-500 max-w-md mx-auto">
                          Create your first schedule to start organizing the conference.  
                          Once you add a time slot with a main room, you can then add parallel sessions.
                        </div>
                      </div>
                      
                      {/* ✅ Step-by-step guide */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                        <div className="text-sm font-medium text-blue-800 mb-2">Getting Started:</div>
                        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                          <li>Add a time slot to create the main room for that time</li>
                          <li>Then click on Room A, B, C cells to add parallel sessions</li>
                        </ol>
                      </div>
                    </div>
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
  );
}