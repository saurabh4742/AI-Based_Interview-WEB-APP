"use client";

import { useEffect, useState } from "react";
import { useInterviewStore } from "@/store/interviewStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function SessionManager() {
  const { interviewStatus, resetCurrentSession } = useInterviewStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check session status only on initial client-side mount
    if (interviewStatus === 'in_progress') {
      setShowModal(true);
    }
  }, [interviewStatus]);

  if (!showModal) {
    return null;
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            You have an interview in progress. Would you like to resume?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            resetCurrentSession();
            setShowModal(false);
          }}>
            Start Over
          </Button>
          <Button onClick={() => setShowModal(false)}>Resume</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}