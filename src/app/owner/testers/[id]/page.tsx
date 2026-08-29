import React from "react";
import Link from "next/link";
import { getTesterById } from "@/server/services/tester-service";
import { StatusBadge } from "@/components/brand/status";
import { TesterDetailClient } from "@/components/brand/tester-detail-client";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { FileText, Clock } from "lucide-react";

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
    <TesterDetailClient
      testerId={id}
      displayName={tester.displayName}
      emailNormalized={tester.emailNormalized}
      initialApprovalStatus={tester.approvalStatus}
      initialDeclinedReason={tester.declinedReason}
      isRegistered={!!tester.userId}
      hasActiveInvitation={inviteState === "active"}
      inviteState={inviteState}
      skillLevel={tester.skillLevel}
      playingFrequency={tester.playingFrequency}
      currentPaddle={tester.currentPaddle}
      dominantHand={tester.dominantHand}
      playStyle={tester.playStyle}
      consentAt={tester.consentAt}
      consentTextVersion={tester.consentTextVersion}
      sidebar={
        <>
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
        </>
      }
    >
      {/* Assignments History - static, not affected by approval-status mutations */}
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
                <StatusBadge status={asg.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </TesterDetailClient>
  );
}
