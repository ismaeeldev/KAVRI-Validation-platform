"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTesterApprovalAction, sendTesterInvitationAction, declineTesterAction } from "@/server/actions/tester-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { KeyRound, ShieldAlert, Copy, Check, Mail, AlertTriangle, Info } from "lucide-react";

// Plain-language "what does this status mean + what can I do next" copy, keyed by
// approvalStatus. Shown above the action buttons so the owner never has to guess why a control
// is (or isn't) available - Part C of Step 05.
const STATUS_EXPLANATIONS: Record<string, string> = {
  pending: "Awaiting review. Approve to grant portal access, or decline the application.",
  approved: "Active and can be invited/dispatched. Deactivate to suspend access without deleting the record.",
  deactivated: "Access is suspended. Reactivate to restore this tester to approved status, or leave deactivated.",
  declined: "Application was declined and has no further actions here.",
};

interface TesterActionsProps {
  testerId: string;
  approvalStatus: string;
  isRegistered: boolean;
  /** Whether an active (unused, unrevoked, unexpired) invitation already exists - drives the
   * "Send Invitation" vs "Resend Invitation" label so the owner-facing action reflects reality. */
  hasActiveInvitation?: boolean;
  /** Reports the server action's own return value back to the parent client wrapper so the
   * header status pill and Profile Information fields update immediately, with no server
   * round-trip (router.refresh() / reload) required for the UI to reflect the new state. */
  onUpdate?: (updated: { approvalStatus?: string; declinedReason?: string | null }) => void;
}

type EmailSendState = "idle" | "sending" | "sent" | "error";

export function TesterActions({ testerId, approvalStatus, isRegistered, hasActiveInvitation = false, onUpdate }: TesterActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [emailSendState, setEmailSendState] = useState<EmailSendState>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleApprovalChange = async (status: "approved" | "deactivated") => {
    setIsPending(true);
    try {
      const result = await updateTesterApprovalAction(testerId, status);
      toast.success(`Tester profile status updated to '${status}'.`);
      // Previously this called window.location.reload() because router.refresh() alone left
      // the header status pill and "Approval Status" field stale for several seconds (a known
      // Next.js dev-mode Router Cache timing issue). Fixed properly in Step 05: the server
      // action's own return value drives the parent client wrapper's state directly, so the UI
      // updates instantly with no server round-trip needed.
      onUpdate?.({ approvalStatus: result.approvalStatus, declinedReason: result.declinedReason ?? null });
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
      const result = await declineTesterAction(testerId, { reason: declineReason });
      toast.success("Tester application declined.");
      // See handleApprovalChange above - fixed the same way, via onUpdate instead of a reload.
      onUpdate?.({ approvalStatus: result.approvalStatus, declinedReason: result.declinedReason ?? null });
      setDeclineOpen(false);
      setDeclineReason("");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to decline tester application.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSendInvitation = async () => {
    setIsPending(true);
    setEmailSendState("sending");
    setEmailError(null);
    try {
      const result = await sendTesterInvitationAction(testerId);
      const url = `${window.location.origin}/invite/${result.rawToken}`;
      setInvitationUrl(url);

      if (result.emailSent) {
        setEmailSendState("sent");
        toast.success(`Invitation email sent to the tester.`);
      } else {
        setEmailSendState("error");
        setEmailError(result.emailError || "Failed to send invitation email.");
        toast.error(result.emailError || "Failed to send invitation email. The secure link below was still generated - you can copy and send it manually.");
      }
      router.refresh();
    } catch (error: unknown) {
      // Token generation itself failed - no link was produced at all.
      const err = error as Error;
      setEmailSendState("error");
      setEmailError(err.message || "Failed to generate invitation.");
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
        {STATUS_EXPLANATIONS[approvalStatus] && (
          <div className="flex items-start gap-1.5 text-[11px] text-kavri-muted font-sans leading-relaxed bg-kavri-surface-subtle border border-kavri-line rounded-lg px-3 py-2">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-kavri-muted" />
            <span>{STATUS_EXPLANATIONS[approvalStatus]}</span>
          </div>
        )}
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

          {/* Reactivate: restores a previously-deactivated tester back to 'approved', matching
              the same button style, confirmation-free single-click pattern, toast, and
              activity-logging approach as Approve/Deactivate above. Closes the dead end where a
              deactivated tester previously had no path back to active status. */}
          {approvalStatus === "deactivated" && (
            <Button
              onClick={() => handleApprovalChange("approved")}
              disabled={isPending}
              className="bg-kavri-signal text-kavri-ink font-sans font-bold hover:bg-[#c4dd40] text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all"
            >
              Reactivate Tester
            </Button>
          )}

          {approvalStatus === "approved" && !isRegistered && (
            <Button
              onClick={handleSendInvitation}
              disabled={isPending}
              className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans font-bold text-xs h-10 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>
                {isPending && emailSendState === "sending"
                  ? "Sending…"
                  : hasActiveInvitation
                  ? "Resend Invitation"
                  : "Send Invitation"}
              </span>
            </Button>
          )}
        </div>

        {/* Explain why "Send Invitation" isn't offered yet, rather than the control silently
            disappearing with no reason given - extends the same "explain the disabled/missing
            control" pattern used elsewhere in the owner workspace (Part C). */}
        {approvalStatus === "approved" && isRegistered && (
          <p className="text-[11px] text-kavri-muted font-sans italic">
            This tester already has active portal credentials, so no invitation is needed.
          </p>
        )}
        {approvalStatus !== "approved" && (
          <p className="text-[11px] text-kavri-muted font-sans italic">
            Invitations can only be sent once this tester is approved.
          </p>
        )}

        {/* Real send-state feedback - no false-positive "sent" is ever shown; the thrown
            error from sendInvitationEmail is caught upstream and surfaced here verbatim. */}
        {emailSendState === "sent" && (
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-[#257a47]">
            <Check className="h-3.5 w-3.5" />
            <span>Invitation email sent.</span>
          </div>
        )}
        {emailSendState === "error" && (
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-[#b33a32]">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{emailError || "Failed to send invitation email."}</span>
          </div>
        )}

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
