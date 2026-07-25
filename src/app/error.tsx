"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/states/error-state";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Unhanded application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <ErrorState
          title="Critical Error Occurred"
          description="A serious system error interrupted the operation. Our team has been notified. Please retry."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
