import React from "react";
import { getRoundById } from "@/server/services/test-round-service";
import { getEvidenceSummaryForRound } from "@/server/services/closeout-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { CloseoutForm } from "@/components/brand/closeout-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoundCloseoutPage({ params }: PageProps) {
  const { id } = await params;
  const round = await getRoundById(id);

  if (round.status !== "review") {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-4 select-none">
        <DashboardPageHeader
          title="Round Not Ready to Close"
          eyebrow={`Round ${round.roundCode}`}
          backHref={`/owner/rounds/${id}`}
          backLabel="Back to round"
        />
        <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 text-xs font-sans text-red-700">
          This round is currently &apos;{round.status}&apos;. It must be in &apos;review&apos; status before a closeout decision can be recorded.
        </div>
      </div>
    );
  }

  const summary = await getEvidenceSummaryForRound(id);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Close Round — ${round.roundName}`}
        eyebrow={`Round ${round.roundCode}`}
        description="Record the closeout decision this round supports. Closing a round is final for Sprint 1 — 'gather more evidence' does not automatically reopen it."
        backHref={`/owner/rounds/${id}`}
        backLabel="Back to round"
      />

      <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-3 font-sans text-xs">
        <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
          Evidence Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Evaluations Submitted</span>
            <p className="font-heading text-xl font-black text-kavri-ink">{summary.evaluationsSubmittedCount}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Samples Involved</span>
            <p className="font-heading text-xl font-black text-kavri-ink">{summary.samplesInspectedCount}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Issues Reported</span>
            <p className="font-heading text-xl font-black text-kavri-ink">{summary.issuesCount}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">By Severity</span>
            <p className="text-kavri-ink text-[11px] font-semibold mt-1">
              {Object.entries(summary.issuesBySeverity).length === 0
                ? "—"
                : Object.entries(summary.issuesBySeverity)
                    .map(([sev, count]) => `${sev}: ${count}`)
                    .join(", ")}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
        <CloseoutForm roundId={id} evaluations={summary.evaluations} issues={summary.issues} />
      </div>
    </div>
  );
}
