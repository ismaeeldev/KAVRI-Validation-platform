import React from "react";
import Link from "next/link";
import { getTesterAssignmentById } from "@/server/services/tester-portal-service";
import { requireActiveTester } from "@/lib/permissions";
import { PageHeader } from "@/components/brand/headers";
import { TechnicalDivider } from "@/components/brand/metadata";
import { StatusBadge } from "@/components/brand/status";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TesterPortalActions } from "@/components/brand/tester-portal-actions";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TesterAssignmentDetailPage({ params }: PageProps) {
  const { session } = await requireActiveTester();
  const { id } = await params;
  let assignment;
  let errorMsg = null;

  try {
    assignment = await getTesterAssignmentById(id, session.user.id);
  } catch (error: unknown) {
    const err = error as Error;
    errorMsg = err.message || "The requested assignment was not found.";
  }

  if (errorMsg || !assignment) {
    return (
      <div className="space-y-4 text-center py-12 font-mono text-xs border border-destructive/20 bg-destructive/5 rounded-sm">
        <h3 className="font-heading uppercase tracking-widest text-destructive font-bold">
          Access Denied
        </h3>
        <p className="text-kavri-ink dark:text-foreground">
          The requested brief was not found or is inaccessible.
        </p>
        <div className="pt-2">
          <Link
            href="/tester"
            className="text-kavri-signal hover:underline uppercase tracking-wider text-[10px]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/tester"
          className="text-[10px] font-mono uppercase tracking-widest text-kavri-muted hover:text-kavri-signal block mb-2"
        >
          &larr; Return to Overview
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase bg-kavri-surface-subtle border border-kavri-line px-2 py-0.5 rounded-sm font-bold">
            Sample: {assignment.sample.sampleCode}
          </span>
          <StatusBadge status={assignment.status as "draft" | "active" | "acknowledged" | "revoked" | "expired"} />
        </div>
        <PageHeader
          title={assignment.product.publicAlias}
          description="Testing parameters and operational briefings."
        />
      </div>
      <TechnicalDivider />

      {/* Traceability Binding Card */}
      <Card className="border-kavri-line bg-kavri-surface dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs uppercase tracking-wider">Operational Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs text-kavri-ink dark:text-foreground">
          <div className="flex justify-between border-b border-kavri-line/40 pb-2">
            <span className="text-kavri-muted text-[10px] uppercase">Revision Code</span>
            <span className="font-bold">{assignment.revision.revisionCode}</span>
          </div>
          <div className="flex justify-between border-b border-kavri-line/40 pb-2">
            <span className="text-kavri-muted text-[10px] uppercase">Target Session Count</span>
            <span className="font-bold">{assignment.requiredSessionCount} validation session(s)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-kavri-muted text-[10px] uppercase">Required Due Date</span>
            <span className="font-bold">{new Date(assignment.dueAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Brief Card */}
      <Card className="border-kavri-line bg-kavri-surface dark:bg-card">
        <CardHeader>
          <CardTitle className="font-heading text-xs uppercase tracking-wider">Instructions Brief</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-xs text-kavri-ink dark:text-foreground whitespace-pre-wrap leading-relaxed">
          {assignment.instructions}
        </CardContent>
      </Card>

      {/* Future Phase Disclaimer */}
      <Card className="border-kavri-line bg-kavri-surface-subtle text-center p-4">
        <CardContent className="font-mono text-[10px] text-kavri-muted leading-relaxed p-0">
          Note: Detailed validation checklists, telemetry logging utilities, and issue logs reporting interfaces will unlock during a future phase.
        </CardContent>
      </Card>

      {/* Primary Acknowledge action button */}
      <TesterPortalActions assignmentId={id} status={assignment.status} />
    </div>
  );
}
