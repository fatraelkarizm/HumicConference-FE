'use client';

import { useState, useEffect } from 'react';
import { useScheduleActions } from '@/hooks/useSchedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit2, CalendarDays, Clock, User, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { BackendSchedule, UpdateScheduleData } from '@/types/schedule';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: BackendSchedule;
}

export default function EditScheduleModal({ isOpen, onClose, schedule }: Props) {
  const [formData, setFormData] = useState<UpdateScheduleData>({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    scheduleType: 'TALK'
  });
  const [loading, setLoading] = useState(false);

  const { updateSchedule } = useScheduleActions();

  // Initialize form data from schedule
  useEffect(() => {
    if (schedule) {
      const mainRoom = schedule.rooms?.find(room => room.type === 'MAIN');
      
      setFormData({
        title: mainRoom?.name || 'Schedule Item',
        date: schedule.date.split('T')[0],
        startTime: schedule.start_time || '',
        endTime: schedule.end_time || '',
        description: schedule.notes || '',
        scheduleType: mapBackendTypeToFrontend(schedule.type)
      });
    }
  }, [schedule]);

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
      if (formData.title && !formData.title.trim()) {
        toast.error('Title cannot be empty');
        return;
      }

      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        toast.error('Start time must be before end time');
        return;
      }

      await updateSchedule(schedule.id, formData);
      toast.success('Schedule updated successfully!');
      onClose();
      
    } catch (error: any) {
      console.error('Failed to update schedule:', error);
      toast.error(error.message || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateScheduleData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit2 className="w-5 h-5 mr-2 text-blue-600" />
            Edit Schedule Item
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Schedule title"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="scheduleType">Type</Label>
                <Select 
                  value={formData.scheduleType} 
                  onValueChange={(value) => handleInputChange('scheduleType', value)}
                >
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

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

          {/* Current Data Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Current Schedule Information:</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">ID:</span> {schedule.id}
              </div>
              <div>
                <span className="font-medium">Type:</span> {schedule.type}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(schedule.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Modified:</span> {new Date(schedule.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function mapBackendTypeToFrontend(backendType: string): string {
  switch (backendType) {
    case 'TALK': return 'TALK';
    case 'BREAK': return 'BREAK';
    case 'ONE_DAY_ACTIVITY': return 'ONE_DAY_ACTIVITY';
    default: return 'TALK';
  }
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}