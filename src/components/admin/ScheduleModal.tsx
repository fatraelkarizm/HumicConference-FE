import AddDayModal from "./AddDayModal";
// Import modal components lainnya yang sudah ada

interface Props {
  modals: {
    addTimeSlot: boolean;
    addRoom: boolean;
    addDay: boolean;
    deleteConfirm: { isOpen: boolean; schedule: any };
  };
  updateModal: (modalName: string, value: any) => void;
  conference: any;
  currentDay: string;
  daysList: string[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onRefresh?: () => void;
  refetchRooms?: () => void;
  formatDate: (dateStr: string) => string;
  getDayNumber: (dateStr: string) => number;
}

export default function ScheduleModals({
  modals,
  updateModal,
  conference,
  currentDay,
  daysList,
  loading,
  setLoading,
  onRefresh,
  refetchRooms,
  formatDate,
  getDayNumber,
}: Props) {
  return (
    <>
      {/* Add Day Modal */}
      {modals.addDay && (
        <AddDayModal
          isOpen={modals.addDay}
          onClose={() => updateModal('addDay', false)}
          conference={conference}
          daysList={daysList}
          loading={loading}
          setLoading={setLoading}
          onRefresh={onRefresh}
          formatDate={formatDate}
        />
      )}
      
      {/* Add other modals here...  */}
    </>
  );
}