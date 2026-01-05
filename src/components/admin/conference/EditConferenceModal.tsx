"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import type { BackendConferenceSchedule } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conference: BackendConferenceSchedule;
  onSuccess: () => void;
}

export default function EditConferenceModal({ isOpen, onClose, conference, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    start_date: "",
    end_date: "",
    description: "",
    contact_email: "",
    timezone_iana: "Asia/Jakarta",
    onsite_presentation: "",
    online_presentation: "",
    is_active: true,
  });

  // Initialize form data when conference changes
  useEffect(() => {
    if (conference && isOpen) {
      setFormData({
        name: conference.name || "",
        year: conference.year?.toString() || "",
        start_date: conference.start_date ? new Date(conference.start_date).toISOString().split('T')[0] : "",
        end_date: conference.end_date ? new Date(conference.end_date).toISOString().split('T')[0] : "",
        description: conference.description || "",
        contact_email: conference.contact_email || "",
        timezone_iana: conference.timezone_iana || "Asia/Jakarta",
        onsite_presentation: conference.onsite_presentation || "",
        online_presentation: conference.online_presentation || "",
        is_active: conference.is_active !== false,
      });
    }
  }, [conference, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!conference.id) {
      toast.error("Conference ID is missing");
      return;
    }

    if (!formData.name.trim() || !formData.year.trim()) {
      toast.error("Name and year are required");
      return;
    }

    setLoading(true);
    try {
      const accessToken = await conferenceScheduleService.getAccessToken();
      if (!accessToken) {
        toast.error("Authentication failed");
        return;
      }
      const updateData = {
        name: formData.name.trim(),
        year: formData.year.trim(),
        startDate: formData.start_date || undefined,
        endDate: formData.end_date || undefined,
        description: formData.description.trim(),
        contactEmail: formData.contact_email.trim(),
        timezoneIana: formData.timezone_iana,
        onsitePresentation: formData.onsite_presentation.trim(),
        onlinePresentation: formData.online_presentation.trim(),
        isActive: formData.is_active,
      };

      await conferenceScheduleService.updateConferenceSchedule(accessToken, conference.id, updateData);

      toast.success("Conference updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update conference");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Conference</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Conference Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter conference name"
                required
              />
            </div>
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                placeholder="2025"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Conference description"
              rows={3}
            />
          </div>

          {/* Contact and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Presentation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="onsite_presentation">Onsite Presentation</Label>
              <Input
                id="onsite_presentation"
                value={formData.onsite_presentation}
                onChange={(e) => handleInputChange("onsite_presentation", e.target.value)}
                placeholder="Main auditorium"
              />
            </div>
            <div>
              <Label htmlFor="online_presentation">Online Presentation</Label>
              <Input
                id="online_presentation"
                value={formData.online_presentation}
                onChange={(e) => handleInputChange("online_presentation", e.target.value)}
                placeholder="Zoom/Google Meet"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone_iana} onValueChange={(value) => handleInputChange("timezone_iana", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Conference is active (visible to users)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Conference"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}