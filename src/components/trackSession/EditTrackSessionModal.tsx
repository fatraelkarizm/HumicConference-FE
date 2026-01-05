'use client';

import { useState, useEffect } from 'react';
import { useTrackSessionActions } from '@/hooks/useTrackSession';
import { useTrackOptions } from '@/hooks/useTrack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit2, FileText, Users, Clock, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { BackendTrackSession, UpdateTrackSessionData } from '@/types/trackSession';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session?: BackendTrackSession; // Made optional since it's used in the admin page without specific session
}

export default function EditTrackSessionModal({ isOpen, onClose, session }: Props) {
  const [formData, setFormData] = useState<UpdateTrackSessionData>({
    paperId: '',
    title: '',
    authors: '',
    mode: 'ONLINE',
    notes: '',
    startTime: '',
    endTime: '',
    trackId: ''
  });
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { updateTrackSession } = useTrackSessionActions();
  const { trackOptions } = useTrackOptions();

  // Initialize form data from session
  useEffect(() => {
    if (session) {
      setSessionId(session.id);
      setFormData({
        paperId: session.paper_id,
        title: session.title,
        authors: session.authors,
        mode: session.mode,
        notes: session.notes || '',
        startTime: session.start_time,
        endTime: session.end_time,
        trackId: session.track_id
      });
    }
  }, [session]);

  const presentationModes = [
    {
      value: 'ONLINE',
      label: 'Online Presentation',
      description: 'Virtual presentation via video conference',
      icon: '💻',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'ONSITE',
      label: 'Onsite Presentation',
      description: 'Physical presentation at conference venue',
      icon: '',
      color: 'bg-green-100 text-green-800'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('No session selected for editing');
      return;
    }

    setLoading(true);

    try {
      // Validate required fields if they're being changed
      if (formData.paperId && !formData.paperId.trim()) {
        toast.error('Paper ID cannot be empty');
        return;
      }

      if (formData.title && !formData.title.trim()) {
        toast.error('Paper title cannot be empty');
        return;
      }

      if (formData.authors && !formData.authors.trim()) {
        toast.error('Authors information cannot be empty');
        return;
      }

      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        toast.error('Start time must be before end time');
        return;
      }

      const updateData: UpdateTrackSessionData = {
        ...formData,
        paperId: formData.paperId?.trim(),
        title: formData.title?.trim(),
        authors: formData.authors?.trim(),
        notes: formData.notes?.trim() || undefined
      };

      await updateTrackSession(sessionId, updateData);
      toast.success('Track session updated successfully!');
      onClose();

    } catch (error: any) {
      toast.error(error.message || 'Failed to update track session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateTrackSessionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedMode = presentationModes.find(mode => mode.value === formData.mode);
  const selectedTrack = trackOptions.find(track => track.value === formData.trackId);

  if (!session) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Track Session</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">No session selected for editing.</p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit2 className="w-5 h-5 mr-2 text-blue-600" />
            Edit Track Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paper Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              <span>Paper Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paperId">Paper ID</Label>
                <Input
                  id="paperId"
                  value={formData.paperId}
                  onChange={(e) => handleInputChange('paperId', e.target.value)}
                  placeholder="Paper ID"
                />
              </div>

              <div>
                <Label htmlFor="mode">Presentation Mode</Label>
                <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value as 'ONLINE' | 'ONSITE')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select presentation mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {presentationModes.map(mode => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center">
                          <span className="mr-2">{mode.icon}</span>
                          <div>
                            <div className="font-medium">{mode.label}</div>
                            <div className="text-xs text-gray-500">{mode.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="title">Paper Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Paper title"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="authors">Authors</Label>
                <Textarea
                  id="authors"
                  value={formData.authors}
                  onChange={(e) => handleInputChange('authors', e.target.value)}
                  placeholder="Author names and affiliations"
                  rows={3}
                />
              </div>
            </div>

            {selectedMode && (
              <div className={`p-4 rounded-lg ${selectedMode.color}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedMode.icon}</span>
                  <div>
                    <div className="font-medium">{selectedMode.label}</div>
                    <div className="text-sm">{selectedMode.description}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Track Assignment */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Tag className="w-4 h-4" />
              <span>Track Assignment</span>
            </div>

            <div>
              <Label htmlFor="trackId">Track</Label>
              <Select value={formData.trackId} onValueChange={(value) => handleInputChange('trackId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a track for this session" />
                </SelectTrigger>
                <SelectContent>
                  {trackOptions.map(track => (
                    <SelectItem key={track.value} value={track.value}>
                      <div>
                        <div className="font-medium">{track.label}</div>
                        {track.description && (
                          <div className="text-xs text-gray-500">{track.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrack && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center text-purple-700">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Track: {selectedTrack.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Time Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4" />
              <span>Time Configuration</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>

            {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (
              <div className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration: {calculateDuration(formData.startTime, formData.endTime)}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              <span>Additional Information</span>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Special instructions, technical requirements, or other notes"
                rows={3}
              />
            </div>
          </div>

          {/* Current Data Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Current Session Information:</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">ID:</span> {session.id}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(session.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Modified:</span> {new Date(session.updated_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Track ID:</span> {session.track_id}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}