"use client";

import { useState, useEffect } from "react";
import { useConferenceSchedule } from "@/hooks/useConferenceSchedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import ConferenceYearTabs from "@/components/admin/conference/ConferenceYearTabs";
import ConferenceContent from "@/components/admin/conference/ConferenceContent";
import CreateConferenceModal from "@/components/admin/CreateConferenceModal";
import UserConferenceScheduleTable from "@/components/UserConferenceScheduleTable";
import { useConferenceData } from "@/hooks/useConferenceData";
import { useConferenceTabsData } from "@/hooks/useConferenceTabsData";
import type { BackendConferenceSchedule } from "@/types";

// Role checking utility
const isAdminRole = (role?: string) => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN_ICICYTA' || role === 'ADMIN_ICODSA';
};

export default function ICICyTAAdminPage() {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Mock user role - in real app this would come from auth context
  const userRole = 'USER'; // Change this to test different roles: 'SUPER_ADMIN', 'ADMIN_ICICYTA', 'ADMIN_ICODSA', 'USER'

  // Base conferences hook
  const {
    conferences,
    loading: confLoading,
    error: confError,
    refetch: refetchConferences,
  } = useConferenceSchedule();

  // Get ICICYTA conferences and selected conference
  const {
    icicytaConferences,
    availableYears,
    selectedConference
  } = useConferenceData(conferences, selectedYear);

  // Get data for selected conference (for regular users)
  const { schedules: userSchedules, loading: userLoading } = useConferenceTabsData(selectedConference || {} as BackendConferenceSchedule);
  useEffect(() => {
    if (availableYears.length > 0 && ! selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const handleModalClose = () => {
    setActiveModal(null);
  };

  // Loading state
  if (confLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (confError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Conferences
          </h2>
          <p className="text-gray-600">Failed to load conference data. </p>
        </div>
      </div>
    );
  }

  // No conferences state
  if (availableYears.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No ICICyTA Conferences Found
          </h2>
          <p className="text-gray-600 mb-6">
            {isAdminRole(userRole) ? "Create your first ICICyTA conference to get started." : "No conference data available."}
          </p>
          {isAdminRole(userRole) && (
            <Button
              onClick={() => setActiveModal("create-conference")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create ICICyTA Conference
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                {selectedConference?.name || "ICICyTA Conference"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {selectedConference ?  (
                  <>
                    {new Date(selectedConference.start_date).toLocaleDateString()} -{" "}
                    {new Date(selectedConference.end_date).toLocaleDateString()}
                  </>
                ) : (
                  "No conference data available for this year"
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <CalendarDays className="w-4 h-4 mr-1" />
                ICICyTA {selectedYear}
              </Badge>

              {/* ✅ Simple Action Buttons - Show only for admins */}
              {isAdminRole(userRole) && (
                <div className="flex items-center space-x-2">
                  {/* No buttons needed */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conference Year Series - Show only for admins */}
      {isAdminRole(userRole) && (
        <ConferenceYearTabs
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearSelect={setSelectedYear}
          onCreateNew={() => setActiveModal("create-conference")}
          conferenceType="ICICYTA"
        />
      )}

      {/* Main Content */}
      <div className="max-w-full mx-auto py-8">
        {! selectedConference ? (
          // Empty State
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No ICICyTA Conference for {selectedYear}
              </h2>
              <p className="text-gray-600 mb-6">
                {isAdminRole(userRole) ? "Create a new ICICyTA conference for " + selectedYear + " to get started." : "No conference data available."}
              </p>
              {isAdminRole(userRole) && (
                <Button
                  onClick={() => setActiveModal("create-conference")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create {selectedYear} ICICyTA Conference
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Conference Content with Tabs - Show only for admins, direct table for users
          isAdminRole(userRole) ? (
            <ConferenceContent
              conference={selectedConference}
              onModalOpen={setActiveModal}
              onRefresh={refetchConferences}
            />
          ) : (
            // Direct Schedule View for regular users - Same layout as admin
            <UserConferenceScheduleTable
              conference={selectedConference}
              schedules={userSchedules}
            />
          )
        )}
      </div>

      {/* Create Conference Modal - Only for admins */}
      {isAdminRole(userRole) && activeModal === "create-conference" && (
        <CreateConferenceModal
          isOpen={true}
          onClose={handleModalClose}
          onSuccess={() => {
            setActiveModal(null);
            refetchConferences();
            toast.success("ICICyTA Conference created successfully!");
          }}
          conferenceType="ICICYTA"
        />
      )}
    </div>
  );
}