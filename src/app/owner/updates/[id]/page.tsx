import React from "react";
import Link from "next/link";
import { getPublicUpdateById } from "@/server/services/public-update-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { PublicUpdateActions } from "@/components/brand/public-update-actions";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { Clock, Eye, Edit2, FileText } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicUpdateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const update = await getPublicUpdateById(id);

  // Query audit logs
  const activityLogs = await db.query.activityLogs.findMany({
    where: and(
      eq(schema.activityLogs.targetType, "public_update"),
      eq(schema.activityLogs.targetId, id)
    ),
    orderBy: [desc(schema.activityLogs.createdAt)],
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={update.title}
        eyebrow={`Sort Order: ${update.sortOrder}`}
        description="Preview and configure development timeline log details displayed publicly."
        backHref="/owner/updates"
        backLabel="Back to updates"
        actions={<StatusBadge status={update.publishedState} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Landing Page Preview Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
              <Eye className="h-4 w-4 text-kavri-muted" />
              <span>Landing Page Timeline Preview</span>
            </h3>
            
            <div className="border border-dashed border-kavri-line rounded-lg p-5 bg-[#fafaf8] space-y-3 font-sans text-xs">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider bg-kavri-surface-subtle px-1.5 py-0.5 border border-kavri-line rounded-md text-kavri-muted font-bold">
                  {update.developmentStage || "No Stage Linked"}
                </span>
                <span className="font-mono text-[9px] font-black uppercase tracking-wider bg-[#e8f7e8] text-[#2a6b2a] border border-[#b8e0b8] px-2 py-0.5 rounded-sm">
                  {update.statusLabel}
                </span>
              </div>
              <h4 className="font-heading text-[15px] font-extrabold text-kavri-ink leading-tight">
                {update.title}
              </h4>
              <p className="text-kavri-muted leading-relaxed font-sans text-xs">
                {update.summary}
              </p>
              {update.product && (
                <div className="font-mono text-[9px] text-kavri-muted border-t border-kavri-line/40 pt-2 flex flex-wrap gap-3">
                  <span>Linked Product: <strong className="text-kavri-ink font-semibold">{update.product.publicAlias}</strong></span>
                  {update.revision && (
                    <span>Revision: <strong className="text-kavri-ink font-semibold">{update.revision.revisionCode}</strong></span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Evidence & Context */}
          {(update.observation || update.evidenceLevel || update.limitation || update.nextAction) && (
            <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
                <FileText className="h-4 w-4 text-kavri-muted" />
                <span>Evidence &amp; Context</span>
              </h3>
              <div className="space-y-3 font-sans text-xs">
                {update.evidenceLevel && (
                  <div>
                    <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Evidence Level</span>
                    <p className="font-semibold text-kavri-ink capitalize">{update.evidenceLevel.replace(/_/g, " ")}</p>
                  </div>
                )}
                {update.observation && (
                  <div>
                    <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Observation</span>
                    <p className="text-kavri-ink whitespace-pre-wrap">{update.observation}</p>
                  </div>
                )}
                {update.limitation && (
                  <div>
                    <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Limitation</span>
                    <p className="text-kavri-ink whitespace-pre-wrap">{update.limitation}</p>
                  </div>
                )}
                {update.nextAction && (
                  <div>
                    <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Next Action</span>
                    <p className="text-kavri-ink whitespace-pre-wrap">{update.nextAction}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action options */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Publication Controls
            </h3>
            <div className="space-y-4 pt-1">
              <PublicUpdateActions updateId={id} currentState={update.publishedState} previewToken={update.previewToken} />
              <Link
                href={`/owner/updates/${id}/edit`}
                className="inline-flex border border-kavri-line-strong hover:bg-kavri-surface-subtle text-xs font-sans font-semibold px-4 py-2 h-9 rounded-lg transition-colors items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-kavri-signal"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Details</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar logs */}
        <div className="lg:col-span-4 border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
          <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
            <Clock className="h-4 w-4 text-kavri-muted" />
            <span>Publication History</span>
          </h3>

          {activityLogs.length === 0 ? (
            <p className="text-xs text-kavri-muted font-sans">No audit events recorded.</p>
          ) : (
            <div className="relative pl-5 border-l border-kavri-line space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="relative space-y-1 font-sans text-xs">
                  {/* Node */}
                  <span className="absolute -left-[24px] top-1 w-1.5 h-1.5 rounded-full bg-kavri-line-strong border border-kavri-surface" />
                  
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-kavri-ink">
                      {log.action.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </span>
                    <time className="font-mono text-[9px] text-kavri-muted">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  
                  {log.metadataJson && (
                    <p className="text-kavri-muted text-[10px] mt-0.5 bg-[#fafaf8] border border-kavri-line p-1.5 rounded-md font-mono overflow-x-auto max-w-full">
                      {log.metadataJson}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
