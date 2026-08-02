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

  const locked = status !== "draft" && !editMode;
  const watched = watch();
  const watchedKey = JSON.stringify(watched);

  useEffect(() => {
    if (locked || !isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void autosave();
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedKey, locked, isDirty]);

  const autosave = async () => {
    setSaveState("saving");
    try {
      const values = watch();
      const result = await saveDraftEvaluationAction(assignmentId, { ...values, evaluationType });
      setEvaluationId(result.id);
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!evaluationId) {
      toast.error("Add at least one field before submitting - the draft hasn't saved yet.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitEvaluationAction(evaluationId, assignmentId);
      toast.success(`${evaluationType === "first_impression" ? "First Impression" : "Follow-Up"} evaluation submitted.`);
      setStatus("submitted");
      const triggeredIssue = watch("issueTriggered");
      router.refresh();
      if (triggeredIssue) {
        router.push(`/tester/assignments/${assignmentId}/issues/new?evaluationId=${evaluationId}`);
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
        <div className="p-3 border border-kavri-line rounded-sm bg-kavri-surface-subtle flex items-center justify-between">
          <span className="text-kavri-muted uppercase tracking-wider text-[10px]">
            Status: <span className="text-kavri-ink font-bold">{status}</span>
          </span>
          {!roundClosed && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="text-kavri-signal hover:underline text-[10px] uppercase tracking-wider"
            >
              Request Correction
            </button>
          )}
        </div>
        <p className="text-kavri-muted leading-relaxed">
          This evaluation has been submitted and is locked.{" "}
          {roundClosed
            ? "The round has closed, so it can no longer be corrected."
            : "Use Request Correction above to make a controlled edit."}
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
