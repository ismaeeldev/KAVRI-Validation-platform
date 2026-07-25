import React from "react";
import { LoadingState } from "@/components/states/loading";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingState message="Preparing the validation platform..." />
    </div>
  );
}
