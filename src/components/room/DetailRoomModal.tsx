'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  Building, 
  Globe, 
  Tag, 
  MapPin, 
  Clock, 
  Users,
  ExternalLink,
  FileText,
  Calendar
} from 'lucide-react';
import type { BackendRoom } from '@/types/room';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  room: BackendRoom;
}

export default function DetailRoomModal({ isOpen, onClose, room }: Props) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MAIN': return '';
      case 'PARALLEL': return '';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MAIN': return 'bg-blue-100 text-blue-800';
      case 'PARALLEL': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return 'Not set';
    return time.substring(0, 5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Room Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Room ID</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{room.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <div className="flex items-center mt-1">
                    <Badge className={`${getTypeColor(room.type)} border-0`}>
                      <span className="mr-1">{getTypeIcon(room.type)}</span>
                      {room.type}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Room Name</label>
                  <p className="text-lg font-medium mt-1">{room.name}</p>
                </div>
                {room.identifier && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Identifier</label>
                    <p className="mt-1 font-medium">{room.identifier}</p>
                  </div>
                )}
                {room.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">{room.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Configuration */}
          {(room.start_time || room.end_time) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  Time Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Time</label>
                    <p className="mt-1 font-mono">{formatTime(room.start_time)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Time</label>
                    <p className="mt-1 font-mono">{formatTime(room.end_time)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Online Meeting Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Globe className="w-5 h-5 mr-2" />
                Online Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              {room.online_meeting_url ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Meeting URL</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <a 
                        href={room.online_meeting_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {room.online_meeting_url}
                      </a>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={room.online_meeting_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <Globe className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Online Meeting Configured</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Participants can join this room remotely via the provided link
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No online meeting configured</p>
                  <p className="text-xs text-gray-400 mt-1">This is an onsite-only room</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Track Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Tag className="w-5 h-5 mr-2" />
                Track Association
              </CardTitle>
            </CardHeader>
            <CardContent>
              {room.track ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{room.track.name}</h4>
                    <Badge variant="outline">Track Assigned</Badge>
                  </div>
                  {room.track.description && (
                    <p className="text-gray-600 text-sm">{room.track.description}</p>
                  )}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Track-based Room</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      This room hosts sessions for the {room.track.name} track
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Track ID:</span> {room.track.id}
                    </div>
                    <div>
                      <span className="font-medium">Track Created:</span> {new Date(room.track.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Tag className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No track assigned</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {room.type === 'MAIN' 
                      ? 'Main rooms typically don\'t need track assignment' 
                      : 'This parallel room is not associated with any specific track'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Association
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Schedule ID</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">{room.schedule_id}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Schedule Connection</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    This room belongs to a specific schedule time slot
                  </p>
                </div>
              </div>
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
                  <p className="mt-1">{new Date(room.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Last Updated</label>
                  <p className="mt-1">{new Date(room.updated_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Room Configuration</label>
                  <div className="mt-1 space-y-1">
                    <Badge variant="outline" className="text-xs mr-2">
                      {room.type} Room
                    </Badge>
                    {room.online_meeting_url && (
                      <Badge variant="outline" className="text-xs mr-2">
                        Online Ready
                      </Badge>
                    )}
                    {room.track && (
                      <Badge variant="outline" className="text-xs mr-2">
                        Track Assigned
                      </Badge>
                    )}
                  </div>
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