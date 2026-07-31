import React from "react";
import Link from "next/link";
import { getAssignments, summarizeAssignmentProgress } from "@/server/services/assignment-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { FileSpreadsheet, Plus } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ status?: string; roundId?: string; overdue?: string }>;
}

export default async function AssignmentsListPage({ searchParams }: PageProps) {
  const { status, roundId, overdue } = await searchParams;
  const rawAssignments = await getAssignments();

  const assignments = rawAssignments.map((asg) => ({
    ...asg,
    progress: summarizeAssignmentProgress(asg),
  }));

  const filtered = assignments.filter((asg) => {
    if (status && asg.progress.label !== status && asg.status !== status) return false;
    if (roundId && asg.roundId !== roundId) return false;
    if (overdue === "true" && !asg.progress.overdue) return false;
    return true;
  });

  const statusFilters = [
    { value: "draft", label: "Draft" },
    { value: "invited", label: "Invited" },
    { value: "first_impression_due", label: "First Impression Due" },
    { value: "active", label: "Active" },
    { value: "follow_up_due", label: "Follow-Up Due" },
    { value: "complete", label: "Complete" },
    { value: "revoked", label: "Revoked" },
    { value: "expired", label: "Expired" },
  ];

  const filterLink = (params: Record<string, string | undefined>) => {
    const merged = { status, roundId, overdue, ...params };
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return `/owner/assignments${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Testing Assignments"
        eyebrow="Verification Dispatches"
        description="Dispatch active testing cycles, manage instruction briefs, and track tester feedback logs."
        count={filtered.length}
        actions={
          <Link
            href="/owner/assignments/new"
            className="bg-kavri-ink text-white hover:bg-neutral-800 text-xs font-sans font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href={filterLink({ status: undefined })}
          className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${!status ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}
        >
          All
        </Link>
        {statusFilters.map((s) => (
          <Link
            key={s.value}
            href={filterLink({ status: s.value })}
            className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${status === s.value ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"}`}
          >
            {s.label}
          </Link>
        ))}
        <Link
          href={filterLink({ overdue: overdue === "true" ? undefined : "true" })}
          className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border ${overdue === "true" ? "bg-red-600 text-white border-red-600" : "border-red-200 text-red-700 hover:bg-red-50"}`}
        >
          Overdue Only
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <FileSpreadsheet className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No assignments match the current filters.</p>
          <Link
            href="/owner/assignments/new"
            className="text-xs font-mono uppercase text-kavri-signal hover:underline"
          >
            Create first assignment &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Tester</th>
                  <th className="px-6 py-4">Sample</th>
                  <th className="px-6 py-4">Round</th>
                  <th className="px-6 py-4">Sessions</th>
                  <th className="px-6 py-4">FI / FU</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {filtered.map((asg) => (
                  <tr key={asg.id} className="hover:bg-[#f9f9f7]/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-kavri-ink text-[13px]">
                      {asg.testerProfile.displayName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold bg-[#fafaf8] border border-kavri-line px-2.5 py-1 rounded-md text-kavri-ink">
                        {asg.sample.sampleCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-mono text-[11px]">
                      {asg.round ? asg.round.roundCode : "—"}
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-mono text-[11px]">
                      {asg.progress.sessionCount} / {asg.requiredSessionCount}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px]">
                      <span className={asg.progress.firstImpressionSubmitted ? "text-emerald-700" : "text-kavri-muted"}>
                        {asg.progress.firstImpressionSubmitted ? "✓" : "—"}
                      </span>
                      {" / "}
                      <span className={asg.progress.followUpSubmitted ? "text-emerald-700" : "text-kavri-muted"}>
                        {asg.progress.followUpSubmitted ? "✓" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span>{new Date(asg.dueAt).toLocaleDateString()}</span>
                        {asg.progress.overdue && (
                          <span className="text-[9px] font-bold uppercase text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={asg.progress.label} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/owner/assignments/${asg.id}`}
                        className="text-kavri-ink hover:underline font-semibold"
                      >
                        View brief
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
