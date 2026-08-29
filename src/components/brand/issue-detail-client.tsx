"use client";

import React, { useState } from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge, IssueSeverityBadge } from "@/components/brand/status";
import { IssueResolutionForm } from "@/components/brand/issue-resolution-form";

interface IssueDetailClientProps {
  issueId: string;
  sampleCode: string;
  eyebrow: string;
  description: string;
  severity: string;
  backHref: string;
  backLabel: string;
  immediateAction: string | null;
  initialResolutionStatus: string;
  resolutionNotes: string | null;
  /** Stop-use banner, rendered above the grid - unaffected by the resolution mutation. */
  banner: React.ReactNode;
  /** Static content rendered in the left (8-col) column - report details, related issues -
   * unaffected by the resolution mutation, kept server-rendered. */
  children: React.ReactNode;
}

/**
 * Client wrapper for the issue detail page's mutation-sensitive fields: the header status
 * badge, paired with the resolution form that mutates it. Mirrors the same onUpdate pattern
 * already established on the sample and tester detail pages (Step 05): the server action's own
 * return value drives useState directly here, so the header badge updates immediately after a
 * save, with no server round-trip (router.refresh()) required for the UI to reflect the new
 * state.
 */
export function IssueDetailClient({
  issueId,
  sampleCode,
  eyebrow,
  description,
  severity,
  backHref,
  backLabel,
  immediateAction,
  initialResolutionStatus,
  resolutionNotes,
  banner,
  children,
}: IssueDetailClientProps) {
  const [resolutionStatus, setResolutionStatus] = useState(initialResolutionStatus);

  const handleUpdate = (updated: { resolutionStatus: string }) => {
    setResolutionStatus(updated.resolutionStatus);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Issue on ${sampleCode}`}
        eyebrow={eyebrow}
        description={description}
        backHref={backHref}
        backLabel={backLabel}
        actions={
          <div className="flex items-center gap-2">
            <IssueSeverityBadge severity={severity} />
            <StatusBadge status={resolutionStatus} />
          </div>
        }
      />

      {banner}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">{children}</div>

        <div className="lg:col-span-4 border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
          <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
            Resolution
          </h3>
          <IssueResolutionForm
            issueId={issueId}
            immediateAction={immediateAction}
            resolutionStatus={resolutionStatus}
            resolutionNotes={resolutionNotes}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
}
