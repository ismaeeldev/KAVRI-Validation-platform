import React from "react";
import Link from "next/link";
import { getAssignmentById } from "@/server/services/assignment-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { AssignmentActions } from "@/components/brand/assignment-actions";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { FileText, ShieldAlert, Award, Activity, Clock } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const assignment = await getAssignmentById(id);

  // Query audit logs
  const activityLogs = await db.query.activityLogs.findMany({
    where: and(
      eq(schema.activityLogs.targetType, "testing_assignment"),
      eq(schema.activityLogs.targetId, id)
    ),
    orderBy: [desc(schema.activityLogs.createdAt)],
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Assignment Brief"
        eyebrow="Testing dispatch overview"
        description="Track active validation instructions, tester play logs, and lifecycle dispatch statuses."
        backHref="/owner/assignments"
        backLabel="Back to assignments"
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 bg-kavri-surface border border-kavri-line rounded-md text-kavri-ink font-semibold">
              Due: {new Date(assignment.dueAt).toLocaleDateString()}
            </span>
            <StatusBadge status={assignment.status as "draft" | "active" | "acknowledged" | "revoked" | "expired"} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Brief Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revocation Warning Alert Banner */}
          {assignment.status === "revoked" && (
            <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 flex gap-3 text-xs font-sans">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-red-900 uppercase tracking-wide block">Assignment Revoked</span>
                <p className="text-red-700 leading-relaxed">
                  This validation brief has been revoked by the system administrator, and testing access has been disabled.
                </p>
                {assignment.revocationReason && (
                  <p className="mt-2 p-2.5 bg-white border border-red-100 rounded-lg text-red-800 italic">
                    Reason: {assignment.revocationReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instructions brief */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
              <FileText className="h-4 w-4 text-kavri-muted" />
              <span>Validation Instruction Brief</span>
            </h3>
            <p className="font-sans text-xs text-kavri-ink leading-relaxed whitespace-pre-wrap">
              {assignment.instructions}
            </p>
          </div>

          {/* Lifecycle actions triage controls */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Lifecycle Dispatch Actions
            </h3>
            <AssignmentActions assignmentId={id} currentStatus={assignment.status} />
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-5">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
              <Award className="h-4 w-4 text-kavri-muted" />
              <span>Traceability Bindings</span>
            </h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Assigned Tester</span>
                <p className="font-semibold text-kavri-ink text-[13px]">
                  <Link href={`/owner/testers/${assignment.testerProfileId}`} className="hover:underline hover:text-kavri-muted">
                    {assignment.testerProfile.displayName}
                  </Link>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Linked Sample</span>
                <p className="font-mono text-[11px] font-bold text-kavri-ink">
                  <Link href={`/owner/samples/${assignment.sampleId}`} className="hover:underline hover:text-kavri-muted bg-[#fafaf8] border border-kavri-line px-2 py-0.5 rounded-md inline-block">
                    {assignment.sample.sampleCode}
                  </Link>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Linked Product</span>
                <p className="font-semibold text-kavri-ink text-[13px]">
                  <Link href={`/owner/products/${assignment.productId}`} className="hover:underline hover:text-kavri-muted">
                    {assignment.product.internalName}
                  </Link>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Product Revision</span>
                <p className="font-mono text-[11px] font-bold text-kavri-ink">
                  <Link href={`/owner/products/${assignment.productId}`} className="hover:underline hover:text-kavri-muted bg-[#fafaf8] border border-kavri-line px-2 py-0.5 rounded-md inline-block">
                    {assignment.revision.revisionCode}
                  </Link>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Required Sessions</span>
                <p className="text-kavri-ink font-semibold text-[13px]">
                  {assignment.requiredSessionCount} validation session(s)
                </p>
              </div>
            </div>
          </div>

          {/* Audit logs */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
              <Clock className="h-4 w-4 text-kavri-muted" />
              <span>Audit Logs</span>
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
                      <time className="font-mono text-[9px] text-kavri-muted font-semibold">
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
    </div>
  );
}
