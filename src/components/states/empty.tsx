import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No records found",
  description = "There are no entries to display at the moment.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-card">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
