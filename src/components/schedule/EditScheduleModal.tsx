'use client';

import { useState, useEffect } from 'react';
import { useScheduleActions } from '@/hooks/useSchedule';
import { useRoomActions } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit2, CalendarDays, Clock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { BackendSchedule, UpdateScheduleData } from '@/types/schedule';
import type { BackendRoom } from '@/types/room';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: BackendSchedule;
  onUpdated?: () => void; // optional callback so parent can refetch
}

export default function EditScheduleModal({ isOpen, onClose, schedule, onUpdated }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    scheduleType: 'TALK',
    mainRoomId: '' as string | null,
    roomName: '',
    roomDescription: '',
    roomOnlineUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const { updateSchedule } = useScheduleActions();
  const { updateRoom, createRoom } = useRoomActions();

  // Initialize form data from schedule and main room
  useEffect(() => {
    if (!schedule) return;

    const mainRoom = (schedule.rooms || []).find((r: BackendRoom) => r.type === 'MAIN') || null;

    setFormData({
      title: mainRoom?.name || 'Schedule Item',
      date: schedule.date?.split('T')[0] || '',
      startTime: schedule.start_time || '',
      endTime: schedule.end_time || '',
      scheduleType: mapBackendTypeToFrontend(schedule.type),
      mainRoomId: mainRoom?.id || null,
      roomName: mainRoom?.name || '',
      roomDescription: mainRoom?.description || schedule.notes || '',
      roomOnlineUrl: mainRoom?.online_meeting_url || ''
    });
  }, [schedule]);

  const scheduleTypes = [
    { value: 'TALK', label: 'Talk/Speech', icon: '🎤' },
    { value: 'BREAK', label: 'Break', icon: '☕' },
    { value: 'ONE_DAY_ACTIVITY', label: 'Activity/Workshop', icon: '🏃' },
    { value: 'PANEL', label: 'Panel Discussion', icon: '👥' },
    { value: 'REPORTING', label: 'Reporting', icon: '📊' }
  ];

  const handleInputChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // normalize to HH:mm
  const normalizeTime = (time?: string) => {
    if (!time) return undefined;
    const t = time.replace(/\./g, ':');
    return t.length > 5 ? t.substring(0, 5) : t;
  };

  // Try create room, retry with lightweight track object if backend requires track
  const createRoomWithFallback = async (payload: any) => {
    try {
      return await createRoom(payload);
    } catch (err: any) {
      const errText = (err?.data && JSON.stringify(err.data)) || err?.message || String(err);
      if (errText.toLowerCase().includes('track')) {
        // try minimal track object
        const payloadWithTrack = {
          ...payload,
          track: {
            name: `Track for ${payload.name}`,
            description: payload.description || ''
          }
        };
        return await createRoom(payloadWithTrack);
      }
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // validation
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        toast.error('Start time must be before end time');
        setLoading(false);
        return;
      }

      // 1) Update schedule (only fields backend accepts) - do NOT send start/end times
      // Times belong to the room child; sending them to schedule will update the parent.
      const schedulePayload: UpdateScheduleData = {
        date: formData.date || undefined,
        // We intentionally don't send start/end here so child room retains time fields
        // We intentionally don't send title (backend doesn't accept it)
        description: undefined,
        scheduleType: formData.scheduleType || undefined
      };

      await updateSchedule(schedule.id, schedulePayload);

      // 2) Update existing MAIN room or create one
      const roomPayloadForUpdate: any = {};
      if (formData.roomName !== undefined) roomPayloadForUpdate.name = formData.roomName;
      if (formData.roomDescription !== undefined) roomPayloadForUpdate.description = formData.roomDescription;
      if (formData.roomOnlineUrl !== undefined) roomPayloadForUpdate.online_meeting_url = formData.roomOnlineUrl || null;
      if (formData.startTime) roomPayloadForUpdate.start_time = normalizeTime(formData.startTime);
      if (formData.endTime) roomPayloadForUpdate.end_time = normalizeTime(formData.endTime);

      if (formData.mainRoomId) {
        // Update existing main room. Wrap in try/catch to surface errors but not block schedule update.
        try {
          await updateRoom(formData.mainRoomId, roomPayloadForUpdate);
        } catch (roomUpdateErr: any) {
          // If update fails (validation), attempt create fallback (rare if mainRoomId exists)
          const serverMsg = roomUpdateErr?.data?.message || roomUpdateErr?.message || String(roomUpdateErr);
          toast.error(`Main room update failed: ${serverMsg}`);
        }
      } else {
        // create main room and attach to schedule
        const createPayload = {
          name: formData.roomName || 'Main Room',
          identifier: null,
          description: formData.roomDescription || '',
          type: 'MAIN',
          online_meeting_url: formData.roomOnlineUrl || null,
          // Normalize times for backend if needed by room (some backends require null/omit)
          start_time: normalizeTime(formData.startTime) || null,
          end_time: normalizeTime(formData.endTime) || null,
          schedule_id: schedule.id
        };

        try {
          await createRoomWithFallback(createPayload);
        } catch (createErr: any) {
          const serverMsg = createErr?.data?.message || createErr?.message || String(createErr);
          toast.error(`Creating main room failed: ${serverMsg}`);
        }
      }

      toast.success('Schedule and Main Room updated!');
      onClose();
      onUpdated?.();
    } catch (error: any) {
      const serverMsg = error?.data?.message || error?.message || String(error);
      toast.error(`Update failed: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
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
                <Label htmlFor="title">
                  Title
                  <span className="text-xs text-gray-500 ml-2"> (read-only)</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Schedule title"
                  disabled
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="scheduleType">Type</Label>
                <Select
                  value={formData.scheduleType}
                  onValueChange={(value) => handleInputChange('scheduleType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <Label htmlFor="roomDescription">Main Room Description (shown in Main Room)</Label>
              <Textarea
                id="roomDescription"
                value={formData.roomDescription}
                onChange={(e) => handleInputChange('roomDescription', e.target.value)}
                placeholder="Moderator, session details..."
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