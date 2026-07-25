"use client";

import React from "react";
import { MotionProvider } from "@/components/brand/motion-provider";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import { PageHeader, SectionHeader } from "@/components/brand/headers";
import { MetadataLabel, TechnicalDivider } from "@/components/brand/metadata";
import { StatusBadge, RevisionStamp } from "@/components/brand/status";
import { MetricCell, ProgressRail } from "@/components/brand/indicators";
import { LoadingState } from "@/components/states/loading";
import { EmptyState } from "@/components/states/empty";
import { ErrorState } from "@/components/states/error-state";
import { AccessDenied } from "@/components/states/access-denied";
import { Unavailable } from "@/components/states/unavailable";
import {
  PublicHeader,
  PublicFooter,
  OwnerSidebar,
  TesterHeader,
} from "@/components/brand/layout-shells";

export default function DevGalleryPage() {
  return (
    <MotionProvider>
      <div className="min-h-screen bg-kavri-paper text-kavri-ink dark:bg-[#16181b] dark:text-[#f5f6f4] p-4 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Gallery Header */}
          <div className="flex items-center justify-between border-b border-kavri-line-strong pb-4">
            <div className="flex items-center gap-3">
              <KAVRIWordmark />
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-kavri-ink text-kavri-paper rounded-sm">
                DEV GALLERY
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-kavri-muted">
              v1.0.0
            </span>
          </div>

          {/* Section 1: Typography & Branding */}
          <section className="space-y-4">
            <SectionHeader title="Typography & Branding" subtitle="Fonts: Archivo & Inter" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-kavri-surface dark:bg-card p-6 border border-kavri-line rounded-sm">
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted">Wordmark Placeholder</p>
                <KAVRIWordmark className="text-2xl" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted">Heading and Subtitle</p>
                <PageHeader
                  title="Products Overview"
                  description="Traceability matrix of currently active validation cycles."
                />
              </div>
            </div>
          </section>

          {/* Section 2: Technical Metadata & Dividers */}
          <section className="space-y-4">
            <SectionHeader title="Telemetry & Dividers" subtitle="Metrics & Calibration" />
            <div className="space-y-6 bg-kavri-surface dark:bg-card p-6 border border-kavri-line rounded-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetadataLabel label="SUPPLIER CODE" value="SUPP-T1-XP" />
                <MetadataLabel label="VALIDATION GATE" value="04 / FIELD TESTING" />
                <MetadataLabel label="BATCH ID" value="BATCH-2026-07A" />
                <MetadataLabel label="RECEIVING STAMP" value="2026-07-22" />
              </div>
              <TechnicalDivider />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCell label="PRODUCT REVISIONS" value={14} />
                <MetricCell label="SAMPLES RECEIVED" value={42} />
                <MetricCell label="ACTIVE TESTERS" value={9} />
              </div>
            </div>
          </section>

          {/* Section 3: Statuses & Stamps */}
          <section className="space-y-4">
            <SectionHeader title="Statuses & Revision Stamps" subtitle="Semantic Color Mapping" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-kavri-surface dark:bg-card p-6 border border-kavri-line rounded-sm">
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted">Status Badge Variants</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="draft" />
                  <StatusBadge status="active" />
                  <StatusBadge status="acknowledged" />
                  <StatusBadge status="received" />
                  <StatusBadge status="under_review" />
                  <StatusBadge status="ready_for_testing" />
                  <StatusBadge status="blocked" />
                  <StatusBadge status="rejected" />
                  <StatusBadge status="revoked" />
                  <StatusBadge status="expired" />
                  <StatusBadge status="published" />
                  <StatusBadge status="archived" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted">Revision Stamp</p>
                <div className="flex items-center gap-4">
                  <RevisionStamp code="REV-A" />
                  <RevisionStamp code="REV-B2" />
                  <RevisionStamp code="REV-E5" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Progress Rail */}
          <section className="space-y-4">
            <SectionHeader title="Progress Rail" subtitle="Development Stage Gate" />
            <div className="bg-kavri-surface dark:bg-card p-6 border border-kavri-line rounded-sm space-y-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Stage: Concept</p>
                <ProgressRail currentStage="concept" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Stage: Field Testing</p>
                <ProgressRail currentStage="field_testing" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Stage: Launch</p>
                <ProgressRail currentStage="launch" />
              </div>
            </div>
          </section>

          {/* Section 5: State fallbacks */}
          <section className="space-y-4">
            <SectionHeader title="System State Views" subtitle="Fallback Screens" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-kavri-line rounded-sm bg-kavri-surface dark:bg-card p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Loading State</p>
                <LoadingState message="Connecting to secure calibration stream..." />
              </div>
              <div className="border border-kavri-line rounded-sm bg-kavri-surface dark:bg-card p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Empty State</p>
                <EmptyState
                  title="No Suppliers Configured"
                  description="Add your first manufacturing partner to start registering product specifications."
                  actionLabel="Add Supplier"
                  onAction={() => alert("Action triggered")}
                />
              </div>
              <div className="border border-kavri-line rounded-sm bg-kavri-surface dark:bg-card p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Error State</p>
                <ErrorState
                  title="Calibration Stream Disconnected"
                  description="The database region experienced a timeout connection. Retrying is recommended."
                  onRetry={() => alert("Retry triggered")}
                />
              </div>
              <div className="border border-kavri-line rounded-sm bg-kavri-surface dark:bg-card p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Access Denied</p>
                <AccessDenied />
              </div>
              <div className="border border-kavri-line rounded-sm bg-kavri-surface dark:bg-card p-4 md:col-span-2">
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Account/System Unavailable</p>
                <Unavailable />
              </div>
            </div>
          </section>

          {/* Section 6: Layout Shell Renders */}
          <section className="space-y-4">
            <SectionHeader title="Layout Shell Demos" subtitle="Navigation bars & footers" />
            <div className="space-y-6 bg-kavri-surface dark:bg-card p-6 border border-kavri-line rounded-sm">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Public Header</p>
                <PublicHeader />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Owner Sidebar (Mock Layout)</p>
                <div className="border border-kavri-line h-[300px] overflow-hidden relative">
                  <OwnerSidebar />
                </div>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Tester Header</p>
                <TesterHeader />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kavri-muted mb-2">Public Footer</p>
                <PublicFooter />
              </div>
            </div>
          </section>
        </div>
      </div>
    </MotionProvider>
  );
}
