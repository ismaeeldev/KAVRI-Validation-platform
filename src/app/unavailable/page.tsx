import React from "react";
import { Unavailable } from "@/components/states/unavailable";

export default function UnavailablePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Unavailable />
      </div>
    </div>
  );
}
