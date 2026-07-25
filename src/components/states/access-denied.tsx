import React from "react";
import Link from "next/link";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export function AccessDenied({
  title = "Access Denied",
  description = "You do not have the required permissions to access this area.",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-border">
      <div className="rounded-full bg-warning/10 p-3 text-warning">
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
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      <Link
        href="/login"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none"
      >
        Sign In
      </Link>
    </div>
  );
}
