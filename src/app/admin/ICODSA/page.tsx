"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { useConferenceSchedule } from "@/hooks/useConferenceSchedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import ConferenceYearTabs from "@/components/admin/conference/ConferenceYearTabs";
import ConferenceContent from "@/components/admin/conference/ConferenceContent";
import CreateConferenceModal from "@/components/admin/CreateConferenceModal";
import { useConferenceDataICODSA } from "@/hooks/useConferenceDataICODSA";
import type { BackendConferenceSchedule } from "@/types";

export default function ICODSAAdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Base conferences hook
  const {
    conferences,
    loading: confLoading,
    error: confError,
    refetch: refetchConferences,
  } = useConferenceSchedule();

  // Get ICODSA conferences and selected conference
  const { 
    icodsaConferences, 
    availableYears, 
    selectedConference 
  } = useConferenceDataICODSA(conferences, selectedYear);

  // Auto-select most recent year
  useEffect(() => {
    if (availableYears.length > 0 && ! selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const handleModalClose = () => {
    setActiveModal(null);
  };

  // Check authentication and role
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN_ICODSA') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Unauthorized</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* No conferences state */}
      {availableYears.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No ICODSA Conferences Found
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first ICODSA conference to get started. 
            </p>
            <Button
              onClick={() => setActiveModal("create-conference")}
              className="bg-[#015B97] hover:bg-[#014f7a]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create ICODSA Conference
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-full mx-auto px-6">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900">
                    {selectedConference?.name || "ICODSA Conference"}
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
                    ICODSA {selectedYear}
                  </Badge>
                  
                  {/* ✅ Simple Action Buttons - No Delete */}
                  <div className="flex items-center space-x-2">
                    {/* No buttons needed */}
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Conference Year Series */}
      <ConferenceYearTabs
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearSelect={setSelectedYear}
        onCreateNew={() => setActiveModal("create-conference")}
        conferenceType="ICODSA"
      />          {/* Main Content */}
          <div className="max-w-full mx-auto py-8">
            {! selectedConference ? (
              // Empty State
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    No ICODSA Conference for {selectedYear}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Create a new ICODSA conference for {selectedYear} to get started.
                  </p>
                  <Button
                    onClick={() => setActiveModal("create-conference")}
                    className="bg-[#015B97] hover:bg-[#014f7a]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create {selectedYear} ICODSA Conference
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
        </>
      )}

      {/* Create Conference Modal */}
      {activeModal === "create-conference" && (
        <CreateConferenceModal
          isOpen={true}
          onClose={handleModalClose}
          onSuccess={() => {
            setActiveModal(null);
            // Don't refetch immediately due to potential token issues
            // User can refresh manually or navigate
            toast.success("ICODSA Conference created successfully! Please refresh the page to see it.");
          }}
          conferenceType="ICODSA"
        />
      )}
    </div>
  );
}