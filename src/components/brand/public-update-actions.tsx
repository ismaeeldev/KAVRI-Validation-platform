"use client";

import React, { useState } from "react";
import { transitionPublicUpdateAction, generatePreviewLinkAction } from "@/server/actions/public-update-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Globe, Trash2, Send, CheckCircle2, Clock, Undo2, Link2 } from "lucide-react";

interface PublicUpdateActionsProps {
  updateId: string;
  currentState: string;
  previewToken: string | null;
}

// Mirrors public-update-service.ts's VALID_TRANSITIONS.
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["internal_review"],
  internal_review: ["approved", "draft"],
  approved: ["scheduled", "published", "draft"],
  scheduled: ["published"],
  published: ["archived"],
  archived: [],
};

const TRANSITION_META: Record<string, { label: string; icon: React.ElementType; className: string; confirm?: string }> = {
  internal_review: {
    label: "Send to Internal Review",
    icon: Send,
    className: "bg-kavri-ink text-white hover:bg-neutral-800",
  },
  approved: {
    label: "Approve",
    icon: CheckCircle2,
    className: "bg-kavri-signal text-kavri-ink hover:bg-[#c4dd40]",
  },
  scheduled: {
    label: "Schedule",
    icon: Clock,
    className: "bg-kavri-ink text-white hover:bg-neutral-800",
  },
  published: {
    label: "Publish Now",
    icon: Globe,
    className: "bg-kavri-signal text-kavri-ink hover:bg-[#c4dd40]",
    confirm: "Publish this update to the live landing page now?",
  },
  archived: {
    label: "Archive",
    icon: Trash2,
    className: "bg-[#f9e9e7] hover:bg-[#f2d7d4] text-[#b33a32] border border-[#f5d6d4]",
    confirm: "Archive this update? It will be removed from the live landing page.",
  },
  draft: {
    label: "Send Back to Draft",
    icon: Undo2,
    className: "border border-kavri-line text-kavri-muted hover:text-kavri-ink hover:bg-kavri-surface-subtle",
  },
};

export function PublicUpdateActions({ updateId, currentState, previewToken }: PublicUpdateActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null);
  const [scheduledForValue, setScheduledForValue] = useState("");

  const allowed = VALID_TRANSITIONS[currentState] || [];

  const runTransition = async (target: string, scheduledFor?: string) => {
    setIsPending(true);
    try {
      await transitionPublicUpdateAction(updateId, target, scheduledFor);
      toast.success(`Update moved to '${target.replace("_", " ")}'.`);
      // router.refresh() alone was found to leave this page's server-rendered header status
      // badge and Publication History log stale after the action succeeds - the same class of
      // Next.js dev-mode Router Cache issue documented and fixed elsewhere (tester/sample detail
      // pages, evaluation reopen). This page has no client wrapper and mixes several
      // server-rendered sections (audit log, landing preview) fed by the same server component,
      // so a full reload is used here as the deliberate interim fix, same as
      // evaluation-reopen-action.tsx.
      window.location.reload();
      return;
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to transition update.");
    } finally {
      setIsPending(false);
    }
  };

  const handleClick = (target: string) => {
    if (target === "scheduled") {
      setSchedulingFor(target);
      return;
    }
    const meta = TRANSITION_META[target];
    if (meta?.confirm) {
      setConfirmTarget(target);
      return;
    }
    void runTransition(target);
  };

  const handleGeneratePreview = async () => {
    setIsPending(true);
    try {
      await generatePreviewLinkAction(updateId);
      toast.success("Preview link generated.");
      // Same stale-display class as the transition actions above - reload for the same reason.
      window.location.reload();
      return;
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to generate preview link.");
    } finally {
      setIsPending(false);
    }
  };

  if (schedulingFor) {
    return (
      <div className="border border-kavri-line bg-kavri-surface-subtle rounded-xl p-4 space-y-3 font-sans text-xs">
        <Label htmlFor="scheduledForInput" className="text-xs font-semibold text-kavri-ink">
          Publish Date &amp; Time
        </Label>
        <input
          id="scheduledForInput"
          type="datetime-local"
          value={scheduledForValue}
          onChange={(e) => setScheduledForValue(e.target.value)}
          className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => runTransition("scheduled", scheduledForValue)}
            disabled={isPending || !scheduledForValue}
            className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans font-bold text-xs h-9 px-4 rounded-lg"
          >
            Confirm Schedule
          </Button>
          <Button
            variant="outline"
            onClick={() => setSchedulingFor(null)}
            className="font-sans font-semibold text-xs h-9 px-4 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (confirmTarget) {
    const meta = TRANSITION_META[confirmTarget];
    return (
      <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 space-y-3 font-sans text-xs">
        <p className="text-red-900 font-semibold">{meta.confirm}</p>
        <div className="flex gap-2">
          <Button
            onClick={() => runTransition(confirmTarget)}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs h-9 px-4 rounded-lg"
          >
            Confirm
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmTarget(null)}
            className="font-sans font-semibold text-xs h-9 px-4 border-red-200 bg-white hover:bg-red-50 text-red-800 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {allowed.length === 0 ? (
          <div className="p-3 border border-kavri-line rounded-lg bg-kavri-surface-subtle text-center font-sans text-xs text-kavri-muted font-medium w-full">
            This update has reached a terminal state.
          </div>
        ) : (
          allowed.map((target) => {
            const meta = TRANSITION_META[target];
            const Icon = meta.icon;
            return (
              <Button
                key={target}
                onClick={() => handleClick(target)}
                disabled={isPending}
                className={`${meta.className} font-sans font-bold text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all flex items-center gap-1.5`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{meta.label}</span>
              </Button>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-kavri-line">
        <Button
          onClick={handleGeneratePreview}
          disabled={isPending}
          variant="outline"
          className="font-sans font-semibold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5"
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>{previewToken ? "Regenerate Preview Link" : "Generate Preview Link"}</span>
        </Button>
        {previewToken && (
          <code className="text-[10px] font-mono text-kavri-muted bg-kavri-surface-subtle px-2 py-1 rounded-md border border-kavri-line truncate max-w-[220px]">
            /preview/updates/{updateId}?token={previewToken}
          </code>
        )}
      </div>
    </div>
  );
}
