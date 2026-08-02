"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { transitionSampleStatusAction } from "@/server/actions/sample-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldAlert, Play, CheckCircle2, Ban } from "lucide-react";

interface TriageControlsProps {
  sampleId: string;
  currentStatus: string;
}

const BUTTON_CLASSES: Record<string, string> = {
  under_review: "bg-kavri-ink text-white hover:bg-neutral-800",
  ready_for_testing: "bg-kavri-signal text-kavri-ink hover:bg-[#c4dd40]",
  blocked: "bg-[#f9e9e7] hover:bg-[#f2d7d4] text-[#b33a32] border border-[#f5d6d4]",
  rejected: "bg-red-600 hover:bg-red-700 text-white",
  retired: "bg-gray-600 hover:bg-gray-700 text-white",
  returned: "bg-kavri-ink text-white hover:bg-neutral-800",
};

const BUTTON_LABELS: Record<string, string> = {
  under_review: "Begin Review",
  ready_for_testing: "Mark Ready for Testing",
  blocked: "Block Sample",
  rejected: "Reject Sample",
  retired: "Retire Sample",
  returned: "Mark Returned",
};

const CRITICAL_STATUSES = new Set(["blocked", "rejected", "retired"]);

export function SampleTriageControls({ sampleId, currentStatus }: TriageControlsProps) {
  const router = useRouter();
  const [readinessNote, setReadinessNote] = useState("");
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [confirmNeeded, setConfirmNeeded] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Owner-triggerable transitions map - mirrors sample-service.ts's
  // OWNER_TRIGGERABLE_TRANSITIONS ('assigned' excluded; it is system-triggered only, wired in
  // Step 10 when an assignment activates against this sample).
  const allowedMap: Record<string, string[]> = {
    received: ["under_review", "blocked", "rejected"],
    under_review: ["ready_for_testing", "blocked", "rejected"],
    blocked: ["under_review"],
    ready_for_testing: ["blocked", "rejected", "retired"],
    rejected: [],
    assigned: ["returned"],
    returned: ["ready_for_testing", "retired", "blocked"],
    retired: [],
  };

  const allowed = allowedMap[currentStatus] || [];

  const handleTransitionClick = (status: string) => {
    if (!readinessNote.trim()) {
      toast.error("Please provide a transition/readiness note detailing the reason.");
      return;
    }
    setTargetStatus(status);
    if (CRITICAL_STATUSES.has(status)) {
      setConfirmNeeded(true);
    } else {
      triggerTransition(status);
    }
  };

  const triggerTransition = async (status: string) => {
    setIsPending(true);
    try {
      await transitionSampleStatusAction(sampleId, status, readinessNote);
      toast.success(`Sample transitioned to '${status}'.`);
      setReadinessNote("");
      setTargetStatus(null);
      setConfirmNeeded(false);
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update triage status.");
    } finally {
      setIsPending(false);
    }
  };

  if (allowed.length === 0) {
    return (
      <div className="p-4 border border-kavri-line rounded-lg bg-kavri-surface-subtle text-center font-sans text-xs text-kavri-muted font-medium">
        This sample has reached a terminal triage state. No further transitions allowed.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="space-y-1.5">
        <Label htmlFor="readinessNote" className="text-xs font-semibold text-kavri-ink">
          Transition / Readiness Reason <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="readinessNote"
          value={readinessNote}
          onChange={(e) => setReadinessNote(e.target.value)}
          placeholder="Describe triage observations, package defects, validation goals, or reasons for blocking/rejecting..."
          className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
          disabled={isPending || confirmNeeded}
        />
      </div>

      {confirmNeeded && targetStatus && (
        <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 space-y-4 font-sans text-xs">
          <div className="flex items-center gap-2 border-b border-red-200 pb-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h4 className="font-heading text-xs font-black uppercase tracking-wider text-red-900">
              Confirm Critical Transition
            </h4>
          </div>
          <p className="text-red-700 font-medium">
            Rejecting or blocking a physical sample is a critical lifecycle action. Please confirm you want to proceed.
          </p>
          <div className="flex gap-2.5">
            <Button
              onClick={() => triggerTransition(targetStatus)}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all"
            >
              Confirm and Proceed
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmNeeded(false);
                setTargetStatus(null);
              }}
              className="font-sans font-semibold text-xs h-9 px-4 border-red-200 bg-white hover:bg-red-50 text-red-800 rounded-lg transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!confirmNeeded && (
        <div className="flex flex-wrap gap-2.5">
          {allowed.map((status) => (
            <Button
              key={status}
              onClick={() => handleTransitionClick(status)}
              disabled={isPending}
              className={`${BUTTON_CLASSES[status]} font-sans text-xs font-bold h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all`}
            >
              {BUTTON_LABELS[status] || status}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
