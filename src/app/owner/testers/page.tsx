import React from "react";
import { getTesters } from "@/server/services/tester-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { AddTesterDialog } from "@/components/brand/add-tester-dialog";
import { TesterDirectoryTable } from "@/components/brand/tester-directory-table";
import { Users } from "lucide-react";

export const revalidate = 0;

export default async function TestersListPage() {
  const testers = await getTesters();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Tester Profile Directory"
        eyebrow="Testers"
        description="Onboard testers, review approvals, track credential activations, and dispatch assignments."
        count={testers.length}
        actions={<AddTesterDialog />}
      />

      {testers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <Users className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No tester profiles logged.</p>
        </div>
      ) : (
        <TesterDirectoryTable testers={testers} />
      )}
    </div>
  );
}
