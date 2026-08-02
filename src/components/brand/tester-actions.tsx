"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTesterApprovalAction, generateInvitationAction, declineTesterAction } from "@/server/actions/tester-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { KeyRound, ShieldAlert, Copy, Check } from "lucide-react";

interface TesterActionsProps {
  testerId: string;
  approvalStatus: string;
  isRegistered: boolean;
}

export function TesterActions({ testerId, approvalStatus, isRegistered }: TesterActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleApprovalChange = async (status: "approved" | "deactivated") => {
    setIsPending(true);
    try {
      await updateTesterApprovalAction(testerId, status);
      toast.success(`Tester profile status updated to '${status}'.`);
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update approval status.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining this application.");
      return;
    }
    setIsPending(true);
    try {
      await declineTesterAction(testerId, { reason: declineReason });
      toast.success("Tester application declined.");
      setDeclineOpen(false);
      setDeclineReason("");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to decline tester application.");
    } finally {
      setIsPending(false);
    }
  };

  const handleGenerateInvitation = async () => {
    setIsPending(true);
    try {
      const result = await generateInvitationAction(testerId);
      const url = `${window.location.origin}/invite/${result.rawToken}`;
      setInvitationUrl(url);
      toast.success("One-time secure invitation generated successfully.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to generate invitation link.");
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = () => {
    if (invitationUrl) {
      navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status control buttons */}
      <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
        <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5 border-b border-kavri-line pb-2.5">
          <KeyRound className="h-4 w-4 text-kavri-muted" />
          <span>Access Controls</span>
        </h3>
        <div className="flex flex-wrap gap-3 pt-1">
          {approvalStatus === "pending" && (
            <Button
              onClick={() => handleApprovalChange("approved")}
              disabled={isPending}
              className="bg-kavri-signal text-kavri-ink font-sans font-bold hover:bg-[#c4dd40] text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all"
            >
              Approve Tester
            </Button>
          )}

          {approvalStatus === "pending" && !declineOpen && (
            <Button
              onClick={() => setDeclineOpen(true)}
              disabled={isPending}
              variant="outline"
              className="font-sans font-semibold text-xs h-10 px-4 rounded-lg border-kavri-line"
            >
              Decline Application
            </Button>
          )}

          {/* Deactivate only applies once a tester has actually been approved - matching the
              server-side guard in updateTesterApproval, which now rejects this for a pending
              or declined tester (there is no active access to deactivate). */}
          {approvalStatus === "approved" && (
            <Button
              onClick={() => handleApprovalChange("deactivated")}
              disabled={isPending}
              className="bg-[#f9e9e7] hover:bg-[#f2d7d4] text-[#b33a32] border border-[#f5d6d4] font-sans font-semibold text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-[#b33a32] transition-all"
            >
              Deactivate Access
            </Button>
          )}

          {approvalStatus === "approved" && !isRegistered && (
            <Button
              onClick={handleGenerateInvitation}
              disabled={isPending}
              className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans font-bold text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all"
            >
              Generate Invitation
            </Button>
          )}
        </div>

        {declineOpen && (
          <div className="border border-red-200 bg-red-50/50 rounded-lg p-4 space-y-3">
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining this application (required)..."
              className="text-xs min-h-[70px] bg-white"
              disabled={isPending}
            />
            <div className="flex gap-2">
              <Button onClick={handleDecline} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold h-8 px-3 rounded-md">
                Confirm Decline
              </Button>
              <Button variant="outline" onClick={() => setDeclineOpen(false)} disabled={isPending} className="text-[11px] font-semibold h-8 px-3 rounded-md">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Copyable raw token warning dialog modal */}
      {invitationUrl && (
        <div className="border border-red-200 bg-red-50/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-red-200 pb-2.5">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h4 className="font-heading text-xs font-black uppercase tracking-wider text-red-900">
              One-Time Secure Invitation Link
            </h4>
          </div>
          
          <div className="space-y-4 text-xs font-sans">
            <p className="text-red-700 font-semibold uppercase tracking-wide text-[10px]">
              Warning: This URL will only be displayed ONCE. Copy it now. It cannot be retrieved again after closing.
            </p>
            <div className="flex items-center gap-2 p-2.5 bg-white border border-red-200 rounded-lg">
              <input
                type="text"
                readOnly
                value={invitationUrl}
                className="flex-1 bg-transparent text-xs font-mono text-kavri-ink focus:outline-none"
              />
              <Button
                onClick={handleCopy}
                className="h-8 text-[11px] font-sans font-bold bg-kavri-ink text-white hover:bg-neutral-800 px-3 rounded-md flex items-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setInvitationUrl(null)}
                className="text-[11px] font-sans font-semibold border-red-200 bg-white hover:bg-red-50 text-red-800 h-9 px-4 rounded-lg transition-all"
              >
                Close Secure Link Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
