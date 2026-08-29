import React from "react";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireActiveTester } from "@/lib/permissions";
import { PageHeader } from "@/components/brand/headers";
import { IssueReportForm } from "@/components/brand/issue-report-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TesterIssueReportPage({ params }: PageProps) {
  const { session } = await requireActiveTester();
  const { id } = await params;

  // Direct ownership-scoped query (not the redacted tester-portal DTO) - we need the real
  // sampleId to hand to the issue form; createIssueReportAction independently re-verifies this
  // same tester-owns-sample relationship server-side, so this is not a trust boundary weakening.
  const assignment = await db.query.testingAssignments.findFirst({
    where: and(
      eq(schema.testingAssignments.id, id),
      eq(schema.testingAssignments.testerUserId, session.user.id)
    ),
  });

  if (!assignment) {
    return (
      <div className="space-y-4 text-center py-12 font-mono text-xs border border-destructive/20 bg-destructive/5 rounded-sm">
        <h3 className="font-heading uppercase tracking-widest text-destructive font-bold">Access Denied</h3>
        <p className="text-kavri-ink dark:text-foreground">The requested assignment was not found or is inaccessible.</p>
        <div className="pt-2">
          <Link href="/tester" className="text-kavri-signal hover:underline uppercase tracking-wider text-[10px]">
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
          href={`/tester/assignments/${id}`}
          className="text-[10px] font-mono uppercase tracking-widest text-kavri-muted hover:text-kavri-signal block mb-2"
        >
          &larr; Return to Assignment
        </Link>
        <PageHeader title="Report an Issue" description="Document a defect or observation on this sample." />
      </div>
      <IssueReportForm sampleId={assignment.sampleId} assignmentId={assignment.id} redirectHref={`/tester/assignments/${id}`} />
    </div>
  );
}
