import React from "react";
import Link from "next/link";
import { getIssueById, getRelatedIssues } from "@/server/services/issue-service";
import { getAttachments } from "@/server/services/attachment-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge, IssueSeverityBadge } from "@/components/brand/status";
import { IssueResolutionForm } from "@/components/brand/issue-resolution-form";
import { ShieldAlert, FileText, RefreshCw } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const issue = await getIssueById(id);
  const attachments = await getAttachments("issue_report", id);
  const relatedIssues = await getRelatedIssues(issue.sampleId, issue.revisionId, issue.category);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Issue on ${issue.sample.sampleCode}`}
        eyebrow={`${issue.revision.product.internalName} — Rev ${issue.revision.revisionCode}`}
        description={issue.description}
        backHref="/owner/issues"
        backLabel="Back to issues"
        actions={
          <div className="flex items-center gap-2">
            <IssueSeverityBadge severity={issue.severity} />
            <StatusBadge status={issue.resolutionStatus} />
          </div>
        }
      />

      {issue.severity === "stop_use" && (
        <div className="border-2 border-red-600 bg-red-50 rounded-xl p-4 flex gap-3 text-xs font-sans">
          <ShieldAlert className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-red-800 uppercase tracking-wide block">Stop Use — Immediate Attention Required</span>
            <p className="text-red-700 mt-1">This issue has been flagged as severity Stop Use. Testing with this sample should not continue until resolved.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4 font-sans text-xs">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-kavri-muted" />
              <span>Report Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Category</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] capitalize">{issue.category.replace("_", " ")}</p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Type</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] capitalize">{issue.issueType}</p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">First Observed</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{new Date(issue.firstObservedAt).toLocaleDateString()}</p>
              </div>
            </div>
            {issue.stillPlayable && (
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Still Playable</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] capitalize">{issue.stillPlayable}</p>
              </div>
            )}
            <div className="pt-2 border-t border-kavri-line">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Description</span>
              <p className="text-kavri-ink mt-0.5 whitespace-pre-wrap">{issue.description}</p>
            </div>
            {issue.assignment && (
              <div className="pt-2 border-t border-kavri-line">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Reported By Tester</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{issue.assignment.testerProfile.displayName}</p>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="pt-2 border-t border-kavri-line">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block mb-2">Photos</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {attachments.map((a) => (
                    <a key={a.id} href={a.storageUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-kavri-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.storageUrl} alt={a.caption || "Issue photo"} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-kavri-muted" />
              <span>Recurrence — Related Issues</span>
            </h3>
            {relatedIssues.length === 0 ? (
              <p className="text-xs text-kavri-muted font-sans py-2">No related issues found on other samples of this revision or category.</p>
            ) : (
              <div className="divide-y divide-kavri-line/60">
                {relatedIssues.map((related) => (
                  <div key={related.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 font-sans text-xs">
                    <div>
                      <Link href={`/owner/issues/${related.id}`} className="font-bold text-kavri-ink hover:underline">
                        Sample {related.sample.sampleCode}
                      </Link>
                      <p className="text-[10px] text-kavri-muted mt-0.5 capitalize">{related.category.replace("_", " ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <IssueSeverityBadge severity={related.severity} />
                      <StatusBadge status={related.resolutionStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
          <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
            Resolution
          </h3>
          <IssueResolutionForm
            issueId={issue.id}
            immediateAction={issue.immediateAction}
            resolutionStatus={issue.resolutionStatus}
            resolutionNotes={issue.resolutionNotes}
          />
        </div>
      </div>
    </div>
  );
}
