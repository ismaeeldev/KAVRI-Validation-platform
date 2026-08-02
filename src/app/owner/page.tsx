import React from "react";
import { db } from "@/db";
import { desc, count, eq, or } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getDashboardSummary } from "@/server/services/dashboard-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import {
  Building2,
  ShoppingBag,
  Box,
  UserCheck,
  FileSpreadsheet,
  Rss,
  List,
  ArrowRight,
  Clock,
  Activity,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  Gavel,
  Mail,
  PlayCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Fresh database query on load

function formatAction(action: string) {
  return action
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function OwnerDashboardPage() {
  const summary = await getDashboardSummary();

  const needsAttentionCards = [
    {
      label: "Samples awaiting inspection",
      count: summary.needsAttention.samplesAwaitingInspectionCount,
      href: "/owner/samples?status=received,under_review",
      icon: Box,
    },
    {
      label: "Approved testers with no invitation sent",
      count: summary.needsAttention.testersNeedingInvitationCount,
      href: "/owner/testers?filter=needs_invitation",
      icon: Mail,
    },
    {
      label: "Overdue assignments",
      count: summary.needsAttention.overdueAssignmentsCount,
      href: "/owner/assignments?overdue=true",
      icon: AlertTriangle,
    },
    {
      // The issues list filter only supports one severity value at a time, so this links to all
      // open issues rather than under-representing the stop_use severity that also counts here.
      label: "Unresolved high/stop-use issues",
      count: summary.needsAttention.criticalOpenIssuesCount,
      href: "/owner/issues?status=open",
      icon: ShieldAlert,
    },
    {
      label: "Rounds needing closeout",
      count: summary.needsAttention.roundsNeedingCloseoutCount,
      href: "/owner/rounds?status=review",
      icon: Gavel,
    },
  ].filter((c) => c.count > 0);

  const activeWorkCards = [
    { label: "Active rounds", count: summary.activeWork.activeRoundsCount, href: "/owner/rounds?status=active", icon: ClipboardList },
    { label: "Active assignments", count: summary.activeWork.activeAssignmentsCount, href: "/owner/assignments?status=active", icon: PlayCircle },
    { label: "Evaluations in progress (draft)", count: summary.activeWork.draftEvaluationsCount, href: "/owner/rounds", icon: FileText },
    { label: "Public updates awaiting review", count: summary.activeWork.draftUpdatesCount, href: "/owner/updates", icon: Rss },
  ];

  // --- Validation Snapshot (demoted) ---
  const recentLogs = await db.query.activityLogs.findMany({
    orderBy: [desc(schema.activityLogs.createdAt)],
    limit: 4,
  });

  const [suppliersCount] = await db.select({ count: count() }).from(schema.suppliers);
  const [productsCount] = await db.select({ count: count() }).from(schema.products);
  const [samplesCount] = await db.select({ count: count() }).from(schema.physicalSamples);
  const [testersCount] = await db.select({ count: count() }).from(schema.testerProfiles);
  const [assignmentsCount] = await db
    .select({ count: count() })
    .from(schema.testingAssignments)
    .where(
      or(
        eq(schema.testingAssignments.status, "invited"),
        eq(schema.testingAssignments.status, "acknowledged")
      )
    );
  const [updatesCount] = await db.select({ count: count() }).from(schema.publicUpdates);
  const [waitlistCount] = await db.select({ count: count() }).from(schema.waitlistSubscribers);

  const metrics = [
    { label: "Suppliers", value: suppliersCount?.count ?? 0, icon: Building2, href: "/owner/suppliers", color: "text-blue-600 bg-blue-50" },
    { label: "Products", value: productsCount?.count ?? 0, icon: ShoppingBag, href: "/owner/products", color: "text-purple-600 bg-purple-50" },
    { label: "Samples", value: samplesCount?.count ?? 0, icon: Box, href: "/owner/samples", color: "text-amber-600 bg-amber-50" },
    { label: "Testers", value: testersCount?.count ?? 0, icon: UserCheck, href: "/owner/testers", color: "text-green-600 bg-green-50" },
    { label: "Assignments", value: assignmentsCount?.count ?? 0, icon: FileSpreadsheet, href: "/owner/assignments", color: "text-rose-600 bg-rose-50" },
    { label: "Updates", value: updatesCount?.count ?? 0, icon: Rss, href: "/owner/updates", color: "text-indigo-600 bg-indigo-50" },
    { label: "Waitlist", value: waitlistCount?.count ?? 0, icon: List, href: "/owner/waitlist", color: "text-teal-600 bg-teal-50" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      <DashboardPageHeader
        title="Owner Dashboard"
        eyebrow="Core Controls"
        description="What needs your attention, what's actively in progress, and a snapshot of the whole system."
      />

      {/* Needs Attention */}
      <div className="space-y-3">
        <h2 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span>Needs Attention</span>
        </h2>
        {needsAttentionCards.length === 0 ? (
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 text-center font-sans text-xs text-kavri-muted">
            Nothing needs attention right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {needsAttentionCards.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.label}
                  href={c.href}
                  className="group border border-red-200 bg-red-50/40 hover:bg-red-50 rounded-xl p-4 flex items-center justify-between transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-red-100 text-red-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="font-heading text-lg font-black text-kavri-ink block leading-none">{c.count}</span>
                      <span className="font-sans text-[11px] font-medium text-kavri-muted block mt-1">{c.label}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-red-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Work */}
      <div className="space-y-3">
        <h2 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-2">
          <Activity className="h-4 w-4 text-kavri-muted" />
          <span>Active Work</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeWorkCards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                href={c.href}
                className="group border border-kavri-line bg-kavri-surface hover:border-kavri-line-strong rounded-xl p-4 flex flex-col justify-between transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-kavri-signal-soft text-kavri-signal-ink">
                    <Icon className="h-4 w-4" />
                  </span>
                  <ArrowRight className="h-3 w-3 text-kavri-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4 space-y-0.5">
                  <span className="font-heading text-xl font-black text-kavri-ink block">{c.count}</span>
                  <span className="font-sans text-[11px] font-medium text-kavri-muted block">{c.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-4">
            <h2 className="font-heading text-sm font-black uppercase tracking-wider text-kavri-ink flex items-center gap-2">
              <Activity className="h-4 w-4 text-kavri-muted" />
              <span>Quick Actions</span>
            </h2>
            <div className="divide-y divide-kavri-line font-sans text-xs">
              {[
                { name: "Add Supplier", href: "/owner/suppliers/new", desc: "Log a new supply partner" },
                { name: "Create Product", href: "/owner/products/new", desc: "Define new validation target" },
                { name: "Register Sample", href: "/owner/samples/new", desc: "Log fresh physical build" },
                { name: "Create Test Round", href: "/owner/rounds/new", desc: "Start a new validation cycle" },
                { name: "New Assignment", href: "/owner/assignments/new", desc: "Dispatch prototype to tester" },
                { name: "Review Evaluations", href: "/owner/rounds", desc: "Open a round to review submitted evaluations" },
                { name: "Publish Update", href: "/owner/updates/new", desc: "Share progress on the landing page" },
              ].map((act) => (
                <Link
                  key={act.name}
                  href={act.href}
                  className="flex items-center justify-between py-3 hover:text-kavri-ink group transition-colors"
                >
                  <div>
                    <span className="font-semibold text-kavri-ink block">{act.name}</span>
                    <span className="text-[10px] text-kavri-muted block">{act.desc}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-kavri-muted group-hover:translate-x-1 group-hover:text-kavri-ink transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Validation Snapshot (demoted, secondary) */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-4">
            <h2 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-muted">
              Validation Snapshot
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.label}
                    href={m.href}
                    className="group border border-kavri-line rounded-lg bg-[#fafaf8] hover:border-kavri-line-strong p-3 flex items-center gap-2.5 transition-all duration-150"
                  >
                    <span className={`p-1.5 rounded-md ${m.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <span className="font-heading text-sm font-black text-kavri-ink block leading-none">{m.value}</span>
                      <span className="font-sans text-[9px] font-medium text-kavri-muted uppercase tracking-wider block mt-0.5">
                        {m.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity (renamed from Telemetry) */}
        <div className="lg:col-span-8 border border-kavri-line rounded-xl bg-kavri-surface overflow-hidden">
          <div className="px-6 py-5 border-b border-kavri-line flex items-center justify-between bg-[#fafaf8]">
            <div>
              <h2 className="font-heading text-sm font-black uppercase tracking-wider text-kavri-ink">
                Recent Activity
              </h2>
              <p className="text-[11px] text-kavri-muted font-sans mt-0.5">
                Audit trail of status updates and assignments logged in the system database.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/owner/activity-log"
                className="inline-flex items-center text-[11px] font-sans font-bold text-kavri-ink bg-white border border-kavri-line hover:bg-[#fafaf8] px-2.5 py-1 rounded-md transition-colors"
              >
                View Full
              </Link>
              <Clock className="h-4 w-4 text-kavri-muted" />
            </div>
          </div>

          <div className="p-6">
            {recentLogs.length === 0 ? (
              <div className="text-center py-10 font-sans text-xs text-kavri-muted">
                No activity logs found in the database.
              </div>
            ) : (
              <div className="relative pl-6 border-l border-kavri-line space-y-6">
                {recentLogs.map((log) => (
                  <div key={log.id} className="relative space-y-1">
                    {/* Circle Node */}
                    <span className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-kavri-line-strong border border-kavri-surface" />

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <div className="space-y-1">
                        <span className="font-sans text-xs font-bold text-kavri-ink block">
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
                        })}
                      </time>
                    </div>

                    {/* Raw UUIDs/JSON are developer-only detail, kept out of the default view. */}
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
                          <pre className="font-mono text-[10px] text-kavri-muted-on-dark bg-[#1e201f] text-[#a5b4fc] p-3 rounded-lg border border-neutral-800 overflow-x-auto max-w-full">
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
    </div>
  );
}
