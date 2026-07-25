import React from "react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "An error occurred",
  description = "Something went wrong while retrieving or processing the request. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-destructive/20 p-8 text-center bg-destructive/5">
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90 focus-visible:outline-none"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
