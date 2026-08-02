"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createCloseoutDecisionSchema } from "@/lib/validation/schemas";
import { createCloseoutDecisionAction } from "@/server/actions/closeout-actions";
import { CLOSEOUT_DECISION, EVIDENCE_STRENGTH } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type CloseoutFormData = zod.infer<typeof createCloseoutDecisionSchema>;

interface EvaluationEvidence {
  id: string;
  evaluationType: string;
  sample: { sampleCode: string };
  assignment: { testerProfile: { displayName: string } };
}

interface IssueEvidence {
  id: string;
  category: string;
  severity: string;
  sample: { sampleCode: string };
}

interface CloseoutFormProps {
  roundId: string;
  evaluations: EvaluationEvidence[];
  issues: IssueEvidence[];
}

export function CloseoutForm({ roundId, evaluations, issues }: CloseoutFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CloseoutFormData>({
    resolver: zodResolver(createCloseoutDecisionSchema) as unknown as Resolver<CloseoutFormData>,
    defaultValues: {
      scope: "round",
      scopeId: roundId,
    },
  });

  const decision = watch("decision");
  const evidenceStrength = watch("evidenceStrength");
  const limitationsRequired =
    decision === "gather_more_evidence" ||
    evidenceStrength === "early_signal" ||
    evidenceStrength === "directional_evidence";

  const toggleEvidence = (key: string) => setSelectedEvidence((prev) => ({ ...prev, [key]: !prev[key] }));

  const onSubmit = async (data: CloseoutFormData) => {
    setIsLoading(true);
    try {
      const evidenceLinks = [
        ...evaluations
          .filter((e) => selectedEvidence[`evaluation:${e.id}`])
          .map((e) => ({ evidenceType: "evaluation", evidenceId: e.id })),
        ...issues
          .filter((i) => selectedEvidence[`issue_report:${i.id}`])
          .map((i) => ({ evidenceType: "issue_report", evidenceId: i.id })),
      ];

      await createCloseoutDecisionAction({ ...data, scope: "round", scopeId: roundId, evidenceLinks });
      toast.success("Round closed with decision recorded.");
      router.push(`/owner/rounds/${roundId}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to record closeout decision.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5 font-sans text-xs">
      <div className="space-y-1.5">
        <Label htmlFor="decision" className="text-xs font-semibold text-kavri-ink">
          Decision <span className="text-red-500">*</span>
        </Label>
        <select
          id="decision"
          {...register("decision")}
          className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
          disabled={isLoading}
        >
          <option value="">Select a decision...</option>
          {Object.entries(CLOSEOUT_DECISION).map(([key, val]) => (
            <option key={val} value={val}>
              {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </option>
          ))}
        </select>
        {errors.decision && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.decision.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="evidenceStrength" className="text-xs font-semibold text-kavri-ink">
          Evidence Strength
        </Label>
        <select
          id="evidenceStrength"
          {...register("evidenceStrength")}
          className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
          disabled={isLoading}
        >
          <option value="">Not specified</option>
          {Object.entries(EVIDENCE_STRENGTH).map(([key, val]) => (
            <option key={val} value={val}>
              {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="decisionSummary" className="text-xs font-semibold text-kavri-ink">
          Decision Summary <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="decisionSummary"
          {...register("decisionSummary")}
          className="text-xs min-h-[90px] p-3 rounded-lg border-kavri-line resize-y"
          disabled={isLoading}
        />
        {errors.decisionSummary && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.decisionSummary.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="limitations" className="text-xs font-semibold text-kavri-ink">
          Limitations {limitationsRequired && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
          id="limitations"
          {...register("limitations")}
          placeholder={limitationsRequired ? "Required — evidence is directional or the decision requests more evidence." : "Optional"}
          className="text-xs min-h-[70px] p-3 rounded-lg border-kavri-line resize-y"
          disabled={isLoading}
        />
        {errors.limitations && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.limitations.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="openQuestions" className="text-xs font-semibold text-kavri-ink">
          Open Questions
        </Label>
        <Textarea id="openQuestions" {...register("openQuestions")} className="text-xs min-h-[70px] p-3 rounded-lg border-kavri-line resize-y" disabled={isLoading} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nextAction" className="text-xs font-semibold text-kavri-ink">
          Next Action <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="nextAction"
          {...register("nextAction")}
          className="text-xs min-h-[70px] p-3 rounded-lg border-kavri-line resize-y"
          disabled={isLoading}
        />
        {errors.nextAction && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.nextAction.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="publicVersion" className="text-xs font-semibold text-kavri-ink">
          Public Version
        </Label>
        <Textarea
          id="publicVersion"
          {...register("publicVersion")}
          placeholder="Public-facing summary, only shown once the linked revision's public state allows it..."
          className="text-xs min-h-[70px] p-3 rounded-lg border-kavri-line resize-y"
          disabled={isLoading}
        />
      </div>

      <div className="border-t border-kavri-line pt-4 space-y-2">
        <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink">Evidence Considered</h4>
        {evaluations.length === 0 && issues.length === 0 ? (
          <p className="text-xs text-kavri-muted">No submitted evaluations or issues to cite yet.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-kavri-line rounded-lg divide-y divide-kavri-line/60">
            {evaluations.map((e) => (
              <label key={e.id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer select-none hover:bg-kavri-surface-subtle">
                <input
                  type="checkbox"
                  checked={!!selectedEvidence[`evaluation:${e.id}`]}
                  onChange={() => toggleEvidence(`evaluation:${e.id}`)}
                  className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal"
                  disabled={isLoading}
                />
                <span className="text-xs font-medium text-kavri-ink">
                  {e.evaluationType === "first_impression" ? "First Impression" : "Follow-Up"} — {e.assignment.testerProfile.displayName} —{" "}
                  <span className="font-mono text-kavri-muted">{e.sample.sampleCode}</span>
                </span>
              </label>
            ))}
            {issues.map((i) => (
              <label key={i.id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer select-none hover:bg-kavri-surface-subtle">
                <input
                  type="checkbox"
                  checked={!!selectedEvidence[`issue_report:${i.id}`]}
                  onChange={() => toggleEvidence(`issue_report:${i.id}`)}
                  className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal"
                  disabled={isLoading}
                />
                <span className="text-xs font-medium text-kavri-ink capitalize">
                  Issue: {i.category.replace("_", " ")} ({i.severity}) — <span className="font-mono text-kavri-muted">{i.sample.sampleCode}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/owner/rounds/${roundId}`)}
          className="font-sans text-xs font-semibold h-10 px-4 rounded-lg"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-5 rounded-lg flex items-center justify-center gap-1.5"
        >
          {isLoading ? "Submitting..." : "Submit Decision & Close Round"}
        </Button>
      </div>
    </form>
  );
}
