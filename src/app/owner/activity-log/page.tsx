import React from "react";
import { db } from "@/db";
import { desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { Clock } from "lucide-react";
import { requireOwner } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const revalidate = 0;

function formatAction(action: string) {
  return action
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function OwnerActivityLogPage() {
  // Enforce owner authorization
  try {
    await requireOwner();
  } catch {
    redirect("/login");
  }

  // Fetch all activity logs (up to 100)
  const logs = await db.query.activityLogs.findMany({
    orderBy: [desc(schema.activityLogs.createdAt)],
    limit: 100,
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Recent Activity"
        eyebrow="Audit Trail"
        description="Comprehensive chronological log of status updates, prototype triage transitions, and assignment states."
        backHref="/owner"
        backLabel="Back to Dashboard"
      />

      <div className="border border-kavri-line rounded-xl bg-kavri-surface overflow-hidden">
        <div className="px-6 py-5 border-b border-kavri-line flex items-center justify-between bg-[#fafaf8]">
          <div>
            <h2 className="font-heading text-sm font-black uppercase tracking-wider text-kavri-ink">
              All Activity History
            </h2>
            <p className="text-[11px] text-kavri-muted font-sans mt-0.5">
              Showing the most recent {logs.length} audit logs.
            </p>
          </div>
          <Clock className="h-4 w-4 text-kavri-muted" />
        </div>

        <div className="p-6">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
              <Clock className="h-8 w-8 text-kavri-muted" />
              <p className="text-xs font-sans font-semibold text-kavri-muted">No activity logs found in the database.</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-kavri-line space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative space-y-1">
                  {/* Circle Node */}
                  <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-kavri-line-strong border border-kavri-surface" />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="space-y-1 font-sans text-xs">
                      <span className="font-bold text-kavri-ink block">
                        {formatAction(log.action)}
                      </span>
                      <span className="font-mono text-[10px] text-kavri-muted capitalize">
                        {log.targetType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <time className="font-mono text-[10px] text-kavri-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </time>
                  </div>

                  {/* Raw UUIDs and JSON payload are developer-only detail, kept out of the
                      default owner view behind one disclosure toggle. */}
                  <details className="mt-2 group">
                    <summary className="font-mono text-[9px] uppercase tracking-wider text-kavri-muted hover:text-kavri-ink cursor-pointer list-none flex items-center gap-1 select-none">
                      <span className="group-open:rotate-90 transition-transform duration-100">&gt;</span>
                      <span>Developer details</span>
                    </summary>
                    <div className="mt-1.5 space-y-1.5">
                      <div className="font-mono text-[10px] text-kavri-muted">
                        Target ID:{" "}
                        <span className="bg-kavri-surface-subtle px-1.5 py-0.5 border border-kavri-line rounded-sm">
                          {log.targetId}
                        </span>
                      </div>
                      {log.metadataJson && (
                        <pre className="font-mono text-[10px] text-kavri-muted bg-[#1e201f] text-[#a5b4fc] p-3 rounded-lg border border-neutral-800 overflow-x-auto max-w-full">
                          {JSON.stringify(JSON.parse(log.metadataJson), null, 2)}
                        </pre>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
