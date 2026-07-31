import React from "react";
import { getWaitlistSubscribers } from "@/server/services/waitlist-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { requireOwner } from "@/lib/permissions";
import { List } from "lucide-react";

export const revalidate = 0;

export default async function WaitlistPage() {
  await requireOwner();
  const subscribers = await getWaitlistSubscribers();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Waitlist Subscribers"
        eyebrow="Waitlist"
        description="Monitor landing page registrations and consent logs. No marketing campaigns are active in Sprint 1."
        count={subscribers.length}
      />

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <List className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No waitlist subscribers registered yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Consent Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#f9f9f7]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-kavri-ink text-[13px]">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-kavri-muted font-mono">
                      {sub.signupSource}
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-mono text-[11px]">
                      {new Date(sub.consentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                        {sub.status}
                      </span>
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
