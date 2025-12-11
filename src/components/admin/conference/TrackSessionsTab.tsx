"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Clock, MoreHorizontal, Trash2, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ManageTracksModal from "@/components/admin/ManageTracksModal";
import type { BackendTrackSession, BackendTrack, BackendRoom } from "@/types";

interface Props {
  conferenceId: string;
  trackSessions: BackendTrackSession[];
  tracks: BackendTrack[];
  rooms: BackendRoom[];
  loading: boolean;
  onModalOpen: (modal: string) => void;
  onTrackSessionSelect: (session: BackendTrackSession) => void;
  onRefresh: () => void;
}

export default function TrackSessionsTab({
  conferenceId,
  trackSessions,
  tracks,
  rooms,
  loading,
  onModalOpen,
  onTrackSessionSelect,
  onRefresh,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isManageTracksModalOpen, setIsManageTracksModalOpen] = useState(false);

  // Filter tracks based on search term
  const filteredTracks = useMemo(() => {
    if (!searchTerm) return tracks;
    return tracks.filter(track =>
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tracks, searchTerm]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Track Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Track Sessions</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {trackSessions.length} sessions
              </Badge>
              <Button
                onClick={() => setIsManageTracksModalOpen(true)}
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Tracks
              </Button>
              <Button
                onClick={() => onModalOpen("add-track-session")}
                size="sm"
                className="bg-[#015B97] hover:bg-[#014f7a]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tracks by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {trackSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No track sessions found for this conference.</p>
              <div className="flex justify-center gap-2 mt-3">
                <Button
                  onClick={() => setIsManageTracksModalOpen(true)}
                  variant="outline"
                >
                  Create Tracks
                </Button>
                <Button
                  onClick={() => onModalOpen("add-track-session")}
                  className="bg-[#015B97] hover:bg-[#014f7a]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTracks.map((track) => {
                const trackFilteredSessions = trackSessions.filter(
                  (session) => session.track_id === track.id
                );

                if (trackFilteredSessions.length === 0) {
                  // Still show the track even if empty, so users know it exists? 
                  // Or maybe we want to hide empty tracks? 
                  // The original code returned null. Let's keep it consistent BUT 
                  // usually users want to see tracks to know they can add sessions to them.
                  // However, the original loop was: return null if length 0.
                  // I will stick to the original behavior for the sessions list, 
                  // since Manage Tracks is now available for empty tracks.
                  return null;
                }

                return (
                  <div key={track.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">{track.name}</h3>
                      <Badge variant="outline">
                        {trackFilteredSessions.length} session
                        {trackFilteredSessions.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {trackFilteredSessions.map((session) => {
                        const relatedRoom = rooms.find(
                          (room) => room.track_id === session.track_id
                        );

                        return (
                          <div
                            key={session.id}
                            className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium">{session.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    #{session.paper_id}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {session.authors}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {session.start_time} - {session.end_time}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${session.mode === "ONLINE"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-green-50 text-green-700"
                                      }`}
                                  >
                                    {session.mode}
                                  </Badge>
                                  {relatedRoom && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-purple-50 text-purple-700"
                                    >
                                      {relatedRoom.identifier || relatedRoom.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      onTrackSessionSelect(session);
                                      onModalOpen("detail-track-session");
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      onTrackSessionSelect(session);
                                      onModalOpen("edit-track-session");
                                    }}
                                  >
                                    Edit Session
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      onTrackSessionSelect(session);
                                      onModalOpen("delete-track-session");
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Session
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ManageTracksModal
        isOpen={isManageTracksModalOpen}
        onClose={() => setIsManageTracksModalOpen(false)}
        tracks={tracks}
        onRefresh={onRefresh}
      />
    </>
  );
}