import React from "react";
import { getWaitlistSubscribers } from "@/server/services/waitlist-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { WaitlistTable } from "@/components/brand/waitlist-table";
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
        description="Monitor landing page registrations, tester applications, and consent logs."
        count={subscribers.length}
      />

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <List className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No waitlist subscribers registered yet.</p>
        </div>
      ) : (
        <WaitlistTable subscribers={subscribers} />
      )}
    </div>
  );
}
