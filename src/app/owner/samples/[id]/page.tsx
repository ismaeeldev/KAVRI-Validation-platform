import React from "react";
import Link from "next/link";
import { getSampleById } from "@/server/services/sample-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { SampleTriageControls } from "@/components/brand/sample-triage-controls";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { ShieldAlert, CheckCircle, FileText, Activity, Clock, Box } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SampleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sample = await getSampleById(id);

  // Fetch activity logs for this sample to display history lifecycle timeline
  const activityLogs = await db.query.activityLogs.findMany({
    where: and(
      eq(schema.activityLogs.targetType, "physical_sample"),
      eq(schema.activityLogs.targetId, id)
    ),
    orderBy: [desc(schema.activityLogs.createdAt)],
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Sample ${sample.sampleCode}`}
        eyebrow="Physical Prototype Triage"
        description="Verify incoming batches, record material observations, and triage readiness."
        backHref="/owner/samples"
        backLabel="Back to samples"
        actions={<StatusBadge status={sample.status as "received" | "under_review" | "ready_for_testing" | "blocked" | "rejected"} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Readiness State Alert Banner */}
          {sample.status !== "ready_for_testing" ? (
            <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 flex gap-3 text-xs font-sans">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-red-900 uppercase tracking-wide block">Validation Blocked</span>
                <p className="text-red-700 leading-relaxed">
                  This batch is currently marked as <strong className="uppercase">[{sample.status.replace("_", " ")}]</strong> and cannot be assigned to active validation sessions.
                </p>
                {sample.readinessNote ? (
                  <p className="mt-2 p-2.5 bg-white border border-red-100 rounded-lg text-red-800 italic">
                    Reason: {sample.readinessNote}
                  </p>
                ) : (
                  <p className="mt-1 italic text-red-600">No transition notes recorded.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-kavri-line bg-kavri-signal-soft/40 rounded-xl p-4 flex gap-3 text-xs font-sans">
              <CheckCircle className="h-5 w-5 text-kavri-ink shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-kavri-ink uppercase tracking-wide block">Validation Ready</span>
                <p className="text-kavri-muted font-medium">
                  This prototype batch is confirmed and cleared for tester validation dispatches.
                </p>
                {sample.readinessNote && (
                  <p className="mt-2 p-2.5 bg-white border border-kavri-line rounded-lg text-kavri-ink italic">
                    Note: {sample.readinessNote}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Observations and notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-3">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
                <FileText className="h-4 w-4 text-kavri-muted" />
                <span>Confidential Observations</span>
              </h3>
              <p className="font-sans text-xs text-kavri-muted leading-relaxed whitespace-pre-wrap">
                {sample.receivingObservations}
              </p>
            </div>

            <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-3">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
                <FileText className="h-4 w-4 text-kavri-muted" />
                <span>Identifying Notes</span>
              </h3>
              <p className="font-sans text-xs text-kavri-muted leading-relaxed whitespace-pre-wrap">
                {sample.identifyingNotes || "No identifying markers recorded."}
              </p>
            </div>
          </div>

          {/* Triage Controls Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Centralized Triage Workflow
            </h3>
            <SampleTriageControls sampleId={id} currentStatus={sample.status} />
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-5">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
              <Box className="h-4 w-4 text-kavri-muted" />
              <span>Traceability Summary</span>
            </h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Sample Code</span>
                <p className="font-mono text-[11px] font-bold text-kavri-ink bg-[#fafaf8] border border-kavri-line px-2 py-0.5 rounded-md inline-block">
                  {sample.sampleCode}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Supplier</span>
                <p className="font-semibold text-kavri-ink text-[13px]">
                  <Link href={`/owner/suppliers/${sample.supplierId}`} className="hover:underline hover:text-kavri-muted">
                    {sample.supplier.name}
                  </Link>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Product</span>
                <p className="font-semibold text-kavri-ink text-[13px]">
                  <Link href={`/owner/products/${sample.productId}`} className="hover:underline hover:text-kavri-muted">
                    {sample.product.internalName}
                  </Link>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Product Revision</span>
                <p className="font-mono text-[11px] font-bold text-kavri-ink">
                  <Link href={`/owner/products/${sample.productId}`} className="hover:underline hover:text-kavri-muted bg-[#fafaf8] border border-kavri-line px-2 py-0.5 rounded-md inline-block">
                    {sample.revision.revisionCode}
                  </Link>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Received Date</span>
                <p className="text-kavri-muted font-medium">{new Date(sample.receivedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Lifecycle history */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
              <Clock className="h-4 w-4 text-kavri-muted" />
              <span>Lifecycle History</span>
            </h3>

            {activityLogs.length === 0 ? (
              <p className="text-xs text-kavri-muted font-sans">No transitions recorded.</p>
            ) : (
              <div className="relative pl-5 border-l border-kavri-line space-y-4">
                {activityLogs.map((log) => {
                  const meta = log.metadataJson ? JSON.parse(log.metadataJson) : null;
                  return (
                    <div key={log.id} className="relative space-y-1 font-sans text-xs">
                      {/* Node */}
                      <span className="absolute -left-[25px] top-1 w-1.5 h-1.5 rounded-full bg-kavri-line-strong border border-kavri-surface" />
                      
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-kavri-ink">
                          {log.action.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                        </span>
                        <time className="font-mono text-[9px] text-kavri-muted">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      
                      {meta && meta.to && (
                        <p className="text-kavri-muted text-[10px] font-medium">
                          Transition: <span className="uppercase">[{meta.from.replace("_", " ")}]</span> &rarr;{" "}
                          <span className="uppercase font-bold text-kavri-ink">[{meta.to.replace("_", " ")}]</span>
                        </p>
                      )}
                      
                      {meta && meta.readinessNote && (
                        <p className="italic text-kavri-muted text-[10px] mt-0.5">
                          Reason: {meta.readinessNote}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
