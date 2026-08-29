import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import { TesterMagicLinkForm } from "@/components/brand/tester-magic-link-form";

export const metadata: Metadata = {
  title: "Tester Sign In",
  robots: { index: false, follow: false },
};

// Step 6 / Decision 3: testers have no password. This page only collects an email address and
// asks better-auth's magic-link plugin to send a one-time sign-in link. It deliberately lives
// OUTSIDE the (portal) route group so it is not wrapped by the authenticated tester layout.
// The owner/admin login at /login is a separate page and is unchanged.
export default function TesterLoginPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center p-4 bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground">
      <div className="mb-8 select-none">
        <KAVRIWordmark />
      </div>

      <Suspense fallback={null}>
        <TesterMagicLinkForm />
      </Suspense>

      <Link
        href="/login"
        className="mt-6 font-mono text-[10px] uppercase tracking-wider text-kavri-muted hover:text-kavri-ink dark:hover:text-foreground transition-colors text-center"
      >
        KAVRI staff sign-in
      </Link>
    </div>
  );
}
