'use client';

import { useState } from 'react';
import { useRoomActions } from '@/hooks/useRoom';
import { useTrackOptions } from '@/hooks/useTrack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Globe, Tag, Plus, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { NewRoomData } from '@/types/room';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
}

export default function AddRoomModal({ isOpen, onClose, scheduleId }: Props) {
  const [formData, setFormData] = useState<NewRoomData>({
    name: '',
    identifier: '',
    description: '',
    type: 'MAIN',
    onlineMeetingUrl: '',
    scheduleId: scheduleId,
    trackId: ''
  });
  const [loading, setLoading] = useState(false);

  const { createRoom } = useRoomActions();
  const { trackOptions } = useTrackOptions();

  const roomTypes = [
    { 
      value: 'MAIN', 
      label: 'Main Room', 
      description: 'Primary session room for main activities',
      icon: '🏛️',
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      value: 'PARALLEL', 
      label: 'Parallel Session', 
      description: 'Concurrent session room for breakout activities',
      icon: '🏢',
      color: 'bg-green-100 text-green-800'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Room name is required');
        return;
      }

      // Validate URL format if provided
      if (formData.onlineMeetingUrl && !isValidUrl(formData.onlineMeetingUrl)) {
        toast.error('Please enter a valid URL for online meeting');
        return;
      }

      const roomData: NewRoomData = {
        ...formData,
        name: formData.name.trim(),
        identifier: formData.identifier?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        onlineMeetingUrl: formData.onlineMeetingUrl?.trim() || undefined,
        trackId: formData.trackId || undefined
      };

      // createRoom expects scheduling fields; provide defaults so the argument matches the required type
      await createRoom({
        ...roomData,
        startTime: '',
        endTime: ''
      });
      toast.success('Room created successfully!');
      onClose();
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewRoomData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const selectedRoomType = roomTypes.find(type => type.value === formData.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Room
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Building className="w-4 h-4" />
              <span>Room Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Main Auditorium, Parallel Session 1A"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Room Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as 'MAIN' | 'PARALLEL')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <span className="mr-2">{type.icon}</span>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="identifier">Room Identifier</Label>
                <Input
                  id="identifier"
                  value={formData.identifier}
                  onChange={(e) => handleInputChange('identifier', e.target.value)}
                  placeholder="e.g., Room A, Session 1A"
                />
              </div>
            </div>

            {selectedRoomType && (
              <div className={`p-4 rounded-lg ${selectedRoomType.color}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedRoomType.icon}</span>
                  <div>
                    <div className="font-medium">{selectedRoomType.label}</div>
                    <div className="text-sm">{selectedRoomType.description}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Room description, moderator info, or special notes"
                rows={3}
              />
            </div>
          </div>

          {/* Online Meeting Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Globe className="w-4 h-4" />
              <span>Online Configuration</span>
            </div>

            <div>
              <Label htmlFor="onlineMeetingUrl">Online Meeting URL</Label>
              <Input
                id="onlineMeetingUrl"
                type="url"
                value={formData.onlineMeetingUrl}
                onChange={(e) => handleInputChange('onlineMeetingUrl', e.target.value)}
                placeholder="https://zoom.us/j/... or https://teams.microsoft.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Add Zoom, Teams, or other online meeting link
              </p>
            </div>

            {formData.onlineMeetingUrl && (
              <div className="flex items-center space-x-2 text-sm">
                {isValidUrl(formData.onlineMeetingUrl) ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    ✓ Valid URL
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    ✗ Invalid URL
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Track Assignment (for Parallel Rooms) */}
          {formData.type === 'PARALLEL' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4" />
                <span>Track Assignment</span>
              </div>

              <div>
                <Label htmlFor="trackId">Associated Track</Label>
                <Select value={formData.trackId} onValueChange={(value) => handleInputChange('trackId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a track (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No track assigned</SelectItem>
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

              {formData.trackId && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Track-based room</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    This room will be associated with track sessions for paper presentations
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Room Preview:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{formData.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline" className="text-xs">
                  {selectedRoomType?.label}
                </Badge>
              </div>
              {formData.identifier && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Identifier:</span>
                  <span className="font-medium">{formData.identifier}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Online Meeting:</span>
                <span className={formData.onlineMeetingUrl ? 'text-green-600' : 'text-gray-400'}>
                  {formData.onlineMeetingUrl ? '✓ Configured' : 'Not configured'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}