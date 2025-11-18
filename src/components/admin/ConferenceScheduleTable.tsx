'use client';

import { useState, useMemo } from 'react';
import { useScheduleActions } from '@/hooks/useSchedule';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  MapPin, 
  Users, 
  MoreHorizontal, 
  Edit2, 
  Eye, 
  Trash2,
  Plus,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import type { BackendConferenceSchedule, BackendSchedule, BackendRoom } from '@/types';

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
  onRefresh
}: Props) {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: '',
    endTime: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    schedule: BackendSchedule | null;
  }>({ isOpen: false, schedule: null });
  const [loading, setLoading] = useState(false);

  const { createSchedule, deleteSchedule } = useScheduleActions();

  // Group schedules by day and generate all days in conference range
  const schedulesByDay = useMemo(() => {
    const grouped: Record<string, BackendSchedule[]> = {};
    
    // Generate all days between conference start and end
    const startDate = new Date(conference.start_date);
    const endDate = new Date(conference.end_date);
    const daysList: string[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      daysList.push(dateStr);
      grouped[dateStr] = [];
    }

    // Add existing schedules to their respective days
    schedules.forEach(schedule => {
      const date = new Date(schedule.date).toISOString().split('T')[0];
      if (grouped[date]) {
        grouped[date].push(schedule);
      }
    });

    // Sort schedules within each day by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.start_time || '00:00';
        const timeB = b.start_time || '00:00';
        return timeA.localeCompare(timeB);
      });
    });

    return { grouped, daysList };
  }, [schedules, conference.start_date, conference.end_date]);

  const { grouped, daysList } = schedulesByDay;
  const currentDay = selectedDay || daysList[0] || '';

  // ✅ FIXED: Room columns are fixed A, B, C, D, E
  const ROOM_COLUMNS = ['A', 'B', 'C', 'D', 'E'];

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
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
    return Math.max(1, diffDays + 1);
  };

  const handleAddTimeSlot = async () => {
    if (!newTimeSlot.startTime || !newTimeSlot.endTime) {
      toast.error('Please provide both start and end times');
      return;
    }

    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    setLoading(true);
    try {
      await createSchedule({
        title: `Time Slot ${newTimeSlot.startTime}-${newTimeSlot.endTime}`,
        conference: conference.type,
        date: currentDay,
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime,
        scheduleType: 'TALK',
        description: 'Empty time slot'
      }, conference.id);
      
      toast.success('Time slot added successfully!');
      setShowAddTimeSlot(false);
      setNewTimeSlot({ startTime: '', endTime: '' });
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add time slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteConfirm.schedule) return;
    
    setLoading(true);
    try {
      await deleteSchedule(deleteConfirm.schedule.id);
      toast.success('Schedule deleted successfully!');
      setDeleteConfirm({ isOpen: false, schedule: null });
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const getRoomColumns = (schedule?: BackendSchedule) => {
    if (!schedule?.rooms) return { mainRoom: null, parallelRooms: [] };
    
    const mainRooms = schedule.rooms.filter(room => room.type === 'MAIN');
    console.log('Main rooms for schedule', schedule.id, mainRooms); // Debug log
    const parallelRooms = schedule.rooms.filter(room => room.type === 'PARALLEL');
    console.log('Parallel rooms for schedule', schedule.id, parallelRooms); // Debug log
    
    return {
      mainRoom: mainRooms[0] || null,
      parallelRooms: parallelRooms
    };
  };

  const getMainRoomContent = (schedule?: BackendSchedule) => {
    if (!schedule) return null;
    
    const { mainRoom } = getRoomColumns(schedule);
    
    // Check for special cases
    if (schedule.notes?.toLowerCase().includes('coffee break')) {
      return (
        <div className="text-center py-2">
          <div className="font-medium text-sm">Coffee Break</div>
        </div>
      );
    }
    
    if (schedule.notes?.toLowerCase().includes('lunch')) {
      return (
        <div className="text-center py-2">
          <div className="font-medium text-sm">Lunch Break + ISOMA</div>
        </div>
      );
    }

    const hasContent = mainRoom?.description || mainRoom?.name || schedule.notes;
    
    if (!hasContent) {
      return (
        <div className="space-y-2">
          <div className="font-medium text-sm">Main Session</div>
          <Badge variant="outline" className="text-xs bg-gray-100">
            TALK
          </Badge>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="font-medium text-sm">
          {mainRoom?.description || mainRoom?.name || schedule.notes || 'Main Session'}
        </div>
        <Badge variant="outline" className="text-xs bg-gray-100">
          TALK
        </Badge>
      </div>
    );
  };

  // ✅ ENHANCED: Precise room matching based on name field
  const getRoomForColumn = (roomLetter: string, schedule?: BackendSchedule): BackendRoom | null => {
    if (!schedule?.rooms) return null;
    
    const { parallelRooms } = getRoomColumns(schedule);
    console.log('Finding room for column', roomLetter, parallelRooms);
    
    // ✅ EXACT MATCH: Find room based on name field "Room A", "Room B", etc.
    const room = parallelRooms.find(room => {
      const roomName = room.name.toLowerCase();
      const targetRoom = `room ${roomLetter.toLowerCase()}`;
      
      // Direct name match
      if (roomName === targetRoom) {
        return true;
      }
      
      // Alternative patterns
      if (roomName.includes(`room ${roomLetter.toLowerCase()}`)) {
        return true;
      }
      
      // Check identifier as backup
      const identifier = room.identifier?.toLowerCase() || '';
      if (identifier.includes(`session ${roomLetter.toLowerCase()}`) || 
          identifier.includes(`${roomLetter.toLowerCase()}`)) {
        return true;
      }
      
      return false;
    });

    return room || null;
  };

  // ✅ ENHANCED: Get room content for specific column letter
  const getRoomContentForColumn = (roomLetter: string, schedule?: BackendSchedule) => {
    console.log('Getting content for room column', schedule);
    const room = getRoomForColumn(roomLetter, schedule);
    // console.log('Room for column', roomLetter, room);
    
    if (!room) return null;

    return (
      <div className="space-y-2">
        <div className="text-xs font-medium">
          {room.identifier || room.name}
        </div>
        <div className="text-xs text-gray-600 mb-2">
          (Online)
        </div>
        {room.description && (
          <div className="text-xs text-gray-700 line-clamp-3">
            {room.description}
          </div>
        )}
      </div>
    );
  };

  // Check if schedule spans across multiple rooms (like "Coffee Break")
  const isSpanningSchedule = (schedule: BackendSchedule) => {
    const notes = schedule.notes?.toLowerCase() || '';
    return notes.includes('coffee break') || 
           notes.includes('lunch break') || 
           notes.includes('break');
  };

  if (daysList.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conference Days Available</h3>
            <p className="text-gray-500">Please check the conference date settings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conference Days - Fixed Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Conference Days</h3>
          <Button 
            onClick={() => setShowAddTimeSlot(true)}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
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
                  relative w-24 h-20 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center
                  ${isSelected 
                    ? 'bg-black text-white border-black shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${!hasSchedules ? 'opacity-60' : ''}
                `}
              >
                <div className="text-center">
                  <div className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    Day {getDayNumber(day)}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                    {new Date(day).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  {hasSchedules && (
                    <div className={`
                      text-xs font-bold mt-1 w-5 h-5 rounded-full flex items-center justify-center
                      ${isSelected 
                        ? 'bg-white text-black' 
                        : 'bg-gray-900 text-white'
                      }
                    `}>
                      {daySchedules.length}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ COMPACT: Schedule Table with Reduced Duration Column */}
      {currentDay && (
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

            {/* ✅ FIXED: Table with Fixed Room Columns and Compact Layout */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-white">
                    <th className="text-left py-3 px-3 font-semibold border-r border-gray-300 bg-gray-50 w-20">Start</th>
                    <th className="text-left py-3 px-3 font-semibold border-r border-gray-300 bg-gray-50 w-20">End</th>
                    <th className="text-left py-3 px-4 font-semibold border-r border-gray-300 bg-gray-50 min-w-[350px]">Main Room</th>
                    
                    {/* ✅ FIXED: Static Room Columns A-E */}
                    {ROOM_COLUMNS.map((roomLetter, index) => (
                      <th 
                        key={roomLetter} 
                        className={`text-left py-3 px-4 font-semibold ${index < ROOM_COLUMNS.length - 1 ? 'border-r border-gray-300' : ''} bg-gray-50 min-w-[180px]`}
                      >
                        Room {roomLetter}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[currentDay]?.map((schedule, index) => {
                    const spanning = isSpanningSchedule(schedule);

                    return (
                      <tr key={schedule.id} className={`border-b border-gray-200 hover:bg-gray-50 group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        {/* ✅ COMPACT: Time Columns (removed Duration) */}
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
                                <DropdownMenuItem onClick={() => onScheduleDetail(schedule)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onScheduleEdit(schedule)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Schedule
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeleteConfirm({ isOpen: true, schedule })}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>

                        {/* ✅ FIXED: Room Columns A-E with Exact Mapping */}
                        {ROOM_COLUMNS.map((roomLetter, roomIndex) => {
                          // Handle spanning schedules (like Coffee Break)
                          if (spanning && roomIndex === 0) {
                            return (
                              <td 
                                key={roomLetter} 
                                colSpan={ROOM_COLUMNS.length}
                                className="py-4 px-4 text-center align-middle"
                              >
                                <div className="font-medium text-sm">
                                  {schedule.notes || 'Break'}
                                </div>
                              </td>
                            );
                          } else if (spanning && roomIndex > 0) {
                            return null; // Skip this cell since it's part of colspan
                          }

                          return (
                            <td 
                              key={roomLetter} 
                              className={`py-4 px-4 ${roomIndex < ROOM_COLUMNS.length - 1 ? 'border-r border-gray-200' : ''} align-top`}
                            >
                              <div className="min-h-[60px]">
                                {getRoomContentForColumn(roomLetter, schedule) || (
                                  <div className="flex items-center justify-center h-full">
                                    <span className="text-gray-400 text-xs italic">-</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Empty state row if no schedules */}
                  {(!grouped[currentDay] || grouped[currentDay].length === 0) && (
                    <tr>
                      <td colSpan={3 + ROOM_COLUMNS.length} className="py-12 text-center text-gray-500">
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
                <span className="font-medium">Link Zoom Main Room & Parallel Session:</span>
                <span className="font-mono text-blue-600">
                  {conference.online_presentation}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals remain the same */}
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
                <strong>Day {getDayNumber(currentDay)}:</strong> {formatDate(currentDay)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) => setNewTimeSlot(prev => ({
                    ...prev,
                    startTime: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) => setNewTimeSlot(prev => ({
                    ...prev,
                    endTime: e.target.value
                  }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTimeSlot(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeSlot} disabled={loading}>
              {loading ? 'Adding...' : 'Add Time Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => 
        setDeleteConfirm({ isOpen: open, schedule: open ? deleteConfirm.schedule : null })
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-3">
              Are you sure you want to delete this schedule? This will also remove all associated rooms and sessions.
            </p>
            
            {deleteConfirm.schedule && (
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm">
                  <div><strong>Date:</strong> {formatDate(deleteConfirm.schedule.date.split('T')[0])}</div>
                  <div><strong>Time:</strong> {formatTime(deleteConfirm.schedule.start_time)} - {formatTime(deleteConfirm.schedule.end_time)}</div>
                  <div><strong>Type:</strong> {deleteConfirm.schedule.type}</div>
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
              onClick={() => setDeleteConfirm({ isOpen: false, schedule: null })}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSchedule}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}