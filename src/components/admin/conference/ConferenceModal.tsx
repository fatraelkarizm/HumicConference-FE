import { useState } from "react";
import { toast } from "react-hot-toast";
import { useScheduleActions } from "@/hooks/useSchedule";
import { useRoomActions } from "@/hooks/useRoom";
import { useTrackSessionActions } from "@/hooks/useTrackSession";

// Import all your existing modals
import AddScheduleModal from "@/components/schedule/AddScheduleModal";
import EditScheduleModal from "@/components/schedule/EditScheduleModal";
import DetailScheduleModal from "@/components/schedule/DetailScheduleModal";
import AddRoomModal from "@/components/room/AddRoomModal";
import EditRoomModal from "@/components/room/EditRoomModal";
import DetailRoomModal from "@/components/room/DetailRoomModal";
import AddTrackSessionModal from "@/components/trackSession/AddTrackSessionModal";
import EditTrackSessionModal from "@/components/trackSession/EditTrackSessionModal";
import DetailTrackSessionModal from "@/components/trackSession/DetailTrackSessionModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

import type { BackendConferenceSchedule, BackendTrack } from "@/types";

interface Props {
  activeModal: string | null;
  onClose: () => void;
  conference: BackendConferenceSchedule;
  selectedSchedule: any;
  selectedRoom: any;
  selectedTrackSession: any;
  tracks: BackendTrack[];
  onRefresh: () => void;
}

export default function ConferenceModals({
  activeModal,
  onClose,
  conference,
  selectedSchedule,
  selectedRoom,
  selectedTrackSession,
  tracks,
  onRefresh,
}: Props) {
  const [deleteLoading, setDeleteLoading] = useState(false);


  const { deleteRoom } = useRoomActions();
  const { deleteTrackSession } = useTrackSessionActions();

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    setDeleteLoading(true);
    try {
      await deleteRoom(selectedRoom.id);
      toast.success("Room deleted successfully!");
      onClose();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteTrackSession = async () => {
    if (!selectedTrackSession) return;

    setDeleteLoading(true);
    try {
      await deleteTrackSession(selectedTrackSession.id);
      toast.success("Track session deleted successfully!");
      onClose();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete track session");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Schedule Modals */}
      {activeModal === "add-schedule" && (
        <AddScheduleModal
          isOpen={true}
          onClose={onClose}
          conferenceId={conference.id}
        />
      )}

      {activeModal === "edit-schedule" && selectedSchedule && (
        <EditScheduleModal
          isOpen={true}
          onClose={onClose}
          schedule={selectedSchedule}
        />
      )}

      {activeModal === "detail-schedule" && selectedSchedule && (
        <DetailScheduleModal
          isOpen={true}
          onClose={onClose}
          schedule={selectedSchedule}
        />
      )}

      {/* Room Modals */}
      {activeModal === "add-room" && (
        <AddRoomModal
          isOpen={true}
          onClose={onClose}
          scheduleId={selectedSchedule?.id}
          onSubmit={async () => {
            // Placeholder: functionality handled inside AddRoomModal or parent
            console.warn("onSubmit placeholder in ConferenceModals called");
          }}
          selectedScheduleForRoom={null}
          selectedRoomType={""}
          newRoom={{
            name: "",
            identifier: "",
            description: "",
            type: "PARALLEL",
            onlineMeetingUrl: "",
            startTime: "",
            endTime: "",
          }}
          setNewRoom={() => {
            // Placeholder
          }}
          loading={false}
        />
      )}

      {activeModal === "edit-room" && selectedRoom && (
        <EditRoomModal isOpen={true} onClose={onClose} room={selectedRoom} />
      )}

      {activeModal === "detail-room" && selectedRoom && (
        <DetailRoomModal isOpen={true} onClose={onClose} room={selectedRoom} />
      )}

      {/* Track Session Modals */}
      {activeModal === "add-track-session" && (
        <AddTrackSessionModal isOpen={true} onClose={onClose} tracks={tracks} />
      )}

      {activeModal === "edit-track-session" && selectedTrackSession && (
        <EditTrackSessionModal
          isOpen={true}
          onClose={onClose}
          session={selectedTrackSession}
        />
      )}

      {activeModal === "detail-track-session" && selectedTrackSession && (
        <DetailTrackSessionModal
          isOpen={true}
          onClose={onClose}
          session={selectedTrackSession}
        />
      )}

      {/* Delete Confirmation Modals */}
      {activeModal === "delete-room" && selectedRoom && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={handleDeleteRoom}
          title="Delete Room"
          description="Are you sure you want to delete this room?  This action will permanently remove the room and all its associated data."
          itemName={selectedRoom.name}
          loading={deleteLoading}
        />
      )}

      {activeModal === "delete-track-session" && selectedTrackSession && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={handleDeleteTrackSession}
          title="Delete Track Session"
          description="Are you sure you want to delete this track session? This action will permanently remove the session and all its data."
          itemName={selectedTrackSession.title}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
