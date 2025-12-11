"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import conferenceScheduleService from "@/services/ConferenceScheduleService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  conferenceType?: "ICICYTA" | "ICODSA"; // ✅ Props to enforce conference type
}

interface ConferenceFormData {
  name: string;
  description: string;
  year: string;
  startDate: string;
  endDate: string;
  type: string;
  contactEmail: string;
  timezoneIana: string;
  onsitePresentation: string;
  onlinePresentation: string;
  notes: string;
  noShowPolicy: string;
  isActive: boolean;
}

export default function CreateConferenceModal({
  isOpen,
  onClose,
  onSuccess,
  conferenceType = "ICICYTA" // ✅ Default to ICICYTA
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ConferenceFormData>({
    name: "",
    description: "",
    year: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
    type: conferenceType, // ✅ Set from props
    contactEmail: conferenceType === "ICICYTA" ? "icicyta@telkomuniversity.ac.id" : "icodsa@telkomuniversity.ac.id",
    timezoneIana: "Asia/Makassar",
    onsitePresentation: "",
    onlinePresentation: "ZOOM MEETING",
    notes: "",
    noShowPolicy: "",
    isActive: true,
  });

  const handleInputChange = (field: keyof ConferenceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.contactEmail) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    setLoading(true);
    try {
      const token = await conferenceScheduleService.getAccessToken();

      if (!token) {
        toast.error("Authentication failed. Please login again.");
        return;
      }

      // ✅ Create conference payload with enforced type
      const conferencePayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        year: formData.year,
        start_date: formData.startDate,
        end_date: formData.endDate,
        type: conferenceType, // ✅ Use prop instead of form field
        contact_email: formData.contactEmail.trim(),
        timezone_iana: formData.timezoneIana,
        onsite_presentation: formData.onsitePresentation.trim(),
        online_presentation: formData.onlinePresentation.trim(),
        notes: formData.notes.trim(),
        no_show_policy: formData.noShowPolicy.trim(),
        is_active: formData.isActive,
      };

      console.log('Creating conference:', conferencePayload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conference-schedule`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(conferencePayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create conference';

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.errors?.validation) {
            const validations: Record<string, string[]> = errorData.errors.validation;
            const messages = Object.keys(validations).map(
              (k) => `${k}: ${validations[k].join(", ")}`
            );
            errorMessage = `Validation: ${messages.join(" | ")}`;
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {
          console.log('Could not parse error response:', errorText);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      toast.success(`${conferenceType} Conference "${formData.name}" created successfully!`);

      // Reset form
      setFormData({
        name: "",
        description: "",
        year: new Date().getFullYear().toString(),
        startDate: "",
        endDate: "",
        type: conferenceType,
        contactEmail: conferenceType === "ICICYTA" ? "icicyta@telkomuniversity.ac.id" : "icodsa@telkomuniversity.ac.id",
        timezoneIana: "Asia/Makassar",
        onsitePresentation: "",
        onlinePresentation: "ZOOM MEETING",
        notes: "",
        noShowPolicy: "",
        isActive: true,
      });

      onSuccess();

      // Optionally redirect to new conference
      setTimeout(() => {
        const isSuperAdmin = window.location.pathname.includes('/super-admin');
        let redirectPath = "";

        if (conferenceType === "ICICYTA") {
          redirectPath = isSuperAdmin ? "/super-admin/ICICYTA" : "/admin/ICICYTA";
        } else {
          redirectPath = isSuperAdmin ? "/super-admin/ICODSA" : "/admin/ICODSA";
        }

        window.location.href = redirectPath;
      }, 1000);

    } catch (error: any) {
      console.error('Create conference error:', error);
      toast.error(error.message || "Failed to create conference");
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = () => {
    if (formData.startDate && formData.endDate && formData.year) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const startDay = start.getDate();
      const endDay = end.getDate();
      const month = start.toLocaleDateString('en-US', { month: 'long' });

      const description = `${startDay}${startDay !== endDay ? ` - ${endDay}` : ''}${startDay === endDay ? 'st' : 'th'} ${month} ${formData.year} (Hybrid)`;
      handleInputChange('description', description);
    }
  };

  // ✅ Auto-generate conference name based on type and year
  const generateConferenceName = () => {
    if (formData.year) {
      const name = `${conferenceType} ${formData.year} Conference Program`;
      handleInputChange('name', name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Create New {conferenceType} Conference
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="2024"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => {
                    handleInputChange('year', e.target.value);
                    setTimeout(generateConferenceName, 100);
                  }}
                />
              </div>

              {/* ✅ Show conference type as readonly */}
              <div>
                <Label>Conference Type</Label>
                <Input
                  value={conferenceType}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">You can only create {conferenceType} conferences</p>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Conference Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`e.g., ${conferenceType} ${formData.year} Conference Program`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateConferenceName}
                className="mt-1 text-xs"
              >
                Auto-generate name
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    handleInputChange('startDate', e.target.value);
                    setTimeout(generateDescription, 100);
                  }}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={(e) => {
                    handleInputChange('endDate', e.target.value);
                    setTimeout(generateDescription, 100);
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e. g., 17th - 19th December 2025 (Hybrid)"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from dates, or enter manually</p>
            </div>
          </div>

          {/* Contact & Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Contact & Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value="Asia/Makassar (WITA - GMT+8)"
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Conference
              </Label>
            </div>
          </div>

          {/* Presentation Locations */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Presentation Locations</h3>

            <div>
              <Label htmlFor="onsitePresentation">Onsite Location</Label>
              <Input
                id="onsitePresentation"
                value={formData.onsitePresentation}
                onChange={(e) => handleInputChange('onsitePresentation', e.target.value)}
                placeholder="e.g., THE EVITEL RESORT UBUD, BALI, INDONESIA (2nd Floor)"
              />
            </div>

            <div>
              <Label htmlFor="onlinePresentation">Online Platform</Label>
              <Input
                id="onlinePresentation"
                value={formData.onlinePresentation}
                onChange={(e) => handleInputChange('onlinePresentation', e.target.value)}
                placeholder="e. g., ZOOM MEETING"
              />
            </div>

            <div>
              <Label htmlFor="notes">Meeting Link Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="e.g., Link Zoom Main Room & Parallel Session : https://..."
                rows={2}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Additional Information</h3>

            <div>
              <Label htmlFor="noShowPolicy">No Show Policy</Label>
              <Textarea
                id="noShowPolicy"
                value={formData.noShowPolicy}
                onChange={(e) => handleInputChange('noShowPolicy', e.target.value)}
                placeholder="Enter conference no-show policy..."
                rows={4}
              />
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <h4 className="font-medium text-sm mb-2 text-blue-800">Conference Preview:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Type:</strong> {conferenceType}</div>
                <div><strong>Year:</strong> {formData.year}</div>
                {formData.startDate && formData.endDate && (
                  <div><strong>Duration:</strong> {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</div>
                )}
                <div><strong>Contact:</strong> {formData.contactEmail}</div>
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
            disabled={loading || !formData.name || !formData.startDate || !formData.endDate}
            className="bg-[#015B97] hover:bg-[#014f7a]"
          >
            {loading ? "Creating..." : `Create ${conferenceType} Conference`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}