import React from "react";
import Link from "next/link";
import { getTesters } from "@/server/services/tester-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { TesterCreateForm } from "@/components/brand/tester-create-form";
import { Users } from "lucide-react";

export const revalidate = 0;

export default async function TestersListPage() {
  const testers = await getTesters();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Tester Profile Directory"
        eyebrow="Verification Network"
        description="Onboard testers, review approvals, track credential activations, and dispatch assignments."
        count={testers.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Onboarding form */}
        <div className="lg:col-span-4">
          <TesterCreateForm />
        </div>

        {/* Directory directory table list */}
        <div className="lg:col-span-8">
          {testers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
              <Users className="h-8 w-8 text-kavri-muted" />
              <p className="text-xs font-sans font-semibold text-kavri-muted">No tester profiles logged.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                      <th className="px-6 py-4">Name / Email</th>
                      <th className="px-6 py-4">Approval State</th>
                      <th className="px-6 py-4">Activation Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kavri-line/60">
                    {testers.map((tester) => (
                      <tr
                        key={tester.id}
                        className="hover:bg-[#f9f9f7]/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-kavri-ink text-[13px]">
                            {tester.displayName}
                          </p>
                          <p className="text-[10px] font-mono text-kavri-muted lowercase tracking-wider mt-0.5">{tester.emailNormalized}</p>
                        </td>
                        <td className="px-6 py-4">
                          {tester.approvalStatus === "approved" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#e8f5ec] text-[#257a47] border border-[#d1ecd9] px-2 py-0.5 rounded-md uppercase">
                              Approved
                            </span>
                          ) : tester.approvalStatus === "deactivated" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#f9e9e7] text-[#b33a32] border border-[#f5d6d4] px-2 py-0.5 rounded-md uppercase">
                              Deactivated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#fff5d8] text-[#986b11] border border-[#faecd1] px-2 py-0.5 rounded-md uppercase">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {tester.userId ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#ecefea] text-kavri-muted border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                              Invited
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/owner/testers/${tester.id}`}
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
      </div>
    </div>
  );
}
