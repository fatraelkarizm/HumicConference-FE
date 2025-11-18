'use client';

import { useState } from 'react';
import { useScheduleActions } from '@/hooks/useSchedule';
import { useRoomActions } from '@/hooks/useRoom';
import { useTrackOptions } from '@/hooks/useTrack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, User, FileText, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { NewScheduleData } from '@/types/schedule';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conferenceId: string;
}

export default function AddScheduleModal({ isOpen, onClose, conferenceId }: Props) {
  const [formData, setFormData] = useState<NewScheduleData>({
    title: '',
    conference: 'ICICYTA',
    date: '',
    startTime: '',
    endTime: '',
    speaker: '',
    description: '',
    location: '',
    scheduleType: 'TALK'
  });
  const [createRoom, setCreateRoom] = useState(true);
  const [loading, setLoading] = useState(false);

  const { createSchedule } = useScheduleActions();
  const { createRoom: createRoomAction } = useRoomActions();
  const { trackOptions } = useTrackOptions();

  const scheduleTypes = [
    { value: 'TALK', label: 'Talk/Speech', icon: '🎤' },
    { value: 'BREAK', label: 'Break', icon: '☕' },
    { value: 'ONE_DAY_ACTIVITY', label: 'Activity/Workshop', icon: '🏃' },
    { value: 'PANEL', label: 'Panel Discussion', icon: '👥' },
    { value: 'REPORTING', label: 'Reporting', icon: '📊' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }

      if (!formData.date) {
        toast.error('Date is required');
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

      // Create schedule
      const result = await createSchedule(formData, conferenceId);
      
      // Create room if needed and schedule creation was successful
      if (createRoom && result !== 'success' && typeof result === 'object' && result.id) {
        try {
          await createRoomAction({
            name: formData.title,
            description: formData.speaker ? `Moderator: ${formData.speaker}` : formData.description,
            type: formData.scheduleType === 'PANEL' ? 'PARALLEL' : 'MAIN',
            onlineMeetingUrl: formData.location?.startsWith('http') ? formData.location : undefined,
            scheduleId: result.id
          });
        } catch (roomError) {
          console.warn('Room creation failed (non-critical):', roomError);
        }
      }

      toast.success('Schedule created successfully!');
      onClose();
      
    } catch (error: any) {
      console.error('Failed to create schedule:', error);
      toast.error(error.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewScheduleData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Schedule Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              <span>Basic Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Opening Speech by Rector"
                  required
                />
              </div>

              <div>
                <Label htmlFor="scheduleType">Type *</Label>
                <Select value={formData.scheduleType} onValueChange={(value) => handleInputChange('scheduleType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center">
                          <span className="mr-2">{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="conference">Conference</Label>
                <Select value={formData.conference} onValueChange={(value) => handleInputChange('conference', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICICYTA">ICICyTA</SelectItem>
                    <SelectItem value="ICODSA">ICODSA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional description or notes"
                rows={3}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <CalendarDays className="w-4 h-4" />
              <span>Date & Time</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

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
                <Clock className="w-4 h-4 inline mr-1" />
                Duration: {calculateDuration(formData.startTime, formData.endTime)}
              </div>
            )}
          </div>

          {/* Speaker and Location */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              <span>Speaker & Location</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="speaker">Speaker/Moderator</Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) => handleInputChange('speaker', e.target.value)}
                  placeholder="e.g., Prof. Dr. John Doe"
                />
              </div>

              <div>
                <Label htmlFor="location">Location/Online Link</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Room name or Zoom link"
                />
              </div>
            </div>
          </div>

          {/* Room Creation Option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>Room Management</span>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="createRoom"
                checked={createRoom}
                onChange={(e) => setCreateRoom(e.target.checked)}
                className="rounded border-gray-300"
              />
              <div>
                <Label htmlFor="createRoom" className="font-medium cursor-pointer">
                  Create room automatically
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  This will create a room entry for this schedule with the speaker as moderator
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Schedule'}
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
  return `${hours}h ${minutes}m`;
}