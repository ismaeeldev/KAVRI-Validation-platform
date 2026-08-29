import React from "react";
import type { Metadata } from "next";
import { requireOwner } from "@/lib/permissions";
import { OwnerSidebar, OwnerMobileNav } from "@/components/brand/layout-shells";
import { OwnerPwaShell } from "@/components/pwa/owner-pwa-shell";

import { redirect } from "next/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  // Enforce owner authorization at the layout level for all nested routes
  try {
    await requireOwner();
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <OwnerPwaShell />
    </div>
  );
}
