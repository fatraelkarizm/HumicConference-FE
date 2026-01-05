'use client';

import { useState } from 'react';
import { useTrackSessionActions } from '@/hooks/useTrackSession';
import { useTrackOptions } from '@/hooks/useTrack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Users, Clock, Globe, MapPin, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { NewTrackSessionData } from '@/types/trackSession';
import type { BackendConferenceSchedule, BackendTrack } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conference?: BackendConferenceSchedule;
  tracks?: BackendTrack[];
}

export default function AddTrackSessionModal({ isOpen, onClose, conference, tracks }: Props) {
  const [formData, setFormData] = useState<NewTrackSessionData>({
    paperId: '',
    title: '',
    authors: '',
    mode: 'ONLINE',
    notes: '',
    startTime: '',
    endTime: '',
    trackId: ''
  });
  const [trackName, setTrackName] = useState('');
  const [isCreatingNewTrack, setIsCreatingNewTrack] = useState(false);
  const [loading, setLoading] = useState(false);

  const { createTrackSession } = useTrackSessionActions();
  const { trackOptions: allTrackOptions } = useTrackOptions();

  const trackOptions = tracks ? tracks.map(track => ({
    value: track.id,
    label: track.name,
    description: track.description
  })) : allTrackOptions;

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
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.paperId.trim()) {
        toast.error('Paper ID is required');
        return;
      }

      if (!formData.title.trim()) {
        toast.error('Paper title is required');
        return;
      }

      if (!formData.authors.trim()) {
        toast.error('Authors information is required');
        return;
      }

      if (!formData.startTime || !formData.endTime) {
        toast.error('Start time and end time are required');
        return;
      }

      if (formData.startTime >= formData.endTime) {
        toast.error('Start time must be before end time');
        return;
      }

      if (!formData.trackId) {
        toast.error('Please select a track');
        return;
      }

      const sessionData: NewTrackSessionData = {
        ...formData,
        paperId: formData.paperId.trim(),
        title: formData.title.trim(),
        authors: formData.authors.trim(),
        notes: formData.notes?.trim() || undefined
      };

      await createTrackSession(sessionData);
      toast.success('Track session created successfully!');
      onClose();

    } catch (error: any) {
      toast.error(error.message || 'Failed to create track session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewTrackSessionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedMode = presentationModes.find(mode => mode.value === formData.mode);
  const selectedTrack = trackOptions.find(track => track.value === formData.trackId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Track Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="md:col-span-2">
            <Label htmlFor="paperId">Paper ID *</Label>
            <Input
              id="paperId"
              value={formData.paperId}
              onChange={(e) => handleInputChange('paperId', e.target.value)}
              placeholder="e.g., 1571094988"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="title">Paper Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Lung Cancer Classification Based on Ensembling EfficientNet Using Histopathology Images"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="authors">Authors *</Label>
            <Textarea
              id="authors"
              value={formData.authors}
              onChange={(e) => handleInputChange('authors', e.target.value)}
              placeholder="e.g., Akif Rachmat Hidayah and Untari N. Wisesty (Telkom University, Indonesia)"
              rows={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Include author names and affiliations
            </p>
          </div>

          <div className={`p-4 rounded-lg bg-blue-50 text-blue-800`}>
            <div className="flex items-center space-x-2">
              <div>
                <div className="font-medium">Online Presentation</div>
                <div className="text-sm">Virtual presentation via video conference</div>
              </div>
            </div>
          </div>

          {/* Track Assignment */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="trackId">Track *</Label>
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
              {trackOptions.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ No tracks available. Please create tracks in the admin panel first.
                </p>
              )}
            </div>

            {selectedTrack && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center text-purple-700">
                  <span className="text-sm font-medium">Track: {selectedTrack.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Time Configuration */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (
              <div className="text-sm text-gray-600">
                Duration: {calculateDuration(formData.startTime, formData.endTime)}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Special instructions, technical requirements, or other notes"
                rows={3}
              />
            </div>
          </div>

          {/* Session Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Session Preview:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Paper ID:</span>
                <span className="font-medium">{formData.paperId || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <Badge variant="outline" className="text-xs">
                  {selectedMode?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Track:</span>
                <span className="font-medium">{selectedTrack?.label || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {formData.startTime && formData.endTime && formData.startTime < formData.endTime
                    ? calculateDuration(formData.startTime, formData.endTime)
                    : 'Not calculated'
                  }
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Session'}
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