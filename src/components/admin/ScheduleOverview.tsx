"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, Globe, Mail, Clock, Plus } from "lucide-react";
import CreateConferenceModal from "@/components/admin/CreateConferenceModal";
import type { BackendConferenceSchedule } from "@/types";

interface Props {
  conference: BackendConferenceSchedule;
  onRefresh?: () => void;
}

export default function ScheduleOverview({ conference, onRefresh }: Props) {
  const [showCreateConference, setShowCreateConference] = useState(false); // ✅ Add state

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric", 
      year: "numeric",
    });
  };

  const getDuration = () => {
    const start = new Date(conference.start_date);
    const end = new Date(conference.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* ✅ Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium">Conference Overview</h2>
        </div>
        <Button
          onClick={() => setShowCreateConference(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Conference
        </Button>
      </div>

      {/* ✅ Rest of your existing content... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">Year:</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {conference.year}
                </Badge>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {conference.type}
                </Badge>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <span className="text-sm text-gray-600">{getDuration()}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">Dates:</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {formatDate(conference.start_date)} - {formatDate(conference.end_date)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {conference. description}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Contact:
                </span>
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {conference.contact_email}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Timezone:
                </span>
                <span className="text-sm text-gray-600">
                  {conference.timezone_iana}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presentation Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Presentation Locations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Onsite:</span>
                </div>
                <div className="text-sm text-gray-600 pl-6">
                  {conference.onsite_presentation}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Online:</span>
                </div>
                <div className="text-sm text-gray-600 pl-6">
                  {conference.online_presentation}
                </div>
                {conference.notes && (
                  <div className="text-xs text-blue-600 pl-6 mt-2">
                    {conference.notes}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {conference.no_show_policy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-red-700">No Show Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 leading-relaxed">
              {conference.no_show_policy}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateConferenceModal
        isOpen={showCreateConference}
        onClose={() => setShowCreateConference(false)}
        onSuccess={() => {
          setShowCreateConference(false);
          onRefresh?.();
        }}
      />
    </div>
  );
}