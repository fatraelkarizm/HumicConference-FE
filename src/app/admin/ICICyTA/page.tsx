'use client';

import { useState, useEffect } from 'react';
import { useConferenceSchedule } from '@/hooks/useConferenceSchedule';
import { useSchedule } from '@/hooks/useSchedule';
import { useRoom } from '@/hooks/useRoom';
import { useTrack } from '@/hooks/useTrack';
import { useTrackSession } from '@/hooks/useTrackSession';
import ConferenceScheduleTable from '@/components/admin/ConferenceScheduleTable';
import AddScheduleModal from '@/components/schedule/AddScheduleModal';
import EditScheduleModal from '@/components/schedule/EditScheduleModal';
import DetailScheduleModal from '@/components/schedule/DetailScheduleModal';
import AddRoomModal from '@/components/room/AddRoomModal';
import EditRoomModal from '@/components/room/EditRoomModal';
import DetailRoomModal from '@/components/room/DetailRoomModal';
import AddTrackSessionModal from '@/components/trackSession/AddTrackSessionModal';
import EditTrackSessionModal from '@/components/trackSession/EditTrackSessionModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, Users, Plus, Settings } from 'lucide-react';
import type { BackendConferenceSchedule, BackendSchedule, BackendRoom } from '@/types';

export default function ICICyTAAdminPage() {
  const [selectedConference, setSelectedConference] = useState<BackendConferenceSchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<BackendSchedule | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<BackendRoom | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Hooks
  const { conferences, loading: confLoading, error: confError } = useConferenceSchedule();
  const { schedules, loading: scheduleLoading } = useSchedule(selectedConference?.id);
  const { rooms } = useRoom(selectedSchedule?.id);
  const { tracks } = useTrack();
  const { trackSessions } = useTrackSession();

  // Find ICICYTA conference
  useEffect(() => {
    if (conferences.length > 0) {
      const icicytaConf = conferences.find(conf => conf.type === 'ICICYTA');
      if (icicytaConf) {
        setSelectedConference(icicytaConf);
      }
    }
  }, [conferences]);

  const handleModalClose = () => {
    setActiveModal(null);
    setSelectedSchedule(null);
    setSelectedRoom(null);
  };

  const handleScheduleSelect = (schedule: BackendSchedule) => {
    setSelectedSchedule(schedule);
  };

  const handleRoomSelect = (room: BackendRoom) => {
    setSelectedRoom(room);
  };

  if (confLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (confError || !selectedConference) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conference Not Found</h2>
          <p className="text-gray-600">ICICYTA conference data is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedConference.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedConference.start_date).toLocaleDateString()} - {new Date(selectedConference.end_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <CalendarDays className="w-4 h-4 mr-1" />
                {selectedConference.type}
              </Badge>
              <Button 
                onClick={() => setActiveModal('add-schedule')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Schedule Overview</TabsTrigger>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="tracks">Track Sessions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Schedule Overview Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Conference Schedule</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveModal('add-room')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Add Room
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveModal('add-track-session')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Session
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ConferenceScheduleTable 
                  conference={selectedConference}
                  schedules={schedules}
                  onScheduleSelect={handleScheduleSelect}
                  onScheduleEdit={(schedule) => {
                    setSelectedSchedule(schedule);
                    setActiveModal('edit-schedule');
                  }}
                  onScheduleDetail={(schedule) => {
                    setSelectedSchedule(schedule);
                    setActiveModal('detail-schedule');
                  }}
                  onRoomEdit={(room) => {
                    setSelectedRoom(room);
                    setActiveModal('edit-room');
                  }}
                  onRoomDetail={(room) => {
                    setSelectedRoom(room);
                    setActiveModal('detail-room');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Room Management Tab */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle>Room Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{room.name}</h3>
                        <Badge variant={room.type === 'MAIN' ? 'default' : 'secondary'}>
                          {room.type}
                        </Badge>
                      </div>
                      {room.description && (
                        <p className="text-sm text-gray-600">{room.description}</p>
                      )}
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
                            setActiveModal('edit-room');
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
                            setActiveModal('detail-room');
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Sessions Tab */}
          <TabsContent value="tracks">
            <Card>
              <CardHeader>
                <CardTitle>Track Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tracks.map((track) => (
                    <div key={track.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-4">{track.name}</h3>
                      <div className="grid gap-4">
                        {trackSessions
                          .filter(session => session.track_id === track.id)
                          .map((session) => (
                            <div key={session.id} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{session.title}</h4>
                                  <p className="text-sm text-gray-600">{session.authors}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {session.start_time} - {session.end_time}
                                    </span>
                                    <Badge variant="outline">{session.mode}</Badge>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setActiveModal('edit-track-session')}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Conference Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">General Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Year:</span> {selectedConference.year}</div>
                      <div><span className="font-medium">Type:</span> {selectedConference.type}</div>
                      <div><span className="font-medium">Contact:</span> {selectedConference.contact_email}</div>
                      <div><span className="font-medium">Timezone:</span> {selectedConference.timezone_iana}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Presentation Locations</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Onsite:</span> {selectedConference.onsite_presentation}</div>
                      <div><span className="font-medium">Online:</span> {selectedConference.online_presentation}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {activeModal === 'add-schedule' && (
        <AddScheduleModal 
          isOpen={true}
          onClose={handleModalClose}
          conferenceId={selectedConference.id}
        />
      )}

      {activeModal === 'edit-schedule' && selectedSchedule && (
        <EditScheduleModal
          isOpen={true}
          onClose={handleModalClose}
          schedule={selectedSchedule}
        />
      )}

      {activeModal === 'detail-schedule' && selectedSchedule && (
        <DetailScheduleModal
          isOpen={true}
          onClose={handleModalClose}
          schedule={selectedSchedule}
        />
      )}

      {activeModal === 'add-room' && selectedSchedule && (
        <AddRoomModal
          isOpen={true}
          onClose={handleModalClose}
          scheduleId={selectedSchedule.id}
        />
      )}

      {activeModal === 'edit-room' && selectedRoom && (
        <EditRoomModal
          isOpen={true}
          onClose={handleModalClose}
          room={selectedRoom}
        />
      )}

      {activeModal === 'detail-room' && selectedRoom && (
        <DetailRoomModal
          isOpen={true}
          onClose={handleModalClose}
          room={selectedRoom}
        />
      )}

      {activeModal === 'add-track-session' && (
        <AddTrackSessionModal
          isOpen={true}
          onClose={handleModalClose}
        />
      )}

      {activeModal === 'edit-track-session' && (
        <EditTrackSessionModal
          isOpen={true}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}