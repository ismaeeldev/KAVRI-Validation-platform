"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { acknowledgeAssignmentAction } from "@/server/actions/tester-portal-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TesterPortalActionsProps {
  assignmentId: string;
  status: string;
}

export function TesterPortalActions({ assignmentId, status }: TesterPortalActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleAcknowledge = async () => {
    setIsPending(true);
    try {
      await acknowledgeAssignmentAction(assignmentId);
      toast.success("Assignment acknowledged. Keep validating.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to acknowledge assignment.");
    } finally {
      setIsPending(false);
    }
  };

  if (status !== "invited") {
    return null;
  }

  return (
    <Button
      onClick={handleAcknowledge}
      disabled={isPending}
      className="w-full bg-kavri-signal text-kavri-paper hover:opacity-90 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
      aria-label="Acknowledge testing assignment brief"
    >
      {isPending ? "Acknowledging..." : "Acknowledge Brief"}
    </Button>
  );
}
