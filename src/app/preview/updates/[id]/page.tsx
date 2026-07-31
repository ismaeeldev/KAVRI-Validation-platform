import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicUpdateById } from "@/server/services/public-update-service";
import { requireOwner } from "@/lib/permissions";
import { LandingTimeline } from "@/components/brand/landing-timeline";
import type { PublicUpdateDTO } from "@/server/services/public-queries-service";

export const revalidate = 0;

// Never indexed - this route previews content that may not be publicly published yet.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function UpdatePreviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  const update = await getPublicUpdateById(id);

  // Access control: either an authenticated owner session, or a valid signed token matching
  // the record's previewToken - never publicly guessable, and never both required.
  let authorized = false;
  try {
    await requireOwner();
    authorized = true;
  } catch {
    authorized = !!token && !!update.previewToken && token === update.previewToken;
  }

  if (!authorized) {
    // 404, not a descriptive "access denied" page - never confirm to an unauthorized caller
    // that a record with this id exists.
    notFound();
  }

  const dto: PublicUpdateDTO = {
    id: update.id,
    title: update.title,
    summary: update.summary,
    statusLabel: update.statusLabel,
    developmentStage: update.developmentStage,
    publishedAt: update.publishedAt || update.createdAt,
    product: update.product ? { publicAlias: update.product.publicAlias || "Generic Product" } : null,
    revision: update.revision ? { revisionCode: update.revision.revisionCode } : null,
  };

  return (
    <div className="min-h-screen bg-kavri-paper">
      <div className="bg-kavri-ink text-kavri-paper text-center py-2 font-mono text-[10px] uppercase tracking-widest">
        Preview Mode - Status: {update.publishedState.replace("_", " ")} - Not visible to the public until published
      </div>
      <LandingTimeline updates={[dto]} />
      {(update.observation || update.evidenceLevel || update.limitation || update.nextAction) && (
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 pb-16 -mt-8">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-3 font-sans text-xs">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-2.5">
              Evidence &amp; Context
            </h3>
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
    </div>
  );
}
