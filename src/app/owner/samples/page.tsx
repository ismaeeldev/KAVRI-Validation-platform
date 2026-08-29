import React from "react";
import Link from "next/link";
import { getSamples } from "@/server/services/sample-service";
import { getAllIssues } from "@/server/services/issue-service";
import { CRITICAL_ISSUE_SEVERITIES } from "@/lib/constants";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { Box, Plus, ShieldAlert } from "lucide-react";
import { DownloadCsvButton } from "@/components/brand/download-csv-button";
import { SampleScanLookup } from "@/components/brand/sample-scan-lookup";
import { rowsToCsv, type CsvColumn } from "@/lib/csv-export";
import { db } from "@/db";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

type SampleExportRow = Awaited<ReturnType<typeof getSamples>>[number] & { currentHolder: string };

const SAMPLE_CSV_COLUMNS: CsvColumn<SampleExportRow>[] = [
  { header: "sampleCode", value: (s) => s.sampleCode },
  { header: "product", value: (s) => s.product.internalName },
  { header: "revision", value: (s) => s.revision.revisionCode },
  { header: "supplier", value: (s) => s.supplier.name },
  { header: "receivedAt", value: (s) => s.receivedAt },
  { header: "status", value: (s) => s.status },
  { header: "currentHolder", value: (s) => s.currentHolder },
  { header: "actualStaticWeightG", value: (s) => s.actualStaticWeightG },
  { header: "actualSwingWeight", value: (s) => s.actualSwingWeight },
  { header: "actualTwistWeight", value: (s) => s.actualTwistWeight },
  { header: "actualBalancePointMm", value: (s) => s.actualBalancePointMm },
  { header: "actualLengthIn", value: (s) => s.actualLengthIn },
  { header: "actualWidthIn", value: (s) => s.actualWidthIn },
  { header: "actualHandleLengthIn", value: (s) => s.actualHandleLengthIn },
  { header: "actualGripCircumferenceIn", value: (s) => s.actualGripCircumferenceIn },
  { header: "actualCoreThicknessMm", value: (s) => s.actualCoreThicknessMm },
  { header: "actualSwingWeightMethod", value: (s) => s.actualSwingWeightMethod },
  { header: "actualSwingWeightDate", value: (s) => s.actualSwingWeightDate },
  { header: "actualTwistWeightMethod", value: (s) => s.actualTwistWeightMethod },
  { header: "actualTwistWeightDate", value: (s) => s.actualTwistWeightDate },
  { header: "inspectionPackagingOk", value: (s) => s.inspectionPackagingOk },
  { header: "inspectionCosmeticOk", value: (s) => s.inspectionCosmeticOk },
  { header: "inspectionConstructionOk", value: (s) => s.inspectionConstructionOk },
  { header: "inspectionSoundOk", value: (s) => s.inspectionSoundOk },
  { header: "receivingObservations", value: (s) => s.receivingObservations },
  { header: "identifyingNotes", value: (s) => s.identifyingNotes },
  { header: "readinessNote", value: (s) => s.readinessNote },
];

export default async function SamplesListPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const allSamples = await getSamples();
  const statuses = status ? status.split(",") : [];
  const samples = statuses.length > 0 ? allSamples.filter((s) => statuses.includes(s.status)) : allSamples;
  const allIssues = await getAllIssues();
  const criticalOpenSampleIds = new Set(
    allIssues
      .filter((i) => CRITICAL_ISSUE_SEVERITIES.has(i.severity) && i.resolutionStatus !== "closed" && i.resolutionStatus !== "resolved")
      .map((i) => i.sampleId)
  );

  // Batch-resolve current holders (avoids N+1 per-sample queries for the export).
  const assignedSampleIds = samples.filter((s) => s.status === "assigned").map((s) => s.id);
  const activeAssignments = assignedSampleIds.length
    ? await db.query.testingAssignments.findMany({
        where: (a, { and, inArray: inArr }) =>
          and(inArr(a.sampleId, assignedSampleIds), inArr(a.status, ["invited", "acknowledged"])),
        with: { testerProfile: true },
      })
    : [];
  const holderBySampleId = new Map(activeAssignments.map((a) => [a.sampleId, a.testerProfile.displayName]));
  const sampleExportRows: SampleExportRow[] = samples.map((s) => ({
    ...s,
    currentHolder: s.status === "assigned" ? holderBySampleId.get(s.id) || "Assigned (holder TBD)" : "KAVRI",
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Sample Review"
        eyebrow="Samples"
        description="Log physical samples, assign review statuses, and verify testing readiness."
        count={samples.length}
        actions={
          <div className="flex items-center gap-2">
            <SampleScanLookup />
            <DownloadCsvButton csv={rowsToCsv(sampleExportRows, SAMPLE_CSV_COLUMNS)} filenamePrefix="samples" />
            <Link
              href="/owner/samples/new"
              className="bg-kavri-ink text-white hover:bg-neutral-800 text-xs font-sans font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1"
            >
              <Plus className="h-4 w-4" />
              <span>Log Sample</span>
            </Link>
          </div>
        }
      />

      {status && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border bg-kavri-ink text-white border-kavri-ink">
            Filtered: {statuses.join(", ").replace(/_/g, " ")}
          </span>
          <Link href="/owner/samples" className="text-[10px] font-mono uppercase text-kavri-muted hover:text-kavri-ink hover:underline">
            Clear filter
          </Link>
        </div>
      )}

      {samples.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <Box className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">
            {status ? "No samples match this filter." : "No physical samples logged in directory."}
          </p>
          <Link
            href="/owner/samples/new"
            className="text-xs font-mono uppercase text-kavri-signal hover:underline"
          >
            Log first sample &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Sample Code</th>
                  <th className="px-6 py-4">Product / Revision</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Received At</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {samples.map((sample) => (
                  <tr
                    key={sample.id}
                    className="hover:bg-[#f9f9f7]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-kavri-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold bg-[#fafaf8] border border-kavri-line px-2.5 py-1 rounded-md text-kavri-ink">
                          {sample.sampleCode}
                        </span>
                        {criticalOpenSampleIds.has(sample.id) && (
                          <span title="Open high/stop-use severity issue" className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                            <ShieldAlert className="h-3 w-3" /> Issue
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-kavri-ink text-[13px]">{sample.product.internalName}</p>
                      <p className="text-[10px] font-mono text-kavri-muted uppercase tracking-wider mt-0.5">
                        Rev: {sample.revision.revisionCode}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-medium">{sample.supplier.name}</td>
                    <td className="px-6 py-4 text-kavri-muted font-mono text-[11px]">
                      {new Date(sample.receivedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sample.status as "received" | "under_review" | "ready_for_testing" | "blocked" | "rejected"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/owner/samples/${sample.id}`}
                        className="text-kavri-ink hover:underline font-semibold"
                      >
                        Review Sample
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
