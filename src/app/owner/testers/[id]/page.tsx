import React from "react";
import Link from "next/link";
import { getTesterById } from "@/server/services/tester-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { TesterActions } from "@/components/brand/tester-actions";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { ShieldAlert, Award, FileText, Activity, Clock } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TesterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tester = await getTesterById(id);

  // Derive invite status
  const invite = tester.invitations[tester.invitations.length - 1];
  let inviteState = "not_generated";
  if (invite) {
    if (invite.usedAt) inviteState = "used";
    else if (invite.revokedAt) inviteState = "revoked";
    else if (new Date() > invite.expiresAt) inviteState = "expired";
    else inviteState = "active";
  }

  // Query assignments
  const assignments = await db.query.testingAssignments.findMany({
    where: eq(schema.testingAssignments.testerProfileId, id),
    with: {
      product: true,
      revision: true,
      sample: true,
    },
    orderBy: (asg, { desc }) => [desc(asg.createdAt)],
  });

  // Query audit logs
  const activityLogs = await db.query.activityLogs.findMany({
    where: and(
      eq(schema.activityLogs.targetType, "tester_profile"),
      eq(schema.activityLogs.targetId, id)
    ),
    orderBy: [desc(schema.activityLogs.createdAt)],
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={tester.displayName}
        eyebrow="Tester Profile Manager"
        description="Manage tester activation workflows, security credentials, and active dispatch briefs."
        backHref="/owner/testers"
        backLabel="Back to testers directory"
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 bg-kavri-surface border border-kavri-line rounded-md text-kavri-ink font-semibold">
              Invite: {inviteState.replace("_", " ")}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 border rounded-md uppercase ${
              tester.approvalStatus === "approved"
                ? "bg-[#e8f5ec] text-[#257a47] border-[#d1ecd9]"
                : tester.approvalStatus === "deactivated"
                ? "bg-[#f9e9e7] text-[#b33a32] border-[#f5d6d4]"
                : "bg-[#fff5d8] text-[#986b11] border-[#faecd1]"
            }`}>
              {tester.approvalStatus}
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile details */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-kavri-muted" />
              <span>Profile Information</span>
            </h3>
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Full Name</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{tester.displayName}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Normalized Email</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{tester.emailNormalized}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Approval Status</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] uppercase">{tester.approvalStatus}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Onboarded User Link</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
                    {tester.userId ? `Linked (User ID: ${tester.userId.slice(0, 8)})` : "No Credentials Active"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Access Control & Invite Generator Action block */}
          <TesterActions
            testerId={id}
            approvalStatus={tester.approvalStatus}
            isRegistered={!!tester.userId}
          />

          {/* Assignments History */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-kavri-muted" />
              <span>Assignments History</span>
            </h3>
            
            {assignments.length === 0 ? (
              <p className="text-xs text-kavri-muted font-sans py-2">No assignments dispatched to this tester.</p>
            ) : (
              <div className="divide-y divide-kavri-line/60">
                {assignments.map((asg) => (
                  <div 
                    key={asg.id} 
                    className="flex justify-between items-center py-3 first:pt-0 last:pb-0 font-sans text-xs"
                  >
                    <div>
                      <Link 
                        href={`/owner/assignments/${asg.id}`} 
                        className="font-bold text-kavri-ink hover:underline"
                      >
                        Sample <span className="font-mono">{asg.sample.sampleCode}</span> ({asg.product.internalName})
                      </Link>
                      <p className="text-[10px] text-kavri-muted mt-0.5">
                        Due: {new Date(asg.dueAt).toLocaleDateString()} | Sessions: {asg.requiredSessionCount}
                      </p>
                    </div>
                    <StatusBadge status={asg.status as "draft" | "active" | "acknowledged" | "revoked" | "expired"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
          <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-kavri-muted" />
            <span>Triage & Audit History</span>
          </h3>
          
          {activityLogs.length === 0 ? (
            <p className="text-xs text-kavri-muted font-sans">No audit logs recorded.</p>
          ) : (
            <div className="relative pl-5 border-l border-kavri-line space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="relative space-y-1 font-sans text-xs">
                  {/* Node */}
                  <span className="absolute -left-[24px] top-1 w-1.5 h-1.5 rounded-full bg-kavri-line-strong border border-kavri-surface" />
                  
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-kavri-ink">
                      {log.action.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </span>
                    <time className="font-mono text-[9px] text-kavri-muted">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  
                  {log.metadataJson && (
                    <p className="text-kavri-muted text-[10px] mt-0.5 bg-[#fafaf8] border border-kavri-line p-1.5 rounded-md font-mono overflow-x-auto max-w-full">
                      {log.metadataJson}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
