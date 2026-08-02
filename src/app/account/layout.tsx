import React from "react";
import type { Metadata } from "next";
import { requireSession } from "@/lib/permissions";
import { redirect } from "next/navigation";

// account/security/page.tsx is a "use client" component with no server-side auth check of its
// own (the change-password form only fails at submit time if unauthenticated) - this layout is
// the actual gate. Found missing during the Step 16 logged-out-access audit.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireSession();
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
