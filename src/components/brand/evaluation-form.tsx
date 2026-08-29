"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { evaluationDraftSchema } from "@/lib/validation/schemas";
import {
  saveDraftEvaluationAction,
  submitEvaluationAction,
  editSubmittedEvaluationAction,
} from "@/server/actions/evaluation-actions";
import {
  EVALUATION_SCORE_FIELDS,
  COMPARISON_REFERENCE,
  EVALUATION_PREFERENCE,
  EVALUATION_CONFIDENCE,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type EvalFormData = zod.infer<typeof evaluationDraftSchema>;

interface EvaluationRecord {
  id: string;
  status: string;
  // Decision 1: submittedAt is the immutable original submission stamp; reopenedAt is set only
  // when an owner has unlocked the evaluation for a correction.
  submittedAt: string | Date | null;
  reopenedAt: string | Date | null;
  updatedAt: string | Date;
  playTimeMinutes: number | null;
  conditions: string | null;
  comparisonReference: string | null;
  strengths: string | null;
  weaknesses: string | null;
  preference: string | null;
  confidence: string | null;
  issueTriggered: boolean;
  scoreControl: number | null;
  scoreStability: number | null;
  scoreFeel: number | null;
  scoreComfort: number | null;
  scoreConsistency: number | null;
  scoreOverallPreference: number | null;
  scorePower: number | null;
  scoreSpin: number | null;
  scoreForgiveness: number | null;
  scoreManeuverability: number | null;
  scoreSound: number | null;
  scoreFatigue: number | null;
  scoreBuildQuality: number | null;
}

interface EvaluationFormProps {
  assignmentId: string;
  evaluationType: "first_impression" | "follow_up";
  initialEvaluation: EvaluationRecord | null;
  roundClosed: boolean;
}

export function EvaluationForm({ assignmentId, evaluationType, initialEvaluation, roundClosed }: EvaluationFormProps) {
  const router = useRouter();
  const [evaluationId, setEvaluationId] = useState<string | null>(initialEvaluation?.id ?? null);
  const [status, setStatus] = useState<string>(initialEvaluation?.status ?? "draft");
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bug #4 fix: tracks the currently-running autosave request (if any), so Submit can await it
  // instead of racing it - covers both "a debounced autosave hasn't fired yet" and "an autosave
  // request is already in flight" (e.g. triggered by the visibilitychange/pagehide flush).
  // Resolves to the saved evaluation id (or null on failure) so the caller can use it directly
  // rather than reading the `evaluationId` state variable, which would still be stale in the
  // same synchronous closure right after the setEvaluationId() call inside autosave().
  const autosaveInFlight = useRef<Promise<string | null> | null>(null);

  const defaultValues: Partial<EvalFormData> = {
    evaluationType,
    playTimeMinutes: initialEvaluation?.playTimeMinutes ?? undefined,
    conditions: initialEvaluation?.conditions ?? "",
    comparisonReference: initialEvaluation?.comparisonReference ?? "",
    strengths: initialEvaluation?.strengths ?? "",
    weaknesses: initialEvaluation?.weaknesses ?? "",
    preference: initialEvaluation?.preference ?? "",
    confidence: initialEvaluation?.confidence ?? "",
    issueTriggered: initialEvaluation?.issueTriggered ?? false,
    ...Object.fromEntries(
      EVALUATION_SCORE_FIELDS.map(({ key }) => [key, initialEvaluation?.[key] ?? undefined])
    ),
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm<EvalFormData>({
    resolver: zodResolver(evaluationDraftSchema) as unknown as Resolver<EvalFormData>,
    defaultValues,
  });

  // Decision 1: an evaluation locks the instant it is submitted. The tester can no longer unlock
  // it themselves - only an owner reopening it (status becomes 'reopened') makes it editable again.
  // A reopened evaluation drops straight into correction mode; there is no separate opt-in step.
  const reopenedForEdits = status === "reopened";
  const inEditMode = editMode || reopenedForEdits;
  const locked = status !== "draft" && !inEditMode;

  const formatStamp = (value: string | Date | null | undefined) =>
    value
      ? new Date(value).toLocaleString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const submittedLabel = formatStamp(initialEvaluation?.submittedAt);
  const reopenedLabel = formatStamp(initialEvaluation?.reopenedAt);
  const lastUpdatedLabel = formatStamp(initialEvaluation?.updatedAt);

  // Shown on both the locked and the reopened views so the tester always sees that the original
  // submission date is intact and separate from the most recent edit.
  const timestampSummary = submittedLabel ? (
    <p className="text-kavri-muted leading-relaxed break-words">
      Originally submitted {submittedLabel}
      {reopenedLabel ? ` — reopened for edits ${reopenedLabel}` : ""}
      {reopenedLabel && lastUpdatedLabel ? ` — last updated ${lastUpdatedLabel}` : ""}.
    </p>
  ) : null;

  const watched = watch();
  const watchedKey = JSON.stringify(watched);

  // Server-side autosave (Workstream E draft persistence): every change is debounced 1.5s and
  // written through createOrUpdateDraftEvaluation, so a draft survives closing the browser, losing
  // the connection, or switching devices - it is never held in React state alone.
  // Only true drafts autosave: a reopened evaluation is saved explicitly via "Save Correction",
  // because the draft upsert path would otherwise insert a second, duplicate draft row.
  useEffect(() => {
    if (status !== "draft" || !isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void autosave();
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedKey, status, isDirty]);

  // Belt-and-braces for the "closed the tab mid-answer" case: flush any pending debounce when the
  // page is hidden or unloaded, so at most the last keystroke - not the whole draft - can be lost.
  useEffect(() => {
    if (status !== "draft") return;
    const flush = () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
        void autosave();
      }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const autosave = async (): Promise<string | null> => {
    setSaveState("saving");
    const run = (async (): Promise<string | null> => {
      try {
        const values = watch();
        const result = await saveDraftEvaluationAction(assignmentId, { ...values, evaluationType });
        setEvaluationId(result.id);
        setSaveState("saved");
        return result.id;
      } catch {
        setSaveState("idle");
        return null;
      }
    })();
    autosaveInFlight.current = run;
    const id = await run;
    autosaveInFlight.current = null;
    return id;
  };

  // Bug #4 fix: Submit previously checked `evaluationId` at click time without waiting for any
  // in-flight/pending debounced autosave, so clicking Submit within the ~1.5s debounce window
  // could race the very first autosave and produce a false "draft hasn't saved yet" error even
  // though the fields were filled in. Now: flush a still-pending debounce synchronously (skip
  // the wait, save now), or await one already in flight, before ever checking for an id - and
  // return that id directly rather than relying on the (still-stale-in-this-closure)
  // `evaluationId` state variable.
  const flushPendingAutosave = async (): Promise<string | null> => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      return await autosave();
    }
    if (autosaveInFlight.current) {
      return await autosaveInFlight.current;
    }
    return evaluationId;
  };

  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true);
    try {
      const id = await flushPendingAutosave();
      if (!id) {
        toast.error("Add at least one field before submitting - the draft hasn't saved yet.");
        return;
      }
      await submitEvaluationAction(id, assignmentId);
      toast.success(`${evaluationType === "first_impression" ? "First Impression" : "Follow-Up"} evaluation submitted.`);
      setStatus("submitted");
      const triggeredIssue = watch("issueTriggered");
      router.refresh();
      if (triggeredIssue) {
        router.push(`/tester/assignments/${assignmentId}/issues/new?evaluationId=${id}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to submit evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCorrectionSubmit = async (data: EvalFormData) => {
    if (!evaluationId) return;
    setIsSubmitting(true);
    try {
      await editSubmittedEvaluationAction(evaluationId, assignmentId, data);
      toast.success("Correction saved.");
      setEditMode(false);
      setStatus("updated");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to save correction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledCount = EVALUATION_SCORE_FIELDS.filter(({ key }) => {
    const v = watched[key];
    return v !== undefined && v !== null && (v as unknown as string) !== "";
  }).length;

  if (locked) {
    return (
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3 border border-kavri-line rounded-sm bg-kavri-surface-subtle flex flex-wrap items-center gap-2">
          <span className="text-kavri-muted uppercase tracking-wider text-[10px]">
            Status: <span className="text-kavri-ink font-bold">{status}</span>
          </span>
        </div>
        {timestampSummary}

        {/* Completion + return instructions, shown once the Follow-Up is in. */}
        {evaluationType === "follow_up" && (
          <div className="p-3 border border-kavri-signal/40 bg-kavri-signal/5 rounded-sm space-y-2 leading-relaxed">
            <p className="uppercase tracking-wider text-[10px] font-bold text-kavri-ink dark:text-foreground">
              You&apos;re done — thank you
            </p>
            <p className="text-kavri-muted">
              Your Follow-Up is in, which completes this assignment. Nothing further is needed from
              you in the app.
            </p>
            <p className="text-kavri-muted">
              Please keep the sample safe and return it using the instructions in your assignment
              email. If anything happens to it before then, use &ldquo;Report an Issue&rdquo; on the
              assignment page.
            </p>
          </div>
        )}

        {/* Decision 1: submission is final. There is no tester-side self-unlock; recovery is
            explained in plain language without exposing any internals. */}
        <p className="text-kavri-muted leading-relaxed">
          This evaluation has been submitted and is now locked, so your answers stay exactly as you
          sent them.{" "}
          {roundClosed
            ? "This round has closed, so it can no longer be changed."
            : "If something needs correcting, reply to your KAVRI assignment email and ask us to reopen it — you'll be able to edit it here once we do."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={editMode ? handleSubmit(onCorrectionSubmit) : (e) => e.preventDefault()}
      className="space-y-5 font-mono text-xs"
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-kavri-muted">
        <span>{filledCount} / {EVALUATION_SCORE_FIELDS.length} scored</span>
        <span aria-live="polite">
          {saveState === "saving" ? "Saving draft..." : saveState === "saved" ? "Draft saved" : " "}
        </span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="playTimeMinutes" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Play Time (minutes)
        </Label>
        <input
          id="playTimeMinutes"
          type="number"
          inputMode="numeric"
          {...register("playTimeMinutes", { valueAsNumber: true })}
          className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="conditions" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Conditions
        </Label>
        <input
          id="conditions"
          {...register("conditions")}
          className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comparisonReference" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Comparison Reference
        </Label>
        <select
          id="comparisonReference"
          {...register("comparisonReference")}
          className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
        >
          <option value="">Not specified</option>
          {Object.entries(COMPARISON_REFERENCE).map(([key, val]) => (
            <option key={val} value={val}>
              {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3 border-t border-kavri-line pt-4">
        <h4 className="text-[10px] uppercase tracking-wider text-kavri-muted font-bold">Scores (1-5, optional)</h4>
        <div className="grid grid-cols-2 gap-3">
          {EVALUATION_SCORE_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key} className="text-[9px] uppercase tracking-wider text-kavri-muted">
                {label}
              </Label>
              <select
                id={key}
                {...register(key)}
                className="w-full text-xs h-11 min-h-[44px] px-2 rounded-sm border border-kavri-line bg-background"
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="strengths" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Strengths
        </Label>
        <Textarea id="strengths" {...register("strengths")} className="text-xs min-h-[70px] p-3 rounded-sm border-kavri-line resize-y" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="weaknesses" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Weaknesses
        </Label>
        <Textarea id="weaknesses" {...register("weaknesses")} className="text-xs min-h-[70px] p-3 rounded-sm border-kavri-line resize-y" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="preference" className="text-[10px] uppercase tracking-wider text-kavri-muted">
            Preference
          </Label>
          <select
            id="preference"
            {...register("preference")}
            className="w-full text-xs h-11 min-h-[44px] px-2 rounded-sm border border-kavri-line bg-background"
          >
            <option value="">Not specified</option>
            {Object.entries(EVALUATION_PREFERENCE).map(([key, val]) => (
              <option key={val} value={val}>
                {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confidence" className="text-[10px] uppercase tracking-wider text-kavri-muted">
            Confidence
          </Label>
          <select
            id="confidence"
            {...register("confidence")}
            className="w-full text-xs h-11 min-h-[44px] px-2 rounded-sm border border-kavri-line bg-background"
          >
            <option value="">Not specified</option>
            {Object.entries(EVALUATION_CONFIDENCE).map(([key, val]) => (
              <option key={val} value={val}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none py-2">
        <input type="checkbox" {...register("issueTriggered")} className="h-4 w-4 rounded border-kavri-line" />
        <span className="text-[11px] text-kavri-ink">This session revealed an issue worth reporting</span>
      </label>

      <div className="sticky bottom-0 bg-kavri-paper dark:bg-background pt-3 pb-1 flex gap-2">
        {editMode ? (
          <>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-kavri-ink text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
            >
              {isSubmitting ? "Saving..." : "Save Correction"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditMode(false)}
              className="font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={handleSubmitEvaluation}
            disabled={isSubmitting}
            className="w-full bg-kavri-signal text-kavri-paper hover:opacity-90 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
          >
            {isSubmitting ? "Submitting..." : `Submit ${evaluationType === "first_impression" ? "First Impression" : "Follow-Up"}`}
          </Button>
        )}
      </div>
    </form>
  );
}
