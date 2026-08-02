"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { transitionRoundStatusAction } from "@/server/actions/test-round-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RoundStatusControlsProps {
  roundId: string;
  currentStatus: string;
  hasCloseoutDecision: boolean;
}

// Mirrors test-round-service.ts's VALID_TRANSITIONS. 'review' -> 'closed' is intentionally
// excluded here - closing now always goes through the closeout decision form (Step 9), never a
// direct status-transition click, since createCloseoutDecision is what performs that transition
// transactionally alongside recording the decision.
const DIRECT_TRANSITIONS: Record<string, string[]> = {
  draft: ["recruiting"],
  recruiting: ["active"],
  active: ["review"],
  review: [],
  closed: [],
};

const BUTTON_LABELS: Record<string, string> = {
  recruiting: "Begin Recruiting",
  active: "Activate Round",
  review: "Move to Review",
};

export function RoundStatusControls({ roundId, currentStatus, hasCloseoutDecision }: RoundStatusControlsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const allowed = DIRECT_TRANSITIONS[currentStatus] || [];

  const triggerTransition = async (status: string) => {
    setIsPending(true);
    try {
      await transitionRoundStatusAction(roundId, status);
      toast.success(`Round transitioned to '${status}'.`);
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to transition round status.");
    } finally {
      setIsPending(false);
    }
  };

  if (currentStatus === "review") {
    return (
      <div className="space-y-3 font-sans text-xs">
        {hasCloseoutDecision ? (
          <p className="text-[11px] text-kavri-muted">A closeout decision has already been recorded for this round.</p>
        ) : (
          <>
            <p className="text-[11px] text-kavri-muted bg-[#fff5d8] border border-[#faecd1] rounded-lg p-3">
              This round is in review. Recording a Closeout Decision is required to close it.
            </p>
            <Link
              href={`/owner/rounds/${roundId}/closeout`}
              className="w-full bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-4 rounded-lg flex items-center justify-center transition-all"
            >
              Record Closeout Decision
            </Link>
          </>
        )}
      </div>
    );
  }

  if (allowed.length === 0) {
    return (
      <div className="p-4 border border-kavri-line rounded-lg bg-kavri-surface-subtle text-center font-sans text-xs text-kavri-muted font-medium">
        This round has reached a terminal state. No further transitions allowed.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans text-xs">
      <div className="flex flex-wrap gap-2.5">
        {allowed.map((status) => (
          <Button
            key={status}
            onClick={() => triggerTransition(status)}
            disabled={isPending}
            className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all"
          >
            {BUTTON_LABELS[status] || status}
          </Button>
        ))}
      </div>
    </div>
  );
}
