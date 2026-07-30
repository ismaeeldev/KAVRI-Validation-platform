import React from "react";
import Link from "next/link";
import { getRounds } from "@/server/services/test-round-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { ClipboardList, Plus } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function RoundsListPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const allRounds = await getRounds();
  const rounds = status ? allRounds.filter((r) => r.status === status) : allRounds;

  const statuses = ["draft", "recruiting", "active", "review", "closed"];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Test Rounds"
        eyebrow="Validation Cycles"
        description="Group testers, samples, and evaluations into a validation cycle with a shared goal and closeout gate."
        count={rounds.length}
        actions={
          <Link
            href="/owner/rounds/new"
            className="bg-kavri-ink text-white hover:bg-neutral-800 text-xs font-sans font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Round</span>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/owner/rounds"
          className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${
            !status ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/owner/rounds?status=${s}`}
            className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${
              status === s ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {rounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <ClipboardList className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No test rounds found.</p>
          <Link href="/owner/rounds/new" className="text-xs font-mono uppercase text-kavri-signal hover:underline">
            Create first round &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Round</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Linked Revisions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {rounds.map((round) => (
                  <tr key={round.id} className="hover:bg-[#f9f9f7]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-kavri-ink text-[13px]">{round.roundName}</p>
                      <p className="text-[10px] font-mono text-kavri-muted uppercase tracking-wider mt-0.5">{round.roundCode}</p>
                    </td>
                    <td className="px-6 py-4 text-kavri-muted max-w-xs truncate">{round.purpose}</td>
                    <td className="px-6 py-4 text-kavri-muted">{round.roundRevisions.length}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={round.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/owner/rounds/${round.id}`} className="text-kavri-ink hover:underline font-semibold">
                        Manage
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
