import React from "react";
import Link from "next/link";
import { getProductById, getProductRevisions } from "@/server/services/product-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { ProductArchiveButton } from "@/components/brand/product-actions";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { FileText, Rss, Clock, ShieldAlert, CheckCircle, HelpCircle, Layers, Plus } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  const revisions = await getProductRevisions(id);

  // Fetch linked physical samples
  const physicalSamples = await db.query.physicalSamples.findMany({
    where: eq(schema.physicalSamples.productId, id),
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={product.internalName}
        eyebrow={`Product ID: ${product.id.slice(0, 8)}`}
        description="Manage configuration matrices, metadata fields, and development timelines."
        backHref="/owner/products"
        backLabel="Back to products"
        actions={
          <div className="flex items-center gap-2">
            {product.status !== "archived" && (
              <>
                <Link
                  href={`/owner/products/${id}/edit`}
                  className="border border-kavri-line-strong hover:bg-kavri-surface-subtle text-xs font-sans font-semibold px-4 py-2 h-9 rounded-lg transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-kavri-signal"
                >
                  Edit Product
                </Link>
                <ProductArchiveButton productId={id} />
              </>
            )}
            <StatusBadge status={product.status as "active" | "archived"} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Specifications Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confidential Internal Fields */}
            <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-kavri-line pb-3">
                <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-kavri-muted" />
                  <span>Internal Context</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold bg-[#f9e9e7] text-[#b33a32] border border-[#f5d6d4] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  <ShieldAlert className="h-2.5 w-2.5" />
                  <span>Confidential</span>
                </span>
              </div>
              <div className="space-y-3 text-xs font-sans">
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Internal Name</span>
                  <p className="font-semibold text-kavri-ink mt-0.5">{product.internalName}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Internal Description</span>
                  <p className="text-kavri-muted leading-relaxed mt-0.5 whitespace-pre-wrap">{product.descriptionInternal}</p>
                </div>
              </div>
            </div>

            {/* Public-facing Metadata fields */}
            <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-kavri-line pb-3">
                <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5">
                  <Rss className="h-4 w-4 text-kavri-muted" />
                  <span>Public Metadata</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  <CheckCircle className="h-2.5 w-2.5" />
                  <span>Published</span>
                </span>
              </div>
              <div className="space-y-3 text-xs font-sans">
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Public Alias</span>
                  <p className="font-semibold text-kavri-ink mt-0.5">{product.publicAlias || "No Alias Setup"}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Public Summary</span>
                  <p className="text-kavri-muted leading-relaxed mt-0.5 whitespace-pre-wrap">{product.publicSummary || "No public summary defined."}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Exposed Status</span>
                  <p className="font-semibold text-kavri-ink mt-0.5">{product.isPublic ? "Public Mode Activated" : "Private Feed Mode"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revision Timeline Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-kavri-line pb-3">
              <div>
                <h3 className="font-heading text-sm font-black uppercase tracking-wider text-kavri-ink">
                  Revision Timeline
                </h3>
                <p className="text-[11px] text-kavri-muted font-sans mt-0.5">
                  Engineering specifications and version history logs.
                </p>
              </div>
              {product.status !== "archived" && (
                <Link
                  href={`/owner/products/${id}/revisions/new`}
                  className="bg-kavri-ink text-white hover:bg-neutral-800 text-[10px] font-sans font-bold px-3 py-1.5 rounded-md transition-all flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-kavri-signal"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Revision</span>
                </Link>
              )}
            </div>

            {revisions.length === 0 ? (
              <p className="text-xs text-kavri-muted font-sans py-4">No revisions logged for this product.</p>
            ) : (
              <div className="relative pl-6 border-l border-kavri-line space-y-6">
                {revisions.map((rev) => (
                  <div key={rev.id} className="relative space-y-1.5">
                    {/* Circle Node */}
                    <span className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-kavri-line-strong border border-kavri-surface" />

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/owner/products/${id}/revisions/${rev.id}`}
                            className="font-mono text-xs font-bold text-kavri-ink hover:underline hover:text-kavri-muted"
                          >
                            Revision {rev.revisionCode}
                          </Link>
                          <span className="font-mono text-[9px] uppercase tracking-wider bg-kavri-surface-subtle px-1.5 py-0.5 rounded-md border border-kavri-line font-bold">
                            {rev.developmentStage}
                          </span>
                          {rev.isPublic && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-1.5 py-0.5 rounded-md uppercase">
                              Public
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-kavri-ink font-semibold mt-1">
                          Reason: <span className="font-normal text-kavri-muted">{rev.revisionReason}</span>
                        </p>
                      </div>
                      <time className="font-mono text-[10px] text-kavri-muted whitespace-nowrap">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </time>
                    </div>

                    <div className="font-sans text-[11px] text-kavri-muted bg-[#fafaf8] p-3 rounded-lg border border-kavri-line space-y-1">
                      <p><span className="font-semibold text-kavri-ink">Requested Changes:</span> {rev.requestedChanges}</p>
                      <p><span className="font-semibold text-kavri-ink">Supplier Reported:</span> {rev.supplierReportedChanges}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Supplier Info */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Traceability Context
            </h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Supplier Profile</span>
                <Link 
                  href={`/owner/suppliers/${product.supplierId}`} 
                  className="font-semibold text-kavri-ink text-[13px] hover:underline hover:text-kavri-muted flex items-center gap-1"
                >
                  <span>{product.supplier.name}</span>
                  <span className="text-[10px] font-mono font-bold text-kavri-muted uppercase">({product.supplier.code})</span>
                </Link>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Physical Samples</span>
                {physicalSamples.length === 0 ? (
                  <p className="text-kavri-muted italic">No physical samples registered.</p>
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
