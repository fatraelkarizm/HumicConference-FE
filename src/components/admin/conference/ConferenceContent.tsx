"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConferenceScheduleTable from "@/components/admin/ConferenceScheduleTable";
import RoomManagementTab from "@/components/admin/conference/RoomManagementTab";
import TrackSessionsTab from "@/components/admin/conference/TrackSessionsTab";
import ConferenceModals from "@/components/admin/conference/ConferenceModal";
import EditConferenceModal from "@/components/admin/conference/EditConferenceModal";
import DeleteConferenceModal from "@/components/admin/conference/DeleteConferenceModal";
import { useConferenceTabsData } from "@/hooks/useConferenceTabsData";
import type { BackendConferenceSchedule, BackendSchedule, BackendRoom, BackendTrackSession } from "@/types";
import toast from "react-hot-toast";

interface Props {
  conference: BackendConferenceSchedule;
  onModalOpen: (modal: string) => void;
  onRefresh: () => void;
}

export default function ConferenceContent({
  conference,
  onModalOpen,
  onRefresh,
}: Props) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<BackendSchedule | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<BackendRoom | null>(null);
  const [selectedTrackSession, setSelectedTrackSession] = useState<BackendTrackSession | null>(null);
  const [showEditConferenceModal, setShowEditConferenceModal] = useState(false);
  const [showDeleteConferenceModal, setShowDeleteConferenceModal] = useState(false);

  // Get data for this conference
  const { schedules, rooms, tracks, trackSessions, loading, refetchAll } =
    useConferenceTabsData(conference);

  const handleModalClose = () => {
    setActiveModal(null);
    setSelectedSchedule(null);
    setSelectedRoom(null);
    setSelectedTrackSession(null);
  };

  const handleEditConference = () => {
    setShowEditConferenceModal(true);
  };

  const handleDeleteConference = () => {
    setShowDeleteConferenceModal(true);
  };

  const handleConferenceUpdated = () => {
    setShowEditConferenceModal(false);
    handleRefresh();
  };

  const handleConferenceDeleted = () => {
    setShowDeleteConferenceModal(false);
    // Navigate back to year selection since conference is deleted
    onRefresh();
  };

  // ✅ Enhanced refresh function with delay
  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing conference data...");

    try {
      await refetchAll();
      onRefresh();

      toast.success("Data refreshed successfully! ", { id: toastId });
    } catch {
      toast.error("Failed to refresh data", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Schedule Overview</TabsTrigger>
          <TabsTrigger value="rooms">Room Management</TabsTrigger>
          <TabsTrigger value="tracks">Track Sessions</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Table</TabsTrigger>
        </TabsList>

        {/* Schedule Overview Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Conference Overview
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditConference}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Edit Conference
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteConference}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Delete Conference
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">General Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Year:</span>{" "}
                      {conference.year}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 ml-2"
                      >
                        {conference.type}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Contact:</span>{" "}
                      {conference.contact_email}
                    </div>
                    <div>
                      <span className="font-medium">Timezone:</span>{" "}
                      {conference.timezone_iana}
                    </div>
                    <div>
                      <span className="font-medium">Track Sessions:</span>{" "}
                      {trackSessions.length}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Presentation Locations</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Onsite:</span>{" "}
                      {conference.onsite_presentation}
                    </div>
                    <div>
                      <span className="font-medium">Online:</span>{" "}
                      {conference.online_presentation}
                    </div>
                    <div>
                      <span className="font-medium">Schedules:</span>{" "}
                      {schedules.length}
                    </div>
                    <div>
                      <span className="font-medium">Room:</span> {rooms.length}
                    </div>
                    <div>
                      <span className="font-medium">Track:</span>{" "}
                      {tracks.length}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Room Management Tab */}
        <TabsContent value="rooms">
          <RoomManagementTab
            conferenceId={conference.id}
            rooms={rooms}
            schedules={schedules}
            loading={loading}
            onModalOpen={setActiveModal}
            onRoomSelect={setSelectedRoom}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* Track Sessions Tab */}
        <TabsContent value="tracks">
          <TrackSessionsTab
            conferenceId={conference.id}
            trackSessions={trackSessions}
            tracks={tracks}
            rooms={rooms}
            loading={loading}
            onModalOpen={setActiveModal}
            onTrackSessionSelect={setSelectedTrackSession}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* Schedule Table Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Conference Schedule Table - {conference.year}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {schedules.length} schedules
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ConferenceScheduleTable
                conference={conference}
                schedules={schedules}
                onScheduleSelect={(schedule) => {
                  setSelectedSchedule(schedule);
                  if (schedule.id) {
                    setActiveModal("edit-schedule");
                  } else {
                    setActiveModal("add-schedule");
                  }
                }}
                onScheduleEdit={(schedule) => {
                  setSelectedSchedule(schedule);
                  setActiveModal("edit-schedule");
                }}
                onScheduleDetail={(schedule) => {
                  setSelectedSchedule(schedule);
                  setActiveModal("detail-schedule");
                }}
                onRoomEdit={(room) => {
                  setSelectedRoom(room);
                  setActiveModal("edit-room");
                }}
                onRoomDetail={(room) => {
                  setSelectedRoom(room);
                  setActiveModal("detail-room");
                }}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Modals */}
      <ConferenceModals
        activeModal={activeModal}
        onClose={handleModalClose}
        conference={conference}
        selectedSchedule={selectedSchedule}
        selectedRoom={selectedRoom}
        selectedTrackSession={selectedTrackSession}
        tracks={tracks}
        onRefresh={handleRefresh}
        onCreateConference={() => onModalOpen("create-conference")}
      />

      {/* Edit Conference Modal */}
      <EditConferenceModal
        isOpen={showEditConferenceModal}
        onClose={() => setShowEditConferenceModal(false)}
        conference={conference}
        onSuccess={handleConferenceUpdated}
      />

      {/* Delete Conference Modal */}
      <DeleteConferenceModal
        isOpen={showDeleteConferenceModal}
        onClose={() => setShowDeleteConferenceModal(false)}
        conference={conference}
        onSuccess={handleConferenceDeleted}
      />
    </div>
  );
}
