import React from "react";
import { getEvaluationDetailForOwner } from "@/server/services/evaluation-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { EVALUATION_SCORE_FIELDS } from "@/lib/constants";
import { EvaluationReopenAction } from "@/components/brand/evaluation-reopen-action";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string; evalId: string }>;
}

export default async function EvaluationDetailPage({ params }: PageProps) {
  const { id, evalId } = await params;
  const evaluation = await getEvaluationDetailForOwner(evalId);

  const filledScores = EVALUATION_SCORE_FIELDS.filter(
    ({ key }) => (evaluation as unknown as Record<string, unknown>)[key] !== null
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`${evaluation.evaluationType === "first_impression" ? "First Impression" : "Follow-Up"} Evaluation`}
        eyebrow={`${evaluation.assignment.testerProfile.displayName} — ${evaluation.revision.product.internalName} ${evaluation.revision.revisionCode}`}
        description={`Sample ${evaluation.sample.sampleCode}`}
        backHref={`/owner/rounds/${id}/evaluations`}
        backLabel="Back to evaluations"
        actions={<StatusBadge status={evaluation.status} />}
      />

      <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4 font-sans text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Play Time</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
              {evaluation.playTimeMinutes ? `${evaluation.playTimeMinutes} min` : "—"}
            </p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Conditions</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{evaluation.conditions || "—"}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Comparison Reference</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] capitalize">
              {evaluation.comparisonReference?.replace("_", " ") || "—"}
            </p>
          </div>
        </div>

        <div className="border-t border-kavri-line pt-4">
          <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block mb-2">Scores</span>
          {filledScores.length === 0 ? (
            <p className="text-kavri-muted">No scores recorded.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filledScores.map(({ key, label }) => (
                <div key={key} className="border border-kavri-line rounded-lg p-2.5 text-center">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">{label}</span>
                  <span className="font-heading text-lg font-black text-kavri-ink">
                    {(evaluation as unknown as Record<string, unknown>)[key] as number}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-kavri-line pt-4">
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Strengths</span>
            <p className="text-kavri-ink mt-0.5 whitespace-pre-wrap">{evaluation.strengths || "—"}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Weaknesses</span>
            <p className="text-kavri-ink mt-0.5 whitespace-pre-wrap">{evaluation.weaknesses || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-kavri-line pt-4">
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Preference</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] capitalize">{evaluation.preference?.replace("_", " ") || "—"}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Confidence</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] capitalize">{evaluation.confidence || "—"}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Issue Triggered</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{evaluation.issueTriggered ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Decision 1: submittedAt is the immutable original; reopenedAt/updatedAt track edits. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-kavri-line pt-4">
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Last Saved</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{new Date(evaluation.lastSavedAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">
              Originally Submitted
            </span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
              {evaluation.submittedAt ? new Date(evaluation.submittedAt).toLocaleString() : "Not yet submitted"}
            </p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Reopened At</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
              {evaluation.reopenedAt ? new Date(evaluation.reopenedAt).toLocaleString() : "Never reopened"}
            </p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Last Updated</span>
            <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
              {new Date(evaluation.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-2">
          <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">
            Owner Controls
          </span>
          <EvaluationReopenAction
            evaluationId={evaluation.id}
            roundId={id}
            status={evaluation.status}
            roundClosed={evaluation.round?.status === "closed"}
          />
        </div>
      </div>
    </div>
  );
}
