import React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { getSampleById, getCurrentHolder } from "@/server/services/sample-service";
import { getAttachments } from "@/server/services/attachment-service";
import { getIssuesBySample } from "@/server/services/issue-service";
import { IssueSeverityBadge } from "@/components/brand/status";
import { SampleDetailClient } from "@/components/brand/sample-detail-client";
import { SampleMeasurementsForm } from "@/components/brand/sample-measurements-form";
import { SampleTargetActualVariance } from "@/components/brand/sample-target-actual-variance";
import { SampleInspectionForm } from "@/components/brand/sample-inspection-form";
import { SampleQrLabel } from "@/components/brand/sample-qr-label";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { FileText, Clock, Box } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SampleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sample = await getSampleById(id);
  const currentHolder = await getCurrentHolder(id);
  const attachments = await getAttachments("sample", id);
  const issues = await getIssuesBySample(id);
  const qrDataUrl = sample.qrValue ? await QRCode.toDataURL(sample.qrValue, { width: 240 }) : null;

  // Fetch activity logs for this sample to display history lifecycle timeline
  const activityLogs = await db.query.activityLogs.findMany({
    where: and(
      eq(schema.activityLogs.targetType, "physical_sample"),
      eq(schema.activityLogs.targetId, id)
    ),
    orderBy: [desc(schema.activityLogs.createdAt)],
  });

  return (
    <SampleDetailClient
      sampleId={id}
      sampleCode={sample.sampleCode}
      currentHolder={currentHolder}
      initialStatus={sample.status}
      initialReadinessNote={sample.readinessNote}
      afterTriage={
        <>
          <SampleTargetActualVariance target={sample.revision} actual={sample} />
          <SampleMeasurementsForm sampleId={id} measurements={sample} />
          <SampleInspectionForm sampleId={id} inspection={sample} attachments={attachments} />
        </>
      }
      sidebar={
        <>
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

              {sample.returnedAt && (
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Returned Date</span>
                  <p className="text-kavri-muted font-medium">{new Date(sample.returnedAt).toLocaleDateString()}</p>
                </div>
              )}

              {sample.returnReceivedBy && (
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Return Received By</span>
                  <p className="text-kavri-ink font-semibold text-[13px]">{sample.returnReceivedBy}</p>
                </div>
              )}

              <div className="space-y-1 pt-3 border-t border-kavri-line">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Assignment</span>
                <p className="text-kavri-muted italic">No assignment yet.</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Tester</span>
                <p className="text-kavri-muted italic">Not assigned.</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Evaluations</span>
                <p className="text-kavri-muted italic">None recorded yet.</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Issues</span>
                {issues.length === 0 ? (
                  <p className="text-kavri-muted italic">None reported.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {issues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/owner/issues/${issue.id}`}
                        className="flex items-center justify-between gap-2 hover:bg-kavri-surface-subtle rounded-md px-1.5 py-1 -mx-1.5"
                      >
                        <span className="text-kavri-ink font-semibold capitalize truncate">{issue.category.replace("_", " ")}</span>
                        <IssueSeverityBadge severity={issue.severity} />
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href={`/owner/samples/${id}/issues/new`}
                  className="inline-block text-[10px] font-mono uppercase text-kavri-signal-ink hover:underline pt-1"
                >
                  + Log an issue
                </Link>
              </div>
            </div>
          </div>

          <SampleQrLabel sampleCode={sample.sampleCode} shortCode={sample.shortCode} qrDataUrl={qrDataUrl} />

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
        </>
      }
    >
      {/* Observations and notes - static, rendered between banner and triage controls */}
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
    </SampleDetailClient>
  );
}
