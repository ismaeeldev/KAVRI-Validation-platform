import React from "react";
import { AccessDenied } from "@/components/states/access-denied";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <AccessDenied />
      </div>
    </div>
  );
}
