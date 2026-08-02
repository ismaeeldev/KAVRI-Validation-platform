import React from "react";
import Link from "next/link";
import { getRevisionById } from "@/server/services/product-service";
import { getCertificationsByRevision, getDualCertificationStatus } from "@/server/services/certification-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { CertificationPanel } from "@/components/brand/certification-panel";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { FileText, ShieldAlert, Activity } from "lucide-react";
import { deriveHandleLengthCategory } from "@/lib/constants";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string; revId: string }>;
}

export default async function RevisionDetailPage({ params }: PageProps) {
  const { id, revId } = await params;
  const revision = await getRevisionById(revId);
  const certifications = await getCertificationsByRevision(revId);
  const isDual = await getDualCertificationStatus(revId);
  const handleLengthCategory = deriveHandleLengthCategory(
    revision.handleLengthIn !== null ? Number(revision.handleLengthIn) : undefined
  );

  // Fetch linked physical samples for this specific revision
  const physicalSamples = await db.query.physicalSamples.findMany({
    where: eq(schema.physicalSamples.revisionId, revId),
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Revision ${revision.revisionCode}`}
        eyebrow={`Development Stage: ${revision.developmentStage}`}
        description="Logged specifications, manufacturing verification requests, and tester dispatch history."
        backHref={`/owner/products/${id}`}
        backLabel={`Back to Product: ${revision.product.internalName}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/owner/products/${id}/revisions/${revId}/edit`}
              className="border border-kavri-line-strong hover:bg-kavri-surface-subtle text-xs font-sans font-semibold px-4 py-2 h-9 rounded-lg transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-kavri-signal"
            >
              Edit Revision
            </Link>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-kavri-line bg-[#ecefea] text-kavri-muted">
              {revision.publicState}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 bg-kavri-surface border border-kavri-line rounded-md text-kavri-ink">
              {revision.developmentStage}
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Change Details Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Change Details
            </h3>
            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Revision Reason</span>
                <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{revision.revisionReason}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Requested Changes</span>
                  <p className="text-kavri-muted leading-relaxed p-3 bg-[#fafaf8] border border-kavri-line rounded-lg whitespace-pre-wrap">
                    {revision.requestedChanges}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Supplier-Reported Changes</span>
                  <p className="text-kavri-muted leading-relaxed p-3 bg-[#fafaf8] border border-kavri-line rounded-lg whitespace-pre-wrap">
                    {revision.supplierReportedChanges}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Specifications (Targets)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
              {[
                ["Shape", revision.shape],
                ["Performance Profile", revision.performanceProfile],
                ["Firepower Balance", revision.firepowerBalance],
                ["Core Thickness", revision.coreThicknessMm ? `${revision.coreThicknessMm} mm` : null],
                ["Overall Length", revision.overallLengthIn ? `${revision.overallLengthIn} in` : null],
                ["Overall Width", revision.overallWidthIn ? `${revision.overallWidthIn} in` : null],
                ["Handle Length", revision.handleLengthIn ? `${revision.handleLengthIn} in${handleLengthCategory ? ` (${handleLengthCategory})` : ""}` : null],
                ["Grip Circumference", revision.gripCircumferenceIn ? `${revision.gripCircumferenceIn} in` : null],
                ["Static Weight Range", revision.targetStaticWeightMinG || revision.targetStaticWeightMaxG ? `${revision.targetStaticWeightMinG ?? "?"}-${revision.targetStaticWeightMaxG ?? "?"} g` : null],
                ["Swing Weight", revision.targetSwingWeight ? `${revision.targetSwingWeight}${revision.targetSwingWeightMethod ? ` (${revision.targetSwingWeightMethod})` : ""}` : null],
                ["Twist Weight", revision.targetTwistWeight ? `${revision.targetTwistWeight}${revision.targetTwistWeightMethod ? ` (${revision.targetTwistWeightMethod})` : ""}` : null],
                ["Balance Point", revision.targetBalancePointMm ? `${revision.targetBalancePointMm} mm` : null],
                ["Spin Rating", revision.spinRating.replace(/_/g, " ")],
                ["Feel Quadrant", revision.feelQuadrant.replace(/_/g, " ")],
              ].map(([label, value]) => (
                <div key={label} className="space-y-0.5">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">{label}</span>
                  <p className="font-semibold text-kavri-ink capitalize">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-kavri-line pb-3">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-kavri-muted" />
                <span>Internal Notes</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[8px] font-bold bg-[#f9e9e7] text-[#b33a32] border border-[#f5d6d4] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                <ShieldAlert className="h-2.5 w-2.5" />
                <span>Strictly Confidential</span>
              </span>
            </div>
            <p className="font-sans text-xs text-kavri-muted leading-relaxed whitespace-pre-wrap">
              {revision.internalNotes || "No internal observation notes logged."}
            </p>
          </div>

          {/* Public Presentation Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Public Presentation
            </h3>
            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Public Title</span>
                <p className="font-semibold text-kavri-ink mt-0.5">{revision.publicTitle || "No public title defined."}</p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Public Summary</span>
                <p className="text-kavri-muted leading-relaxed mt-0.5 whitespace-pre-wrap">{revision.publicSummary || "No public summary defined."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
        <CertificationPanel revisionId={revId} certifications={certifications} isDual={isDual} />
        <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-6">
          <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-2 border-b border-kavri-line pb-3">
            <Activity className="h-4 w-4 text-kavri-muted" />
            <span>Traceability Context</span>
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Associated Product</span>
              <p className="font-semibold text-kavri-ink">
                <Link href={`/owner/products/${revision.productId}`} className="hover:underline hover:text-kavri-muted">
                  {revision.product.internalName}
                </Link>
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Supplier</span>
              <p className="font-semibold text-kavri-ink">
                <Link href={`/owner/suppliers/${revision.product.supplierId}`} className="hover:underline hover:text-kavri-muted">
                  {revision.product.supplier.name}
                </Link>
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Linked Physical Samples</span>
              {physicalSamples.length === 0 ? (
                <p className="text-kavri-muted italic font-medium">No physical samples registered.</p>
              ) : (
                <div className="divide-y divide-kavri-line/60">
                  {physicalSamples.map((sample) => (
                    <div key={sample.id} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                      <span className="font-mono font-bold text-kavri-ink bg-[#fafaf8] border border-kavri-line px-1.5 py-0.5 rounded-md">
                        {sample.sampleCode}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-kavri-muted">
                        {sample.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
