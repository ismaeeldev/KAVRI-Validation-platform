"use client";

import React, { useState } from "react";
import { transitionSampleStatusAction } from "@/server/actions/sample-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldAlert, ClipboardCheck } from "lucide-react";

const RETURN_CHECKLIST_ITEMS = [
  { key: "Packaging", okField: "returnInspectionPackagingOk", notesField: "returnInspectionPackagingNotes" },
  { key: "Cosmetic", okField: "returnInspectionCosmeticOk", notesField: "returnInspectionCosmeticNotes" },
  { key: "Construction", okField: "returnInspectionConstructionOk", notesField: "returnInspectionConstructionNotes" },
  { key: "Sound", okField: "returnInspectionSoundOk", notesField: "returnInspectionSoundNotes" },
] as const;

interface TriageControlsProps {
  sampleId: string;
  currentStatus: string;
  /** Reports the server action's return value (new status + readiness note) back to the parent
   * client wrapper so the header status badge and the Validation Ready/Blocked banner update
   * immediately, with no server round-trip needed for the UI to reflect the new state. */
  onUpdate?: (updated: { status: string; readinessNote: string | null }) => void;
}

const BUTTON_CLASSES: Record<string, string> = {
  under_review: "bg-kavri-ink text-white hover:bg-neutral-800",
  ready_for_testing: "bg-kavri-signal text-kavri-ink hover:bg-[#c4dd40]",
  blocked: "bg-kavri-danger/10 hover:bg-kavri-danger/15 text-kavri-danger border border-kavri-danger/30",
  rejected: "bg-kavri-danger hover:bg-kavri-danger/90 text-white",
  retired: "bg-kavri-muted hover:bg-kavri-ink-soft text-white",
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

// Plain-language "what does this status mean + what can I do next" copy for the sample
// lifecycle, shown above the triage controls (Part C, Step 05).
const STATUS_EXPLANATIONS: Record<string, string> = {
  received: "Logged in but not yet reviewed. Begin review, or block/reject if there's a visible problem.",
  under_review: "Being inspected. Mark ready for testing once cleared, or block/reject if issues are found.",
  blocked: "Held due to an unresolved issue. Resolve the issue, then return this sample to review.",
  ready_for_testing: "Cleared and eligible for tester dispatch. Block, reject, or retire if that changes.",
  assigned: "Currently out with a tester. It returns to this workflow once marked returned.",
  returned: "Back from a tester. Run the return inspection above, then mark ready for testing, block, or retire.",
  rejected: "Permanently rejected. This is a terminal state - no further transitions are available.",
  retired: "Retired from active use. This is a terminal state - no further transitions are available.",
};

export function SampleTriageControls({ sampleId, currentStatus, onUpdate }: TriageControlsProps) {
  const [readinessNote, setReadinessNote] = useState("");
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [confirmNeeded, setConfirmNeeded] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [returnReceivedBy, setReturnReceivedBy] = useState("");
  const [returnChecks, setReturnChecks] = useState<Record<string, boolean | null>>({
    returnInspectionPackagingOk: null,
    returnInspectionCosmeticOk: null,
    returnInspectionConstructionOk: null,
    returnInspectionSoundOk: null,
  });
  const [returnNotes, setReturnNotes] = useState<Record<string, string>>({
    returnInspectionPackagingNotes: "",
    returnInspectionCosmeticNotes: "",
    returnInspectionConstructionNotes: "",
    returnInspectionSoundNotes: "",
  });

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
    if (status === "returned") {
      // Returning captures its own structured fields inline - no generic confirm banner.
      return;
    }
    if (CRITICAL_STATUSES.has(status)) {
      setConfirmNeeded(true);
    } else {
      triggerTransition(status);
    }
  };

  const triggerTransition = async (status: string) => {
    setIsPending(true);
    try {
      // returnChecks defaults each *Ok field to null (an unset checklist item, since the owner
      // hasn't clicked OK/Issue for it), but the server's zod schema is `.boolean().optional()` -
      // it accepts a real boolean or an absent key, not `null`. Sending `null` through fails
      // validation with a raw Zod error. Convert null -> undefined so an unset item is omitted
      // from the payload entirely, matching the checklist's own "(optional)" labeling.
      const normalizedReturnChecks = Object.fromEntries(
        Object.entries(returnChecks).map(([key, value]) => [key, value === null ? undefined : value])
      );
      const returnDetails =
        status === "returned"
          ? {
              returnReceivedBy,
              ...normalizedReturnChecks,
              ...returnNotes,
            }
          : undefined;
      const result = await transitionSampleStatusAction(sampleId, status, readinessNote, returnDetails);
      toast.success(`Sample transitioned to '${status}'.`);
      // Previously followed by router.refresh() only, which is the standard pattern here (no
      // reload workaround was in play on this file specifically), but per Step 05 it is now
      // additionally reported straight to the parent client wrapper so the header badge and the
      // Validation Ready/Blocked banner update immediately, without waiting on a server re-render.
      onUpdate?.({ status: result.status, readinessNote: result.readinessNote ?? null });
      setReadinessNote("");
      setTargetStatus(null);
      setConfirmNeeded(false);
      setReturnReceivedBy("");
      setReturnChecks({
        returnInspectionPackagingOk: null,
        returnInspectionCosmeticOk: null,
        returnInspectionConstructionOk: null,
        returnInspectionSoundOk: null,
      });
      setReturnNotes({
        returnInspectionPackagingNotes: "",
        returnInspectionCosmeticNotes: "",
        returnInspectionConstructionNotes: "",
        returnInspectionSoundNotes: "",
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update triage status.");
    } finally {
      setIsPending(false);
    }
  };

  const explanation = STATUS_EXPLANATIONS[currentStatus];

  if (allowed.length === 0) {
    return (
      <div className="space-y-3">
        {explanation && (
          <div className="flex items-start gap-1.5 text-[11px] text-kavri-muted font-sans leading-relaxed bg-kavri-surface-subtle border border-kavri-line rounded-lg px-3 py-2">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-kavri-muted" />
            <span>{explanation}</span>
          </div>
        )}
        <div className="p-4 border border-kavri-line rounded-lg bg-kavri-surface-subtle text-center font-sans text-xs text-kavri-muted font-medium">
          This sample has reached a terminal triage state. No further transitions allowed.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-xs">
      {explanation && (
        <div className="flex items-start gap-1.5 text-[11px] text-kavri-muted font-sans leading-relaxed bg-kavri-surface-subtle border border-kavri-line rounded-lg px-3 py-2">
          <ClipboardCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-kavri-muted" />
          <span>{explanation}</span>
        </div>
      )}
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

      {!confirmNeeded && targetStatus === "returned" && (
        <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
            <ClipboardCheck className="h-4 w-4 text-kavri-muted" />
            <span>Return Inspection</span>
          </h4>

          <div className="space-y-1.5">
            <Label htmlFor="returnReceivedBy" className="text-xs font-semibold text-kavri-ink">
              Received By
            </Label>
            <Textarea
              id="returnReceivedBy"
              value={returnReceivedBy}
              onChange={(e) => setReturnReceivedBy(e.target.value)}
              placeholder="Who or what received the returned sample (optional)"
              className="text-xs min-h-[44px] p-2.5 rounded-lg border-kavri-line resize-y"
              disabled={isPending}
            />
          </div>

          <div className="space-y-4">
            {RETURN_CHECKLIST_ITEMS.map(({ key, okField, notesField }) => (
              <div key={key} className="space-y-1.5 pb-3 border-b border-kavri-line/60 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-kavri-ink">{key}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReturnChecks((c) => ({ ...c, [okField]: true }))}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${returnChecks[okField] === true ? "bg-kavri-signal text-kavri-ink border-kavri-signal" : "bg-white border-kavri-line text-kavri-muted"}`}
                      disabled={isPending}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnChecks((c) => ({ ...c, [okField]: false }))}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${returnChecks[okField] === false ? "bg-kavri-danger text-white border-kavri-danger" : "bg-white border-kavri-line text-kavri-muted"}`}
                      disabled={isPending}
                    >
                      Issue
                    </button>
                  </div>
                </div>
                <Textarea
                  value={returnNotes[notesField]}
                  onChange={(e) => setReturnNotes((n) => ({ ...n, [notesField]: e.target.value }))}
                  placeholder={`${key} notes (optional)`}
                  className="text-xs min-h-[50px] p-2.5 rounded-lg border-kavri-line resize-y"
                  disabled={isPending}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-kavri-line">
            <Button
              onClick={() => triggerTransition("returned")}
              disabled={isPending}
              className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-9 px-4 rounded-lg"
            >
              {isPending ? "Saving..." : "Confirm Return"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setTargetStatus(null)}
              className="font-sans font-semibold text-xs h-9 px-4 border-kavri-line bg-white hover:bg-kavri-surface-subtle text-kavri-ink rounded-lg"
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {confirmNeeded && targetStatus && (
        <div className="border border-kavri-danger/25 bg-kavri-danger/5 rounded-xl p-4 space-y-4 font-sans text-xs">
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
              className="bg-kavri-danger hover:bg-kavri-danger/90 text-white font-sans font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all"
            >
              Confirm and Proceed
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmNeeded(false);
                setTargetStatus(null);
              }}
              className="font-sans font-semibold text-xs h-9 px-4 border-kavri-danger/30 bg-white hover:bg-kavri-danger/5 text-kavri-danger rounded-lg transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!confirmNeeded && targetStatus !== "returned" && (
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
