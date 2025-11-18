'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Globe,
  Building,
  Tag
} from 'lucide-react';
import type { BackendSchedule } from '@/types/schedule';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: BackendSchedule;
}

export default function DetailScheduleModal({ isOpen, onClose, schedule }: Props) {
  const mainRoom = schedule.rooms?.find(room => room.type === 'MAIN');
  const parallelRooms = schedule.rooms?.filter(room => room.type === 'PARALLEL') || [];

  const formatTime = (time?: string) => {
    if (!time) return 'Not set';
    return time.substring(0, 5);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'Not calculated';
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TALK': return '🎤';
      case 'BREAK': return '☕';
      case 'ONE_DAY_ACTIVITY': return '🏃';
      default: return '📅';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TALK': return 'bg-blue-100 text-blue-800';
      case 'BREAK': return 'bg-green-100 text-green-800';
      case 'ONE_DAY_ACTIVITY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Schedule Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Schedule ID</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{schedule.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <div className="flex items-center mt-1">
                    <Badge className={`${getTypeColor(schedule.type)} border-0`}>
                      <span className="mr-1">{getTypeIcon(schedule.type)}</span>
                      {schedule.type}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Main Title</label>
                  <p className="text-lg font-medium mt-1">{mainRoom?.name || 'Untitled Schedule'}</p>
                </div>
                {schedule.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Notes</label>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">{schedule.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date and Time Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarDays className="w-5 h-5 mr-2" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="mt-1 font-medium">{formatDate(schedule.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Time</label>
                  <p className="mt-1 font-mono">
                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {calculateDuration(schedule.start_time, schedule.end_time)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="w-5 h-5 mr-2" />
                Room Information
                <Badge variant="outline" className="ml-2">{schedule.rooms?.length || 0} rooms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Room */}
              {mainRoom && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">Main Room</h4>
                    <Badge variant="default">MAIN</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {mainRoom.name}
                    </div>
                    {mainRoom.identifier && (
                      <div>
                        <span className="font-medium">Identifier:</span> {mainRoom.identifier}
                      </div>
                    )}
                    {mainRoom.description && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Description:</span> {mainRoom.description}
                      </div>
                    )}
                    {mainRoom.online_meeting_url && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Online Meeting:</span>
                        <a 
                          href={mainRoom.online_meeting_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline break-all"
                        >
                          {mainRoom.online_meeting_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parallel Rooms */}
              {parallelRooms.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Parallel Sessions ({parallelRooms.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parallelRooms.map((room, index) => (
                      <div key={room.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{room.name}</h5>
                          <Badge variant="secondary" className="text-xs">PARALLEL</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {room.identifier && (
                            <div><span className="font-medium">ID:</span> {room.identifier}</div>
                          )}
                          {room.description && (
                            <div><span className="font-medium">Description:</span> {room.description}</div>
                          )}
                          {room.track && (
                            <div className="flex items-center">
                              <Tag className="w-3 h-3 mr-1" />
                              <span>Track: {room.track.name}</span>
                            </div>
                          )}
                          {room.online_meeting_url && (
                            <div className="flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              <span className="text-blue-600">Online Session</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!mainRoom && parallelRooms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No rooms assigned to this schedule</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-5 h-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Created At</label>
                  <p className="mt-1">{new Date(schedule.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Last Updated</label>
                  <p className="mt-1">{new Date(schedule.updated_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Conference Schedule ID</label>
                  <p className="mt-1 font-mono text-xs bg-gray-100 p-1 rounded">{schedule.conference_schedule_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}