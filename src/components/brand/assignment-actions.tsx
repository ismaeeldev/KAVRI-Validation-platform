"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  activateAssignmentAction,
  revokeAssignmentAction,
  expireAssignmentAction,
  logAssignmentReminderAction,
} from "@/server/actions/assignment-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldAlert, Play, Ban, Clock, BellRing } from "lucide-react";

interface AssignmentActionsProps {
  assignmentId: string;
  currentStatus: string;
  lastReminderAt: string | Date | null;
}

export function AssignmentActions({ assignmentId, currentStatus, lastReminderAt }: AssignmentActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [revocationReason, setRevocationReason] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmExpire, setConfirmExpire] = useState(false);

  const handleActivate = async () => {
    setIsPending(true);
    try {
      await activateAssignmentAction(assignmentId);
      toast.success("Validation assignment invited successfully.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to invite assignment. Verify tester onboard status and sample readiness.");
    } finally {
      setIsPending(false);
    }
  };

  const handleRevoke = async () => {
    if (!revocationReason.trim()) {
      toast.error("Please enter a revocation reason.");
      return;
    }
    setIsPending(true);
    try {
      await revokeAssignmentAction(assignmentId, revocationReason.trim());
      toast.success("Validation assignment revoked.");
      setRevocationReason("");
      setConfirmRevoke(false);
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to revoke assignment.");
    } finally {
      setIsPending(false);
    }
  };

  const handleExpire = async () => {
    setIsPending(true);
    try {
      await expireAssignmentAction(assignmentId);
      toast.success("Assignment marked expired.");
      setConfirmExpire(false);
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to mark assignment expired.");
    } finally {
      setIsPending(false);
    }
  };

  const handleLogReminder = async () => {
    setIsPending(true);
    try {
      await logAssignmentReminderAction(assignmentId);
      toast.success("Reminder logged.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to log reminder.");
    } finally {
      setIsPending(false);
    }
  };

  const canExpire = currentStatus === "draft" || currentStatus === "invited";
  const canRemind = currentStatus === "invited" || currentStatus === "acknowledged";

  const expireButton = canExpire && (
    confirmExpire ? (
      <div className="flex items-center gap-2 p-2 border border-red-200 bg-red-50/50 rounded-lg font-sans text-xs">
        <span className="font-semibold text-red-900 flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
          <span>Mark expired?</span>
        </span>
        <Button
          onClick={handleExpire}
          disabled={isPending}
          className="bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-[10px] h-7 px-2.5 rounded-md transition-all"
        >
          Yes, Mark Expired
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirmExpire(false)}
          className="font-sans font-semibold text-[10px] h-7 px-2.5 border-red-200 bg-white hover:bg-red-50 text-red-800 rounded-md transition-all"
        >
          Cancel
        </Button>
      </div>
    ) : (
      <Button
        onClick={() => setConfirmExpire(true)}
        disabled={isPending}
        variant="outline"
        className="font-sans font-semibold text-xs h-10 px-4 rounded-lg flex items-center gap-1.5"
      >
        <Clock className="h-3.5 w-3.5" />
        <span>Mark Expired</span>
      </Button>
    )
  );

  const reminderButton = canRemind && (
    <Button
      onClick={handleLogReminder}
      disabled={isPending}
      variant="outline"
      title="Logs an in-app reminder record - does not send an email (email reminders are a future phase)."
      className="font-sans font-semibold text-xs h-10 px-4 rounded-lg flex items-center gap-1.5"
    >
      <BellRing className="h-3.5 w-3.5" />
      <span>Log Reminder{lastReminderAt ? ` (last: ${new Date(lastReminderAt).toLocaleDateString()})` : ""}</span>
    </Button>
  );

  if (confirmRevoke) {
    return (
      <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 space-y-4 font-sans text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="revokeReason" className="text-xs font-semibold text-red-900 flex items-center gap-1">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span>Revocation Reason *</span>
          </Label>
          <Textarea
            id="revokeReason"
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
            placeholder="Describe reason for revoking assignment brief..."
            className="text-xs min-h-[70px] bg-white border-red-200 focus-visible:ring-red-600 rounded-lg p-2.5 resize-y"
            disabled={isPending}
          />
        </div>
        <div className="flex gap-2.5">
          <Button
            onClick={handleRevoke}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all"
          >
            Confirm and Revoke
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setConfirmRevoke(false);
              setRevocationReason("");
            }}
            className="font-sans font-semibold text-xs h-9 px-4 border-red-200 bg-white hover:bg-red-50 text-red-800 rounded-lg transition-all"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (currentStatus === "draft") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleActivate}
          disabled={isPending}
          className="bg-kavri-signal text-kavri-ink font-sans font-bold hover:bg-[#c4dd40] text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all flex items-center gap-1.5"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Invite Tester</span>
        </Button>
        {expireButton}
      </div>
    );
  }

  if (currentStatus === "invited" || currentStatus === "acknowledged") {
    return (
      <div className="flex flex-wrap gap-2">
        {reminderButton}
        {expireButton}
        <Button
          onClick={() => setConfirmRevoke(true)}
          disabled={isPending}
          className="bg-[#f9e9e7] hover:bg-[#f2d7d4] text-[#b33a32] border border-[#f5d6d4] font-sans font-semibold text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-[#b33a32] transition-all flex items-center gap-1.5"
        >
          <Ban className="h-3.5 w-3.5" />
          <span>Revoke Assignment</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border border-kavri-line rounded-lg bg-kavri-surface-subtle text-center font-sans text-xs text-kavri-muted font-medium">
      This assignment brief has reached a terminal state.
    </div>
  );
}
