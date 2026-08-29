"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { KAVRIWordmark } from "@/components/brand/wordmark";

export function OfflinePageContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-kavri-paper text-kavri-ink">
      <div className="max-w-md w-full text-center space-y-6">
        <KAVRIWordmark className="text-2xl" />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-kavri-surface border border-kavri-line">
          <WifiOff className="h-7 w-7 text-kavri-muted" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-xl font-bold tracking-tight">You&apos;re offline</h1>
          <p className="text-sm text-kavri-muted leading-relaxed">
            Cached workspace pages may still be available. Reconnect to save changes, sync data, and
            access live validation records.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/owner"
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-kavri-ink text-kavri-paper text-sm font-semibold"
          >
            Open Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-kavri-line text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
