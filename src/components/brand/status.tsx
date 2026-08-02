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
      badgeStyles = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      labelText = "ACTIVE";
      break;
    case "invited":
    case ASSIGNMENT_STATUS.INVITED:
      badgeStyles = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      labelText = "INVITED";
      break;
    case "first_impression_due":
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      labelText = "FIRST IMPRESSION DUE";
      break;
    case "follow_up_due":
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      labelText = "FOLLOW-UP DUE";
      break;
    case "complete":
      badgeStyles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
      labelText = "COMPLETE";
      break;
    case "acknowledged":
    case ASSIGNMENT_STATUS.ACKNOWLEDGED:
      badgeStyles = "bg-kavri-signal/20 text-kavri-signal-ink dark:text-kavri-signal border-kavri-signal/50";
      labelText = "ACKNOWLEDGED";
      break;
    case "received":
    case SAMPLE_STATUS.RECEIVED:
      badgeStyles = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      labelText = "RECEIVED";
      break;
    case "under_review":
    case SAMPLE_STATUS.UNDER_REVIEW:
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      labelText = "UNDER REVIEW";
      break;
    case "ready_for_testing":
    case SAMPLE_STATUS.READY_FOR_TESTING:
      badgeStyles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
      labelText = "READY FOR TESTING";
      break;
    case "blocked":
    case SAMPLE_STATUS.BLOCKED:
      badgeStyles = "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900";
      labelText = "BLOCKED";
      break;
    case "rejected":
    case SAMPLE_STATUS.REJECTED:
      badgeStyles = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";
      labelText = "REJECTED";
      break;
    case "revoked":
    case ASSIGNMENT_STATUS.REVOKED:
      badgeStyles = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";
      labelText = "REVOKED";
      break;
    case "expired":
    case ASSIGNMENT_STATUS.EXPIRED:
      badgeStyles = "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-900";
      labelText = "EXPIRED";
      break;
    case "published":
    case PUBLIC_UPDATE_STATE.PUBLISHED:
      badgeStyles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
      labelText = "PUBLISHED";
      break;
    case "archived":
    case PUBLIC_UPDATE_STATE.ARCHIVED:
      badgeStyles = "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-900";
      labelText = "ARCHIVED";
      break;
    case "under_evaluation":
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      labelText = "UNDER EVALUATION";
      break;
    case "inactive":
      badgeStyles = "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-900";
      labelText = "INACTIVE";
      break;
    case "recruiting":
      badgeStyles = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      labelText = "RECRUITING";
      break;
    case "review":
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      labelText = "REVIEW";
      break;
    case "closed":
      badgeStyles = "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-900";
      labelText = "CLOSED";
      break;
    case "submitted":
      badgeStyles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
      labelText = "SUBMITTED";
      break;
    case "updated":
      badgeStyles = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      labelText = "UPDATED (CORRECTED)";
      break;
    case "open":
      badgeStyles = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";
      labelText = "OPEN";
      break;
    case "monitoring":
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      labelText = "MONITORING";
      break;
    case "resolved":
      badgeStyles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
      labelText = "RESOLVED";
      break;
    case "internal_review":
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      labelText = "INTERNAL REVIEW";
      break;
    case "approved":
      badgeStyles = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      labelText = "APPROVED";
      break;
    case "scheduled":
      badgeStyles = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";
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
      badgeStyles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      label = "MODERATE";
      break;
    case "high":
      badgeStyles = "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900";
      label = "HIGH";
      glyph = "⚠ ";
      break;
    case "stop_use":
      badgeStyles = "bg-red-600 text-white border-red-700 font-black";
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
      <span className="font-mono text-base font-bold text-kavri-ink dark:text-foreground mt-1 leading-none tracking-tight">
        {code}
      </span>
    </div>
  );
}
