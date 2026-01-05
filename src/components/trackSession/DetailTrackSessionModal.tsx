'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  FileText, 
  Users, 
  Clock, 
  Globe, 
  MapPin, 
  Tag,
  Calendar,
  Hash
} from 'lucide-react';
import type { BackendTrackSession } from '@/types/trackSession';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: BackendTrackSession;
}

export default function DetailTrackSessionModal({ isOpen, onClose, session }: Props) {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ONLINE': return '';
      case 'ONSITE': return '';
      default: return '📍';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'ONLINE': return 'bg-blue-100 text-blue-800';
      case 'ONSITE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM format
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const parseAuthors = (authorsString: string) => {
    const authors = authorsString.split(/,?\s+and\s+|,\s*/).filter(author => author.trim());
    return authors.length > 1 ? authors : [authorsString];
  };

  const extractAffiliation = (authorString: string) => {
    const match = authorString.match(/\((.*?)\)/);
    return match ? match[1] : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl min-h-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Track Session Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Paper Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Session ID</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{session.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Paper ID</label>
                  <p className="font-mono text-sm bg-blue-50 p-2 rounded flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    {session.paper_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Presentation Mode</label>
                  <div className="flex items-center mt-1">
                    <Badge className={`${getModeColor(session.mode)} border-0`}>
                      <span className="mr-1">{getModeIcon(session.mode)}</span>
                      {session.mode}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Paper Title</label>
                  <p className="text-lg font-medium mt-1 leading-relaxed">{session.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authors Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2" />
                Authors & Affiliations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parseAuthors(session.authors).map((author, index) => {
                  const affiliation = extractAffiliation(author);
                  const name = author.replace(/\s*\([^)]*\)/, '').trim();
                  
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{name}</p>
                        {affiliation && (
                          <p className="text-sm text-gray-600 mt-1">{affiliation}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {parseAuthors(session.authors).length === 1 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{session.authors}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Time</label>
                  <p className="mt-1 font-mono text-lg">{formatTime(session.start_time)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Time</label>
                  <p className="mt-1 font-mono text-lg">{formatTime(session.end_time)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="mt-1 font-medium text-lg flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {calculateDuration(session.start_time, session.end_time)}
                  </p>
                </div>
              </div>

              {session.mode === 'ONLINE' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Online Session</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    This session will be conducted virtually via online meeting platform
                  </p>
                </div>
              )}

              {session.mode === 'ONSITE' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Onsite Session</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    This session will be conducted physically at the conference venue
                  </p>
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
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Track ID</label>
                  <p className="font-mono text-sm bg-purple-50 p-2 rounded mt-1">{session.track_id}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center text-purple-700">
                    <Tag className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Track-based Session</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    This session is categorized under a specific research track
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {session.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{session.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Created At</label>
                  <p className="mt-1">{new Date(session.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Last Updated</label>
                  <p className="mt-1">{new Date(session.updated_at).toLocaleString()}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="font-medium text-gray-600">Session Configuration</label>
                  <div className="mt-1 space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {session.mode} Presentation
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Track Session
                    </Badge>
                    {session.notes && (
                      <Badge variant="outline" className="text-xs">
                        Has Notes
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