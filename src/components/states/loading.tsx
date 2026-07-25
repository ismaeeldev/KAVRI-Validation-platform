import React from "react";

export function LoadingState({ message = "Loading information..." }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
