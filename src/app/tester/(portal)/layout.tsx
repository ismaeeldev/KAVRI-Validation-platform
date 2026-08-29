import React from "react";
import type { Metadata } from "next";
import { requireActiveTester } from "@/lib/permissions";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import { TesterSignOutButton } from "@/components/brand/tester-sign-out-button";
import Link from "next/link";

import { redirect } from "next/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TesterLayout({ children }: { children: React.ReactNode }) {
  // Enforce active tester authorization checks at the layout level. src/middleware.ts does a cheap
  // cookie check first (and preserves the intended deep-link as ?next=), but this server-side
  // check is the actual authorization boundary.
  let session;
  try {
    const result = await requireActiveTester();
    session = result.session;
  } catch {
    // Step 6 / Decision 3: testers sign in with a magic link, not the password page at /login.
    redirect("/tester/login");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground flex flex-col">
      {/* Header bar designed for mobile-first views */}
      <header className="sticky top-0 z-50 w-full border-b border-kavri-line bg-kavri-surface/90 backdrop-blur-md px-4 py-3 select-none">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <Link href="/tester" className="shrink-0">
            <KAVRIWordmark />
          </Link>
          <div className="flex min-w-0 items-center gap-3 font-mono text-[10px]">
            <span className="text-kavri-muted truncate">{session.user.name}</span>
            <TesterSignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
