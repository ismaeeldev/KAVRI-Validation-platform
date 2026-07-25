import React from "react";
import Link from "next/link";

interface UnavailableProps {
  title?: string;
  description?: string;
}

export function Unavailable({
  title = "Account Unavailable",
  description = "Your account is currently deactivated, pending approval, or unavailable. Please contact the administrator for assistance.",
}: UnavailableProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-border">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
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
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      <Link
        href="/"
        className="mt-6 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      >
        Go Home
      </Link>
    </div>
  );
}
