"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogTitle,
     DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { useTrackActions } from "@/hooks/useTrack";
import type { BackendTrack } from "@/types";

interface ManageTracksModalProps {
     isOpen: boolean;
     onClose: () => void;
     tracks: BackendTrack[];
     onRefresh: () => void;
}

export default function ManageTracksModal({
     isOpen,
     onClose,
     tracks,
     onRefresh,
}: ManageTracksModalProps) {
     const [searchTerm, setSearchTerm] = useState("");
     const [loading, setLoading] = useState(false);

     const { deleteTrack } = useTrackActions();

     const handleDeleteTrack = async (track: BackendTrack) => {
          if (!confirm(`Are you sure you want to delete the track "${track.name}"?\nThis may affect existing sessions assigned to this track.`)) {
               return;
          }

          setLoading(true);
          try {
               await deleteTrack(track.id);
               toast.success("Track deleted successfully");
               onRefresh();
          } catch (error: any) {
               toast.error(error.message || "Failed to delete track");
          } finally {
               setLoading(false);
          }
     };

     const filteredTracks = tracks.filter(track =>
          track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          track.description?.toLowerCase().includes(searchTerm.toLowerCase())
     );

     return (
          <Dialog open={isOpen} onOpenChange={onClose}>
               <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                         <DialogTitle className="flex items-center justify-between">
                              <span>Manage Tracks</span>
                              {/* Header Actions */}
                              <div className="flex items-center gap-2">
                                   <div className="relative w-64">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                             placeholder="Search tracks..."
                                             value={searchTerm}
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                             className="pl-8 h-8"
                                        />
                                   </div>
                              </div>
                         </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                         <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm border border-blue-100">
                              <h5 className="font-semibold flex items-center mb-1">
                                   ℹ️ How to create a Track?
                              </h5>
                              <p>
                                   Tracks are automatically created when you add a <strong>Parallel Room</strong> in the Room Management section.
                                   Creating a Parallel Room generates a corresponding Track (Category) for sessions.
                              </p>
                         </div>

                         {/* Tracks List */}
                         <div className="space-y-2">
                              {filteredTracks.length === 0 ? (
                                   <div className="text-center py-6 text-gray-500 border border-dashed rounded-lg">
                                        {searchTerm ? "No tracks match your search." : "No tracks found."}
                                   </div>
                              ) : (
                                   filteredTracks.map((track) => (
                                        <div
                                             key={track.id}
                                             className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded hover:bg-gray-50 group"
                                        >
                                             <div className="flex-1">
                                                  <div className="font-medium text-sm text-gray-900">
                                                       {track.name}
                                                  </div>
                                                  {track.description && (
                                                       <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                            {track.description}
                                                       </div>
                                                  )}
                                             </div>

                                             <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                  <Button
                                                       onClick={() => handleDeleteTrack(track)}
                                                       size="sm"
                                                       variant="ghost"
                                                       className="text-red-600 h-8 w-8 p-0"
                                                       title="Delete Track"
                                                       disabled={loading}
                                                  >
                                                       <Trash2 className="w-4 h-4" />
                                                  </Button>
                                             </div>
                                        </div>
                                   ))
                              )}
                         </div>
                    </div>

                    <DialogFooter>
                         <Button onClick={onClose} variant="secondary">Close</Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}
