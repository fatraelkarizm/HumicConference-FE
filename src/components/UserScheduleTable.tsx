import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar } from "lucide-react";
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
    room: BackendRoom | null;
    sortOrder: number;
  }>;
  formatDate: (dateStr: string) => string;
  getDayNumber: (dateStr: string) => number;
  extractRoomId: (room: BackendRoom) => string | null;
}

export default function UserScheduleTable({
  conference,
  currentDay,
  schedules,
  currentDayRooms,
  roomColumnsForDay,
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
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      index % 2 === 0 ?  "bg-white" : "bg-gray-50/50"
                    }`}
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

                    {/* Main Room */}
                    <td className="py-4 px-4 border-r border-gray-200">
                      {getMainRoomContent(schedule)}
                    </td>

                    {/* Room Columns - View Only */}
                    {roomColumnsForDay.map((roomColumn, roomIndex) => {
                      const roomContent = getRoomContentForColumn(roomColumn.id, schedule);

                      return (
                        <td
                          key={roomColumn.id}
                          className={`py-4 px-4 ${
                            roomIndex < roomColumnsForDay.length - 1
                              ? "border-r border-gray-200"
                              : ""
                          } align-top`}
                        >
                          <div className="min-h-[60px]">
                            {roomContent || (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <span className="text-gray-400 text-xs italic">
                                  No room assigned
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Empty State */}
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
                          No conference schedules have been created for this day yet.
                        </div>
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