import React from "react";
import Link from "next/link";
import { getSamples } from "@/server/services/sample-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { Box, Plus } from "lucide-react";

export const revalidate = 0;

export default async function SamplesListPage() {
  const samples = await getSamples();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Physical Samples Triage"
        eyebrow="Triage Station"
        description="Log physical samples, assign triage statuses, and verify testing readiness."
        count={samples.length}
        actions={
          <Link
            href="/owner/samples/new"
            className="bg-kavri-ink text-white hover:bg-neutral-800 text-xs font-sans font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1"
          >
            <Plus className="h-4 w-4" />
            <span>Log Sample</span>
          </Link>
        }
      />

      {samples.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <Box className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No physical samples logged in directory.</p>
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
                      <span className="font-mono text-[11px] font-bold bg-[#fafaf8] border border-kavri-line px-2.5 py-1 rounded-md text-kavri-ink">
                        {sample.sampleCode}
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
                        View Triage
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
