import React from "react";
import Link from "next/link";
import { getPublicUpdates } from "@/server/services/public-update-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { Rss, Plus } from "lucide-react";

export const revalidate = 0;

export default async function PublicUpdatesListPage() {
  const updates = await getPublicUpdates();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Public Development Log Updates"
        eyebrow="Public Updates"
        description="Manage public updates published on the landing page build log feed."
        count={updates.length}
        actions={
          <Link
            href="/owner/updates/new"
            className="bg-kavri-ink text-white hover:bg-neutral-800 text-xs font-sans font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create Update</span>
          </Link>
        }
      />

      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <Rss className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No public updates logged.</p>
          <Link
            href="/owner/updates/new"
            className="text-xs font-mono uppercase text-kavri-signal hover:underline"
          >
            Create first update &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status Label</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Publish State</th>
                  <th className="px-6 py-4">Sort Order</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {updates.map((upd) => (
                  <tr
                    key={upd.id}
                    className="hover:bg-[#f9f9f7]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-kavri-ink text-[13px]">
                      {upd.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-[10px] font-bold bg-[#fafaf8] border border-kavri-line px-2 py-0.5 rounded-md text-kavri-muted uppercase tracking-wider">
                        {upd.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-kavri-muted font-mono">
                      {upd.developmentStage || "None"}
                    </td>
                    <td className="px-6 py-4">
                      {upd.publishedState === "published" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                          Published
                        </span>
                      ) : upd.publishedState === "archived" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#f9e9e7] text-[#b33a32] border border-[#f5d6d4] px-2 py-0.5 rounded-md uppercase">
                          Archived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#ecefea] text-kavri-muted border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-mono font-medium">
                      {upd.sortOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/owner/updates/${upd.id}`}
                        className="text-kavri-ink hover:underline font-semibold"
                      >
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
