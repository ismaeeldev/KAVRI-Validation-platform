"use client";

import React, { useState } from "react";
import { reopenEvaluationAction } from "@/server/actions/evaluation-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Unlock } from "lucide-react";

interface EvaluationReopenActionProps {
  evaluationId: string;
  roundId: string;
  status: string;
  roundClosed: boolean;
}

// Decision 1 (owner-facing trigger). Submitted evaluations are locked; this is the only way to
// unlock one, and it is deliberately behind an explicit confirm step with an optional reason that
// is written to the activity log.
export function EvaluationReopenAction({
  evaluationId,
  roundId,
  status,
  roundClosed,
}: EvaluationReopenActionProps) {
  const [isPending, setIsPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");

  if (status === "draft") {
    return (
      <p className="font-mono text-[11px] text-kavri-muted">
        Not submitted yet - nothing to reopen.
      </p>
    );
  }

  if (status === "reopened") {
    return (
      <p className="font-mono text-[11px] text-kavri-muted leading-relaxed">
        Reopened for edits. The tester can now submit a correction; the original submission
        timestamp is preserved.
      </p>
    );
  }

  if (roundClosed) {
    return (
      <p className="font-mono text-[11px] text-kavri-muted leading-relaxed">
        This round is closed, so the evaluation can no longer be reopened.
      </p>
    );
  }

  const handleReopen = async () => {
    setIsPending(true);
    try {
      await reopenEvaluationAction(evaluationId, roundId, reason.trim() || undefined);
      toast.success("Evaluation reopened. The original submission timestamp is unchanged.");
      // router.refresh() alone was found (live testing) to leave this page's server-rendered
      // fields (status badge, Reopened At) stale after the action succeeds - the same class of
      // Next.js dev-mode Router Cache issue documented on the tester/sample detail pages. A full
      // reload is the same deliberate interim fix used there; a proper client-state wrapper for
      // this page is a Step 05-style follow-up, not repeated ad hoc here.
      window.location.reload();
      return;
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to reopen this evaluation.");
    } finally {
      setIsPending(false);
    }
  };

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(true)}
        className="font-mono text-xs uppercase tracking-wider h-10 min-h-[40px]"
      >
        <Unlock className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
        Reopen for edits
      </Button>
    );
  }

  return (
    <div className="space-y-3 border border-kavri-line rounded-lg p-4 bg-kavri-surface-subtle">
      <p className="font-mono text-[11px] text-kavri-ink leading-relaxed">
        Reopening unlocks this evaluation so the tester can correct it. The original submission
        timestamp is preserved; a separate &ldquo;reopened&rdquo; timestamp records this action.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="reopen-reason" className="font-mono text-[9px] uppercase tracking-widest text-kavri-muted">
          Reason (optional, logged)
        </Label>
        <Textarea
          id="reopen-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-xs min-h-[60px] resize-y border-kavri-line"
          placeholder="e.g. Tester reported the wrong play time."
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleReopen}
          disabled={isPending}
          className="bg-kavri-ink text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider h-10 min-h-[40px]"
        >
          {isPending ? "Reopening..." : "Confirm reopen"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="font-mono text-xs uppercase tracking-wider h-10 min-h-[40px]"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
