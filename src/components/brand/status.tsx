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
    case ASSIGNMENT_STATUS.ACTIVE:
      badgeStyles = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      labelText = "ACTIVE";
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
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-mono font-bold tracking-wider uppercase select-none ${badgeStyles} ${className}`}
    >
      {labelText}
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
