import React from "react";
import Link from "next/link";
import { getAssignments } from "@/server/services/assignment-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { FileSpreadsheet, Plus } from "lucide-react";

export const revalidate = 0;

export default async function AssignmentsListPage() {
  const assignments = await getAssignments();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Testing Assignments"
        eyebrow="Verification Dispatches"
        description="Dispatch active testing cycles, manage instruction briefs, and track tester feedback logs."
        count={assignments.length}
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

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <FileSpreadsheet className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No assignments dispatched to validation cycle.</p>
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
                  <th className="px-6 py-4">Sample Code</th>
                  <th className="px-6 py-4">Product / Revision</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {assignments.map((asg) => (
                  <tr
                    key={asg.id}
                    className="hover:bg-[#f9f9f7]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-kavri-ink text-[13px]">
                      {asg.testerProfile.displayName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold bg-[#fafaf8] border border-kavri-line px-2.5 py-1 rounded-md text-kavri-ink">
                        {asg.sample.sampleCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-kavri-ink text-[13px]">{asg.product.internalName}</p>
                      <p className="text-[10px] font-mono text-kavri-muted uppercase tracking-wider mt-0.5">
                        Rev: {asg.revision.revisionCode}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-mono text-[11px]">
                      {new Date(asg.dueAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={asg.status as "draft" | "active" | "acknowledged" | "revoked" | "expired"} />
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
