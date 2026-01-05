"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConferenceSchedule, useConferenceScheduleActions } from "@/hooks/useConferenceSchedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Calendar, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import ConferenceYearTabs from "@/components/admin/conference/ConferenceYearTabs";
import ConferenceContent from "@/components/admin/conference/ConferenceContent";
import CreateConferenceModal from "@/components/admin/CreateConferenceModal";
import { useConferenceData } from "@/hooks/useConferenceData";

export default function ICICyTAAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialYear = searchParams.get('year') || "";
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Base conferences hook
  const {
    conferences,
    loading: confLoading,
    error: confError,
    refetch: refetchConferences,
  } = useConferenceSchedule();

  // Get ICICYTA conferences and selected conference
  const {
    availableYears,
    selectedConference
  } = useConferenceData(conferences, selectedYear);

  // Auto-select most recent year or use URL param
  useEffect(() => {
    const yearParam = searchParams.get('year');
    if (yearParam && availableYears.includes(yearParam)) {
      if (selectedYear !== yearParam) {
        setSelectedYear(yearParam);
      }
    } else if (availableYears.length > 0 && !selectedYear) {
      // Default to latest if no param or invalid param
      const latestYear = availableYears[0];
      setSelectedYear(latestYear);
      // Update URL to match default
      router.replace(`/admin/ICICYTA?year=${latestYear}`, { scroll: false });
    }
  }, [availableYears, searchParams, router, selectedYear]);

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    router.push(`/admin/ICICYTA?year=${year}`, { scroll: false });
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  // Actions hook
  const { updateConferenceSchedule } = useConferenceScheduleActions();

  const handleToggleActive = async (conferenceId: string, isActive: boolean) => {
    try {
      await updateConferenceSchedule(conferenceId, { isActive });
      toast.success(`Conference ${isActive ? "activated" : "deactivated"} successfully`);
      refetchConferences();
    } catch (error: any) {
      toast.error(error.message || "Failed to update conference status");
    }
  };

  // Loading state
  if (confLoading) {
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
          <Calendar className="w-16 h-16 text-[#015B97] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No ICICyTA Conferences Found
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first ICICyTA conference to get started.
          </p>
          <Button
            onClick={() => setActiveModal("create-conference")}
            className="bg-[#015B97] hover:bg-[#014f7a]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create ICICyTA Conference
          </Button>
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
                {selectedConference ? (
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
              <Badge variant="outline" className="bg-blue-50 text-[#015B97]">
                <CalendarDays className="w-4 h-4 mr-1" />
                ICICyTA {selectedYear}
              </Badge>

              {/* ✅ Simple Action Buttons - No Delete */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/ICICYTA/dashboard')}
                  className="text-[#015B97] border-[#015B97] hover:bg-blue-50"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conference Year Series */}
      <ConferenceYearTabs
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearSelect={handleYearSelect}
        onCreateNew={() => setActiveModal("create-conference")}
        conferenceType="ICICYTA"
        conferences={conferences}
        onToggleActive={handleToggleActive}
      />

      {/* Main Content */}
      <div className="max-w-full mx-auto py-8">
        {!selectedConference ? (
          // Empty State
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No ICICyTA Conference for {selectedYear}
              </h2>
              <p className="text-gray-600 mb-6">
                Create a new ICICyTA conference for {selectedYear} to get started.
              </p>
              <Button
                onClick={() => setActiveModal("create-conference")}
                className="bg-[#015B97] hover:bg-[#014f7a]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {selectedYear} ICICyTA Conference
              </Button>
            </div>
          </div>
        ) : (
          // Conference Content with Tabs
          <ConferenceContent
            conference={selectedConference}
            onModalOpen={setActiveModal}
            onRefresh={refetchConferences}
          />
        )}
      </div>

      {/* Create Conference Modal */}
      {activeModal === "create-conference" && (
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