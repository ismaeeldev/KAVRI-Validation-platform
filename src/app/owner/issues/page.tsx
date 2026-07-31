import React from "react";
import Link from "next/link";
import { getAllIssues } from "@/server/services/issue-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge, IssueSeverityBadge } from "@/components/brand/status";
import { ISSUE_SEVERITY, ISSUE_RESOLUTION_STATUS, ISSUE_CATEGORY } from "@/lib/constants";
import { ShieldAlert } from "lucide-react";
import { DownloadCsvButton } from "@/components/brand/download-csv-button";
import { rowsToCsv, type CsvColumn } from "@/lib/csv-export";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ severity?: string; status?: string; category?: string }>;
}

type IssueExportRow = Awaited<ReturnType<typeof getAllIssues>>[number];

const ISSUE_CSV_COLUMNS: CsvColumn<IssueExportRow>[] = [
  { header: "sample", value: (i) => i.sample.sampleCode },
  { header: "product", value: (i) => i.revision.product.internalName },
  { header: "revision", value: (i) => i.revision.revisionCode },
  { header: "category", value: (i) => i.category },
  { header: "issueType", value: (i) => i.issueType },
  { header: "severity", value: (i) => i.severity },
  { header: "resolutionStatus", value: (i) => i.resolutionStatus },
  { header: "description", value: (i) => i.description },
  { header: "stillPlayable", value: (i) => i.stillPlayable },
  { header: "immediateAction", value: (i) => i.immediateAction },
  { header: "resolutionNotes", value: (i) => i.resolutionNotes },
  { header: "firstObservedAt", value: (i) => i.firstObservedAt },
  { header: "createdAt", value: (i) => i.createdAt },
];

export default async function IssuesListPage({ searchParams }: PageProps) {
  const { severity, status, category } = await searchParams;
  const allIssues = await getAllIssues();

  const issues = allIssues.filter((i) => {
    if (severity && i.severity !== severity) return false;
    if (status && i.resolutionStatus !== status) return false;
    if (category && i.category !== category) return false;
    return true;
  });

  const filterLink = (params: Record<string, string | undefined>) => {
    const merged = { severity, status, category, ...params };
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return `/owner/issues${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Issue Reports"
        eyebrow="Quality & Defect Tracking"
        description="Tester-reported and owner-logged defects across samples and revisions."
        count={issues.length}
        actions={<DownloadCsvButton csv={rowsToCsv(issues, ISSUE_CSV_COLUMNS)} filenamePrefix="issues" />}
      />

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <Link href={filterLink({ severity: undefined })} className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${!severity ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}>
            All Severities
          </Link>
          {Object.values(ISSUE_SEVERITY).map((s) => (
            <Link key={s} href={filterLink({ severity: s })} className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${severity === s ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}>
              {s.replace("_", " ")}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={filterLink({ status: undefined })} className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${!status ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}>
            All Statuses
          </Link>
          {Object.values(ISSUE_RESOLUTION_STATUS).map((s) => (
            <Link key={s} href={filterLink({ status: s })} className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${status === s ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}>
              {s}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={filterLink({ category: undefined })} className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${!category ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}>
            All Categories
          </Link>
          {Object.values(ISSUE_CATEGORY).map((c) => (
            <Link key={c} href={filterLink({ category: c })} className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${category === c ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}>
              {c.replace("_", " ")}
            </Link>
          ))}
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <ShieldAlert className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No issues match the current filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Sample</th>
                  <th className="px-6 py-4">Product / Revision</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-[#f9f9f7]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] font-bold">{issue.sample.sampleCode}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-kavri-ink text-[13px]">{issue.revision.product.internalName}</p>
                      <p className="text-[10px] font-mono text-kavri-muted uppercase tracking-wider mt-0.5">Rev: {issue.revision.revisionCode}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-kavri-muted">{issue.category.replace("_", " ")}</td>
                    <td className="px-6 py-4">
                      <IssueSeverityBadge severity={issue.severity} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={issue.resolutionStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/owner/issues/${issue.id}`} className="text-kavri-ink hover:underline font-semibold">
                        View
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
