import React from "react";
import { SAMPLE_STATUS, ASSIGNMENT_STATUS, PUBLIC_UPDATE_STATE } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  // Define semantic color styles matching themeGuideline.md
  let badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line";
  let labelText = status;

  switch (status) {
    case "draft":
    case PUBLIC_UPDATE_STATE.DRAFT:
      badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line";
      labelText = "DRAFT";
      break;
    case "active":
      // Shared by test-round status (stored) and the computed assignment progress label
      // (never stored) - both legitimately use the word "Active" for different concepts, which
      // is exactly why the assignment lifecycle value was renamed to 'invited' in Step 10.
      badgeStyles = "bg-kavri-info/10 text-kavri-info border-kavri-info/30";
      labelText = "ACTIVE";
      break;
    case "invited":
    case ASSIGNMENT_STATUS.INVITED:
      badgeStyles = "bg-kavri-info/10 text-kavri-info border-kavri-info/30";
      labelText = "INVITED";
      break;
    case "first_impression_due":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "FIRST IMPRESSION DUE";
      break;
    case "follow_up_due":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "FOLLOW-UP DUE";
      break;
    case "complete":
      badgeStyles = "bg-kavri-success/10 text-kavri-success border-kavri-success/30";
      labelText = "COMPLETE";
      break;
    case "acknowledged":
    case ASSIGNMENT_STATUS.ACKNOWLEDGED:
      badgeStyles = "bg-kavri-signal/20 text-kavri-signal-ink dark:text-kavri-signal border-kavri-signal/50";
      labelText = "ACKNOWLEDGED";
      break;
    case "received":
    case SAMPLE_STATUS.RECEIVED:
      badgeStyles = "bg-kavri-info/10 text-kavri-info border-kavri-info/30";
      labelText = "RECEIVED";
      break;
    case "under_review":
    case SAMPLE_STATUS.UNDER_REVIEW:
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "UNDER REVIEW";
      break;
    case "ready_for_testing":
    case SAMPLE_STATUS.READY_FOR_TESTING:
      badgeStyles = "bg-kavri-success/10 text-kavri-success border-kavri-success/30";
      labelText = "READY FOR TESTING";
      break;
    case "blocked":
    case SAMPLE_STATUS.BLOCKED:
      badgeStyles = "bg-kavri-danger/10 text-kavri-danger border-kavri-danger/30";
      labelText = "⛔ BLOCKED";
      break;
    case "rejected":
    case SAMPLE_STATUS.REJECTED:
      badgeStyles = "bg-kavri-danger/10 text-kavri-danger border-kavri-danger/30";
      labelText = "REJECTED";
      break;
    case "revoked":
    case ASSIGNMENT_STATUS.REVOKED:
      badgeStyles = "bg-kavri-danger/10 text-kavri-danger border-kavri-danger/30";
      labelText = "REVOKED";
      break;
    case "expired":
    case ASSIGNMENT_STATUS.EXPIRED:
      badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line-strong";
      labelText = "EXPIRED";
      break;
    case "published":
    case PUBLIC_UPDATE_STATE.PUBLISHED:
      badgeStyles = "bg-kavri-success/10 text-kavri-success border-kavri-success/30";
      labelText = "PUBLISHED";
      break;
    case "archived":
    case PUBLIC_UPDATE_STATE.ARCHIVED:
      badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line-strong";
      labelText = "ARCHIVED";
      break;
    case "under_evaluation":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "UNDER EVALUATION";
      break;
    case "inactive":
      badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line-strong";
      labelText = "INACTIVE";
      break;
    case "recruiting":
      badgeStyles = "bg-kavri-info/10 text-kavri-info border-kavri-info/30";
      labelText = "RECRUITING";
      break;
    case "review":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "REVIEW";
      break;
    case "closed":
      badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line-strong";
      labelText = "CLOSED";
      break;
    case "submitted":
      badgeStyles = "bg-kavri-success/10 text-kavri-success border-kavri-success/30";
      labelText = "SUBMITTED";
      break;
    case "updated":
      badgeStyles = "bg-kavri-info/10 text-kavri-info border-kavri-info/30";
      labelText = "UPDATED (CORRECTED)";
      break;
    // Decision 1: owner has manually unlocked this submitted evaluation for correction.
    case "reopened":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "REOPENED FOR EDITS";
      break;
    case "open":
      badgeStyles = "bg-kavri-danger/10 text-kavri-danger border-kavri-danger/30";
      labelText = "OPEN";
      break;
    case "monitoring":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "MONITORING";
      break;
    case "resolved":
      badgeStyles = "bg-kavri-success/10 text-kavri-success border-kavri-success/30";
      labelText = "RESOLVED";
      break;
    case "internal_review":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      labelText = "INTERNAL REVIEW";
      break;
    case "approved":
      badgeStyles = "bg-kavri-info/10 text-kavri-info border-kavri-info/30";
      labelText = "APPROVED";
      break;
    case "scheduled":
      badgeStyles = "bg-kavri-info/10 text-kavri-info border-kavri-info/30";
      labelText = "SCHEDULED";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-mono font-bold tracking-wider uppercase select-none ${badgeStyles} ${className}`}
    >
      {labelText}
    </span>
  );
}

interface IssueSeverityBadgeProps {
  severity: string;
  className?: string;
}

// Audit UX-08/P2-06: "Stop Use" severity must visibly stand out via color AND text, never
// color alone - every variant below pairs a distinct background/border with an explicit label
// and icon glyph so the distinction survives color-blindness or grayscale printing.
export function IssueSeverityBadge({ severity, className = "" }: IssueSeverityBadgeProps) {
  let badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line";
  let label = severity.toUpperCase();
  let glyph = "";

  switch (severity) {
    case "low":
      badgeStyles = "bg-kavri-surface-subtle text-kavri-muted border-kavri-line";
      label = "LOW";
      break;
    case "moderate":
      badgeStyles = "bg-kavri-warning/10 text-kavri-warning border-kavri-warning/30";
      label = "MODERATE";
      break;
    case "high":
      badgeStyles = "bg-kavri-danger/10 text-kavri-danger border-kavri-danger/40";
      label = "HIGH";
      glyph = "⚠ ";
      break;
    case "stop_use":
      badgeStyles = "bg-kavri-danger text-white border-kavri-danger font-black";
      label = "STOP USE";
      glyph = "⛔ ";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border text-[10px] font-mono font-bold tracking-wider uppercase select-none ${badgeStyles} ${className}`}
    >
      {glyph}
      {label}
    </span>
  );
}

interface RevisionStampProps {
  code: string;
  className?: string;
}

export function RevisionStamp({ code, className = "" }: RevisionStampProps) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center border border-kavri-line-strong dark:border-muted p-2 rounded-sm bg-kavri-surface dark:bg-card select-none ${className}`}
    >
      <span className="text-[9px] font-mono uppercase tracking-widest text-kavri-muted leading-none">
        REVISION
      </span>
      <span className="font-mono text-base font-bold text-kavri-ink dark:text-foreground mt-1 leading-none tracking-tight tabular-nums">
        {code}
      </span>
    </div>
  );
}
