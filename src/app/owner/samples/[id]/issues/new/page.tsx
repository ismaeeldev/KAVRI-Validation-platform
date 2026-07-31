import React from "react";
import { getSampleById } from "@/server/services/sample-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { IssueReportForm } from "@/components/brand/issue-report-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OwnerLogIssuePage({ params }: PageProps) {
  const { id } = await params;
  const sample = await getSampleById(id);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Log Issue — ${sample.sampleCode}`}
        eyebrow="Intake Inspection Finding"
        description="Log a defect found during intake inspection or owner review, independent of tester reporting."
        backHref={`/owner/samples/${id}`}
        backLabel="Back to sample"
      />
      <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
        <IssueReportForm sampleId={id} redirectHref={`/owner/samples/${id}`} />
      </div>
    </div>
  );
}
