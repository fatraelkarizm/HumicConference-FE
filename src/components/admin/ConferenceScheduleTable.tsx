'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Users, MoreHorizontal, Edit2, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BackendConferenceSchedule, BackendSchedule, BackendRoom } from '@/types';

interface Props {
  conference: BackendConferenceSchedule;
  schedules: BackendSchedule[];
  onScheduleSelect: (schedule: BackendSchedule) => void;
  onScheduleEdit: (schedule: BackendSchedule) => void;
  onScheduleDetail: (schedule: BackendSchedule) => void;
  onRoomEdit: (room: BackendRoom) => void;
  onRoomDetail: (room: BackendRoom) => void;
}

export default function ConferenceScheduleTable({ 
  conference, 
  schedules, 
  onScheduleSelect,
  onScheduleEdit,
  onScheduleDetail,
  onRoomEdit,
  onRoomDetail
}: Props) {
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped: Record<string, BackendSchedule[]> = {};
    
    schedules.forEach(schedule => {
      const date = new Date(schedule.date).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(schedule);
    });

    // Sort schedules within each day by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.start_time || '00:00';
        const timeB = b.start_time || '00:00';
        return timeA.localeCompare(timeB);
      });
    });

    return grouped;
  }, [schedules]);

  const days = Object.keys(schedulesByDay).sort();
  const currentDay = selectedDay || days[0] || '';

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5); // HH:MM format
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDayNumber = (dateStr: string) => {
    const confStart = new Date(conference.start_date);
    const currentDate = new Date(dateStr);
    const diffTime = currentDate.getTime() - confStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getRoomColumns = (daySchedules: BackendSchedule[]) => {
    const allRooms: BackendRoom[] = [];
    daySchedules.forEach(schedule => {
      if (schedule.rooms) {
        allRooms.push(...schedule.rooms);
      }
    });
    
    // Get unique room types
    const mainRooms = allRooms.filter(room => room.type === 'MAIN');
    const parallelRooms = allRooms.filter(room => room.type === 'PARALLEL');
    
    return {
      mainRoom: mainRooms[0] || null,
      parallelRooms: parallelRooms
    };
  };

  if (days.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Available</h3>
            <p className="text-gray-500">Start by adding your first schedule item.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Selection */}
      <div className="flex flex-wrap gap-2">
        {days.map((day, index) => (
          <Button
            key={day}
            variant={currentDay === day ? 'default' : 'outline'}
            onClick={() => setSelectedDay(day)}
            className="text-sm"
          >
            Day {getDayNumber(day)}: {new Date(day).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Button>
        ))}
      </div>

      {currentDay && (
        <Card>
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-yellow-400 text-black px-6 py-4 font-bold text-center">
              Day {getDayNumber(currentDay)}: {formatDate(currentDay)}
              <div className="text-sm font-normal mt-1">
                Indonesian Time (WITA) (GMT+8)
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium border-r">Start</th>
                    <th className="text-left py-3 px-4 font-medium border-r">End</th>
                    <th className="text-left py-3 px-4 font-medium border-r">Duration</th>
                    <th className="text-left py-3 px-4 font-medium border-r min-w-[300px]">Main Room</th>
                    <th className="text-left py-3 px-4 font-medium border-r">Room A</th>
                    <th className="text-left py-3 px-4 font-medium border-r">Room B</th>
                    <th className="text-left py-3 px-4 font-medium border-r">Room C</th>
                    <th className="text-left py-3 px-4 font-medium border-r">Room D</th>
                    <th className="text-left py-3 px-4 font-medium">Room E</th>
                  </tr>
                </thead>
                <tbody>
                  {schedulesByDay[currentDay]?.map((schedule) => {
                    const { mainRoom, parallelRooms } = getRoomColumns([schedule]);
                    const duration = schedule.start_time && schedule.end_time 
                      ? calculateDuration(schedule.start_time, schedule.end_time)
                      : '00:00';

                    return (
                      <tr key={schedule.id} className="border-b hover:bg-gray-50">
                        {/* Time Columns */}
                        <td className="py-3 px-4 border-r font-mono text-sm">
                          {formatTime(schedule.start_time)}
                        </td>
                        <td className="py-3 px-4 border-r font-mono text-sm">
                          {formatTime(schedule.end_time)}
                        </td>
                        <td className="py-3 px-4 border-r font-mono text-sm">
                          {duration}
                        </td>

                        {/* Main Room */}
                        <td className="py-3 px-4 border-r">
                          {mainRoom ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">{mainRoom.name}</div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onRoomDetail(mainRoom)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onRoomEdit(mainRoom)}>
                                      <Edit2 className="mr-2 h-4 w-4" />
                                      Edit Room
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {mainRoom.description && (
                                <p className="text-xs text-gray-600">{mainRoom.description}</p>
                              )}
                              <div className="flex items-center space-x-2">
                                <Badge variant={schedule.type === 'TALK' ? 'default' : 'secondary'} className="text-xs">
                                  {schedule.type}
                                </Badge>
                                {mainRoom.online_meeting_url && (
                                  <Badge variant="outline" className="text-xs">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Online
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm italic">No main session</div>
                          )}
                        </td>

                        {/* Parallel Rooms A-E */}
                        {['A', 'B', 'C', 'D', 'E'].map((roomLabel, index) => {
                          const room = parallelRooms.find(r => 
                            r.identifier === `Room ${roomLabel}` || 
                            r.name.includes(`Room ${roomLabel}`) ||
                            r.name.includes(`Parallel Session ${index + 1}`)
                          );

                          return (
                            <td key={roomLabel} className={`py-3 px-4 ${index < 4 ? 'border-r' : ''}`}>
                              {room ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-xs">{room.name}</div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onRoomDetail(room)}>
                                          <Eye className="mr-2 h-3 w-3" />
                                          View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onRoomEdit(room)}>
                                          <Edit2 className="mr-2 h-3 w-3" />
                                          Edit
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  {room.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">{room.description}</p>
                                  )}
                                  <div className="flex flex-col space-y-1">
                                    <Badge variant="outline" className="text-xs w-fit">
                                      {room.track ? 'Online' : 'TBD'}
                                    </Badge>
                                    {room.track && (
                                      <div className="text-xs text-gray-500">
                                        Track: {room.track.name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-300 text-xs italic">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Zoom Link Info */}
            <div className="bg-blue-50 px-6 py-4 text-sm">
              <div className="font-medium text-blue-900">Link Zoom Main Room & Parallel Session:</div>
              <div className="text-blue-700 font-mono">{conference.online_presentation}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}