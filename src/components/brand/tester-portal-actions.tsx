"use client";

import React, { useState } from "react";
import { acknowledgeAssignmentAction, confirmAssignmentSampleAction } from "@/server/actions/tester-portal-actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface TesterPortalActionsProps {
  assignmentId: string;
  status: string;
  sampleConfirmedAt: string | Date | null;
}

export function TesterPortalActions({ assignmentId, status, sampleConfirmedAt }: TesterPortalActionsProps) {
  const [isPending, setIsPending] = useState(false);

  const handleAcknowledge = async () => {
    setIsPending(true);
    try {
      await acknowledgeAssignmentAction(assignmentId);
      toast.success("Assignment acknowledged. Keep validating.");
      // router.refresh() alone was found to leave this page's server-rendered status badge and
      // "Acknowledge Brief" button stale after the action succeeds (toast confirms, badge
      // doesn't move) - the same class of Next.js dev-mode Router Cache issue documented and
      // fixed elsewhere (tester/sample owner detail pages, evaluation reopen). This page has no
      // client wrapper, so a full reload is used here as the deliberate interim fix, same as
      // evaluation-reopen-action.tsx and the Confirm Sample action below (kept consistent within
      // this file).
      window.location.reload();
      return;
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to acknowledge assignment.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {status === "invited" && (
        <Button
          onClick={handleAcknowledge}
          disabled={isPending}
          className="w-full bg-kavri-signal text-kavri-paper hover:opacity-90 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
          aria-label="Acknowledge testing assignment brief"
        >
          {isPending ? "Acknowledging..." : "Acknowledge Brief"}
        </Button>
      )}

      {/* FUNC-06 fix: tester-facing sample confirmation, shown once the assignment is
         acknowledged. This is an un-gated (encouraged, not required) step - evaluation
         submission is not blocked on it, so as not to disturb the already-working
         acknowledge/session/evaluation flow. */}
      {status !== "invited" && (
        <ConfirmSampleCard assignmentId={assignmentId} sampleConfirmedAt={sampleConfirmedAt} />
      )}
    </>
  );
}

function ConfirmSampleCard({
  assignmentId,
  sampleConfirmedAt,
}: {
  assignmentId: string;
  sampleConfirmedAt: string | Date | null;
}) {
  const [shortCode, setShortCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (sampleConfirmedAt) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
        <CardContent className="py-3 flex items-center justify-between gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-green-800 dark:text-green-400 font-bold">
            Sample Confirmed
          </span>
          <span className="font-mono text-[10px] text-green-700 dark:text-green-500">
            {new Date(sampleConfirmedAt).toLocaleDateString()}
          </span>
        </CardContent>
      </Card>
    );
  }

  const handleConfirm = async () => {
    setErrorMsg(null);
    setIsPending(true);
    try {
      await confirmAssignmentSampleAction(assignmentId, { shortCode });
      toast.success("Sample confirmed. You're testing the correct unit.");
      setShortCode("");
      // Same stale-display class as handleAcknowledge above - reload for the same reason and to
      // stay consistent within this file.
      window.location.reload();
      return;
    } catch (error: unknown) {
      const err = error as Error;
      const message = err.message || "Failed to confirm sample.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-kavri-line bg-kavri-surface dark:bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-xs uppercase tracking-wider">Confirm Sample</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-mono text-[10px] text-kavri-muted uppercase tracking-wider leading-relaxed">
          Before you log a session, confirm you have the correct physical sample. Enter the short
          code printed on your sample&apos;s QR label below.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            placeholder="e.g. AB12CD"
            aria-label="Sample short code"
            className="flex-1 border border-kavri-line rounded-sm px-3 h-11 font-mono text-xs uppercase tracking-widest bg-kavri-paper dark:bg-background text-kavri-ink dark:text-foreground"
          />
          <Button
            onClick={handleConfirm}
            disabled={isPending || shortCode.trim().length === 0}
            className="bg-kavri-ink text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px] sm:w-40"
          >
            {isPending ? "Confirming..." : "Confirm Sample"}
          </Button>
        </div>
        {errorMsg && (
          <p className="font-mono text-[10px] text-destructive uppercase tracking-wider" role="alert">
            {errorMsg}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
