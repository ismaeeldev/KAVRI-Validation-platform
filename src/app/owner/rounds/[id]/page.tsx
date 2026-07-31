import React from "react";
import Link from "next/link";
import { getRoundById, decodeRequiredForms } from "@/server/services/test-round-service";
import { getCloseoutDecisionByScope } from "@/server/services/closeout-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { RoundStatusControls } from "@/components/brand/round-status-controls";
import { ClipboardList, Layers, Users, FileText, Gavel } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoundDetailPage({ params }: PageProps) {
  const { id } = await params;
  const round = await getRoundById(id);
  const requiredForms = decodeRequiredForms(round.requiredForms);
  const closeoutDecision = round.closeoutDecisionId ? await getCloseoutDecisionByScope("round", id) : null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={round.roundName}
        eyebrow={`Round ${round.roundCode}`}
        description={round.purpose}
        backHref="/owner/rounds"
        backLabel="Back to rounds"
        actions={<StatusBadge status={round.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-kavri-muted" />
              <span>Round Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Start Date</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
                  {round.startAt ? new Date(round.startAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">End Date</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
                  {round.endAt ? new Date(round.endAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Required Sessions</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{round.requiredSessionCount}</p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Required Forms</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
                  {[
                    requiredForms.firstImpression && "First Impression",
                    requiredForms.followUp && "Follow-Up",
                    requiredForms.issueReport && "Issue Report",
                  ]
                    .filter(Boolean)
                    .join(", ") || "None"}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Tester Instructions</span>
              <p className="text-kavri-ink mt-1 whitespace-pre-wrap text-[13px]">{round.instructions}</p>
            </div>
            {round.publicSummary && (
              <div className="pt-2">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Public Summary</span>
                <p className="text-kavri-ink mt-1 whitespace-pre-wrap text-[13px]">{round.publicSummary}</p>
              </div>
            )}
          </div>

          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-kavri-muted" />
              <span>Linked Revisions</span>
            </h3>
            {round.roundRevisions.length === 0 ? (
              <p className="text-xs text-kavri-muted font-sans py-2">No revisions linked to this round.</p>
            ) : (
              <div className="divide-y divide-kavri-line/60">
                {round.roundRevisions.map((rr) => (
                  <div key={rr.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 font-sans text-xs">
                    <div>
                      <p className="font-bold text-kavri-ink">{rr.revision.product.internalName}</p>
                      <p className="text-[10px] font-mono text-kavri-muted uppercase tracking-wider mt-0.5">
                        Rev: {rr.revision.revisionCode}
                      </p>
                    </div>
                    <Link href={`/owner/products/${rr.revision.productId}/revisions/${rr.revision.id}`} className="text-kavri-ink hover:underline font-semibold">
                      View Revision
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-kavri-muted" />
                <span>Linked Assignments</span>
              </span>
              <Link href={`/owner/rounds/${round.id}/evaluations`} className="text-kavri-signal hover:underline text-[10px] normal-case font-semibold">
                View Evaluations &rarr;
              </Link>
            </h3>
            {round.assignments.length === 0 ? (
              <p className="text-xs text-kavri-muted font-sans py-2">
                No assignments dispatched to this round yet. Assignment-to-round linkage ships in Step 10.
              </p>
            ) : (
              <div className="divide-y divide-kavri-line/60">
                {round.assignments.map((asg) => (
                  <div key={asg.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 font-sans text-xs">
                    <div>
                      <p className="font-bold text-kavri-ink">
                        {asg.testerProfile.displayName} — Sample <span className="font-mono">{asg.sample.sampleCode}</span>
                      </p>
                    </div>
                    <StatusBadge status={asg.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-kavri-muted" />
              <span>Status Transition</span>
            </h3>
            <RoundStatusControls
              roundId={round.id}
              currentStatus={round.status}
              hasCloseoutDecision={!!round.closeoutDecisionId}
            />
          </div>

          {closeoutDecision && (
            <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-3 font-sans text-xs">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
                <Gavel className="h-4 w-4 text-kavri-muted" />
                <span>Closeout Decision</span>
              </h3>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Decision</span>
                <p className="font-heading text-sm font-black text-kavri-ink uppercase">{closeoutDecision.decision.replace("_", " ")}</p>
              </div>
              {closeoutDecision.evidenceStrength && (
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Evidence Strength</span>
                  <p className="font-semibold text-kavri-ink capitalize">{closeoutDecision.evidenceStrength.replace(/_/g, " ")}</p>
                </div>
              )}
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Summary</span>
                <p className="text-kavri-ink whitespace-pre-wrap">{closeoutDecision.decisionSummary}</p>
              </div>
              {closeoutDecision.limitations && (
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Limitations</span>
                  <p className="text-kavri-ink whitespace-pre-wrap">{closeoutDecision.limitations}</p>
                </div>
              )}
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Next Action</span>
                <p className="text-kavri-ink whitespace-pre-wrap">{closeoutDecision.nextAction}</p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Decided</span>
                <p className="text-kavri-muted">{new Date(closeoutDecision.decisionDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
