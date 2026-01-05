'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye,
  Building,
  Globe,
  Clock,
  ExternalLink
} from 'lucide-react';
import type { BackendRoom } from '@/types/room';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  room: BackendRoom;
}

export default function UserDetailRoomModal({ isOpen, onClose, room }: Props) {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                Room Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Room Type</label>
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
                    <label className="text-sm font-medium text-gray-600">Room Code</label>
                    <p className="mt-1 font-medium text-blue-600">{room.identifier}</p>
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
                  Session Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Time</label>
                    <p className="mt-1 font-mono text-lg">{formatTime(room.start_time)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Time</label>
                    <p className="mt-1 font-mono text-lg">{formatTime(room.end_time)}</p>
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
                Meeting Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              {room.online_meeting_url ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Meeting Link</label>
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
                          Join Meeting
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <Globe className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Online Meeting Available</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Click the link above to join this session remotely
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Building className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Onsite Session Only</p>
                  <p className="text-xs text-gray-400 mt-1">This session is available onsite only</p>
                </div>
              )}
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