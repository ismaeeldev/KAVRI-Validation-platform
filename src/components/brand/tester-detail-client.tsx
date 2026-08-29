"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { TesterActions } from "@/components/brand/tester-actions";
import { Award } from "lucide-react";

interface TesterDetailClientProps {
  testerId: string;
  displayName: string;
  emailNormalized: string;
  initialApprovalStatus: string;
  initialDeclinedReason: string | null;
  isRegistered: boolean;
  hasActiveInvitation: boolean;
  inviteState: string;
  skillLevel: string | null;
  playingFrequency: string | null;
  currentPaddle: string | null;
  dominantHand: string | null;
  playStyle: string | null;
  consentAt: string | Date | null;
  consentTextVersion: string | null;
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

/**
 * Client wrapper holding the server-derived, mutation-sensitive fields for the tester detail
 * page: the header status pill and the "Approval Status"/decline-reason fields in the Profile
 * Information card, plus the Access Controls (TesterActions) block itself. These three spots all
 * need to reflect an approval-status change (approve/decline/deactivate/reactivate) the instant
 * the server action resolves - previously this required window.location.reload() because
 * router.refresh() alone left them stale. Now TesterActions reports the server action's own
 * return value back up via onUpdate, and this component's useState drives all three spots
 * directly, with no server round-trip needed for the UI to reflect the new state.
 */
export function TesterDetailClient({
  testerId,
  displayName,
  emailNormalized,
  initialApprovalStatus,
  initialDeclinedReason,
  isRegistered,
  hasActiveInvitation,
  inviteState,
  skillLevel,
  playingFrequency,
  currentPaddle,
  dominantHand,
  playStyle,
  consentAt,
  consentTextVersion,
  children,
  sidebar,
}: TesterDetailClientProps) {
  const [approvalStatus, setApprovalStatus] = useState(initialApprovalStatus);
  const [declinedReason, setDeclinedReason] = useState(initialDeclinedReason);

  const handleUpdate = (updated: { approvalStatus?: string; declinedReason?: string | null }) => {
    if (updated.approvalStatus) setApprovalStatus(updated.approvalStatus);
    if ("declinedReason" in updated) setDeclinedReason(updated.declinedReason ?? null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={displayName}
        eyebrow="Tester Profile Manager"
        description="Manage tester activation workflows, security credentials, and active dispatch briefs."
        backHref="/owner/testers"
        backLabel="Back to testers directory"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/owner/testers/${testerId}/edit`}
              className="border border-kavri-line-strong hover:bg-kavri-surface-subtle text-xs font-sans font-semibold px-4 py-2 h-9 rounded-lg transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-kavri-signal"
            >
              Edit Profile
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 bg-kavri-surface border border-kavri-line rounded-md text-kavri-ink font-semibold">
              Invite: {inviteState.replace("_", " ")}
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 border rounded-md uppercase ${
                approvalStatus === "approved"
                  ? "bg-[#e8f5ec] text-[#257a47] border-[#d1ecd9]"
                  : approvalStatus === "deactivated"
                  ? "bg-[#f9e9e7] text-[#b33a32] border-[#f5d6d4]"
                  : approvalStatus === "declined"
                  ? "bg-gray-100 text-gray-700 border-gray-200"
                  : "bg-[#fff5d8] text-[#986b11] border-[#faecd1]"
              }`}
            >
              {approvalStatus}
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-kavri-muted" />
              <span>Profile Information</span>
            </h3>
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Full Name</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{displayName}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Normalized Email</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">{emailNormalized}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Approval Status</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px] uppercase">{approvalStatus}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Onboarded User Link</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[13px]">
                    {isRegistered ? "Linked (credentials active)" : "No Credentials Active"}
                  </p>
                </div>
              </div>
              {approvalStatus === "declined" && declinedReason && (
                <div className="pt-2">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Decline Reason</span>
                  <p className="text-kavri-ink mt-0.5 italic">{declinedReason}</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-kavri-line">
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Skill</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[12px]">{skillLevel || "—"}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Frequency</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[12px] capitalize">{playingFrequency?.split("_").join(" ") || "—"}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Current Paddle</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[12px]">{currentPaddle || "—"}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Dominant Hand</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[12px] capitalize">{dominantHand?.split("_").join(" ") || "—"}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Play Style</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[12px] capitalize">{playStyle?.split(",").join(", ") || "—"}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Consent</span>
                  <p className="font-semibold text-kavri-ink mt-0.5 text-[12px]">
                    {consentAt ? `${new Date(consentAt).toLocaleDateString()} (${consentTextVersion})` : "Not yet given"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <TesterActions
            testerId={testerId}
            approvalStatus={approvalStatus}
            isRegistered={isRegistered}
            hasActiveInvitation={hasActiveInvitation}
            onUpdate={handleUpdate}
          />

          {children}
        </div>

        <div className="lg:col-span-4 border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
          {sidebar}
        </div>
      </div>
    </div>
  );
}
