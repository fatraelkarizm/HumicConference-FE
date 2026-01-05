
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogTitle,
     DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type { BackendConferenceSchedule } from "@/types";

interface Props {
     isOpen: boolean;
     onClose: () => void;
     conference: BackendConferenceSchedule;
     updateConferenceLink: (id: string, link: string) => Promise<void>;
     onRefresh?: () => void;
}

export default function ManageLinksModal({
     isOpen,
     onClose,
     conference,
     updateConferenceLink,
}: Props) {
     const [loading, setLoading] = useState(false);
     const [onlineLink, setOnlineLink] = useState(conference.online_presentation || "");

     const handleSave = async () => {
          setLoading(true);
          try {
               await updateConferenceLink(conference.id, onlineLink);
               toast.success("Zoom link updated successfully!");
               onClose();
          } catch (error: any) {
               toast.error(error.message || "Failed to update link");
          } finally {
               setLoading(false);
          }
     };

     return (
          <Dialog open={isOpen} onOpenChange={onClose}>
               <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                         <DialogTitle>Manage Conference Links</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                         <div className="space-y-2">
                              <Label htmlFor="online-link">Online Presentation / Zoom Link</Label>
                              <Input
                                   id="online-link"
                                   placeholder="e.g. https://zoom.us/j/123456789"
                                   value={onlineLink}
                                   onChange={(e) => setOnlineLink(e.target.value)}
                              />
                              <p className="text-xs text-gray-500">
                                   This link will be displayed on the conference schedule for attendees to join main sessions and parallel sessions.
                              </p>
                         </div>
                    </div>

                    <DialogFooter>
                         <Button variant="outline" onClick={onClose} disabled={loading}>
                              Cancel
                         </Button>
                         <Button onClick={handleSave} disabled={loading} className="bg-[#015B97]">
                              {loading ? "Saving..." : "Save Changes"}
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}
