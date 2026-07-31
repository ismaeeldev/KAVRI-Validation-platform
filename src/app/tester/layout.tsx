import React from "react";
import type { Metadata } from "next";
import { requireActiveTester } from "@/lib/permissions";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import Link from "next/link";

import { redirect } from "next/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TesterLayout({ children }: { children: React.ReactNode }) {
  // Enforce active tester authorization checks at the layout level
  let session;
  try {
    const result = await requireActiveTester();
    session = result.session;
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground flex flex-col">
      {/* Header bar designed for mobile-first views */}
      <header className="sticky top-0 z-50 w-full border-b border-kavri-line bg-kavri-surface/90 backdrop-blur-md px-4 py-3 select-none">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/tester">
            <KAVRIWordmark />
          </Link>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="text-kavri-muted">{session.user.name}</span>
            <form
              action={async () => {
                "use server";
                // Let's redirect to a logout route or clear session client-side.
                // For simplicity, a standard link redirecting to login works, but we can also use Better Auth signout client-side.
                // Let's sign out from server action.
                // We'll redirect to a client sign-out trigger or login.
              }}
            >
              <Link
                href="/login"
                className="text-destructive hover:underline uppercase font-bold"
              >
                Sign Out
              </Link>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">{children}</main>
    </div>
  );
}
