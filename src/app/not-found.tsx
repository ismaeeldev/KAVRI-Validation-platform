import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-center">
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Page Not Found</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        The page you are looking for does not exist, has been archived, or moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none"
      >
        Go to Landing Page
      </Link>
    </div>
  );
}
