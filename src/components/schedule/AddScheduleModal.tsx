"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conferenceId: string;
  onSuccess?: () => void;
  initialDate?: string;
}

interface ScheduleFormData {
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  notes: string;
  createMainRoom: boolean;
  mainRoomDescription: string;
}

export default function AddScheduleModal({ 
  isOpen, 
  onClose, 
  conferenceId,
  onSuccess,
  initialDate
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: initialDate || "",
    startTime: "",
    endTime: "",
    type: "TALK",
    notes: "",
    createMainRoom: true,
    mainRoomDescription: "",
  });

  // Update date when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({
        ...prev,
        date: initialDate
      }));
    }
  }, [initialDate]);

  const handleInputChange = (field: keyof ScheduleFormData, value: string | boolean) => {
    setFormData(prev => ({
      ... prev,
      [field]: value
    }));
  };

  // CREATE SCHEDULE API
  const createSchedule = async (scheduleData: any) => {
    const token = await conferenceScheduleService.getAccessToken();

    if (!token) {
      throw new Error('Authentication failed. Please login again.');
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedule`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create schedule');
    }

    const result = await response.json();
    return result. data;
  };

  // CREATE ROOM API
  const createRoom = async (roomData: any) => {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(
      `${process.env. NEXT_PUBLIC_API_BASE_URL}/api/v1/room`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.  stringify(roomData),
      }
    );

    if (! response.  ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create room');
    }

    const result = await response.json();
    return result. data;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Creating schedule for conference:', conferenceId);
      
      // Step 1: Create Schedule
      const schedulePayload = {
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        type: formData.type,
        notes: formData.notes || "",
        conference_schedule_id: conferenceId,
      };
      
      console.log('🔍 SCHEDULE PAYLOAD:', schedulePayload);
      const scheduleResponse = await createSchedule(schedulePayload);
      console.log('✅ SCHEDULE CREATED:', scheduleResponse);

      // Step 2: Create Main Room (if enabled)
      if (formData. createMainRoom && scheduleResponse?.id) {
        const roomPayload = {
          name: "Main Room",
          identifier: null,
          description: formData. mainRoomDescription || formData.notes || "Main Session",
          type: "MAIN",
          online_meeting_url: null,
          schedule_id: scheduleResponse.id,
        };
        
        console.log('🔍 CREATING MAIN ROOM:', roomPayload);
        const roomResponse = await createRoom(roomPayload);
        console.log('✅ MAIN ROOM CREATED:', roomResponse);
      }
      
      toast.success("Schedule and main room created successfully!");
      
      // Reset form
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        type: "TALK",
        notes: "",
        createMainRoom: true,
        mainRoomDescription: "",
      });

      // ✅ FORCE REFRESH - Wait a bit then trigger refresh
      setTimeout(() => {
        console.log('🔄 Triggering data refresh...');
        onSuccess?.();
      }, 100);

      onClose();
      
    } catch (error: any) {
      console.error('❌ FULL ERROR:', error);
      
      let errorMessage = "Failed to create";
      
      if (error?.message) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors?. validation) {
            const validations = errorData.errors.  validation;
            const messages = Object.keys(validations).map(
              (field) => `${field}: ${validations[field]. join(", ")}`
            );
            errorMessage = `Validation Error: ${messages.  join(" | ")}`;
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {
          errorMessage = error.  message;
        }
      }
      
      toast.error(errorMessage, { duration: 10000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              disabled={!!initialDate}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <Label>Schedule Type</Label>
            <Select value={formData.  type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TALK">Talk/Presentation</SelectItem>
                <SelectItem value="BREAK">Break</SelectItem>
                <SelectItem value="KEYNOTE">Keynote</SelectItem>
                <SelectItem value="PANEL">Panel Discussion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes/Description</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.  target.value)}
              placeholder="e.g., Opening Keynote, Coffee Break, etc."
              rows={2}
            />
          </div>

          {/* Main Room Creation */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="createMainRoom"
                checked={formData.createMainRoom}
                onChange={(e) => handleInputChange('createMainRoom', e.  target.checked)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="createMainRoom" className="text-sm font-medium">
                  Create Main Room
                </Label>
                <p className="text-xs text-blue-600 mt-1">
                  Automatically create a main room for this time slot.     
                  You can add parallel sessions (Room A, B, C) afterward.
                </p>
                
                {formData.createMainRoom && (
                  <div className="mt-2">
                    <Input
                      placeholder="Main room description (optional)"
                      value={formData.mainRoomDescription}
                      onChange={(e) => handleInputChange('mainRoomDescription', e.target.  value)}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.date && formData.  startTime && formData.endTime && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <h4 className="font-medium text-sm mb-2">Preview:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Date:</strong> {new Date(formData.date).  toLocaleDateString()}</div>
                <div><strong>Time:</strong> {formData.startTime} - {formData.endTime}</div>
                <div><strong>Type:</strong> {formData.type}</div>
                {formData.notes && <div><strong>Notes:</strong> {formData.notes}</div>}
                {formData.createMainRoom && (
                  <div className="text-blue-600 text-xs mt-2">
                    ✓ Will create main room for this time slot
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.date || !formData.startTime || !formData.endTime}
            className="bg-[#015B97] hover:bg-[#014f7a]"
          >
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}