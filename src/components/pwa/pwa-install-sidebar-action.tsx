"use client";

import { Download } from "lucide-react";
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt";

/** Persistent desktop install entry in the owner sidebar footer. */
export function PwaInstallSidebarAction() {
  const { canInstall, install, installing } = usePwaInstallPrompt();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => void install()}
      disabled={installing}
      className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 text-xs font-sans font-medium text-kavri-ink bg-kavri-signal-soft hover:bg-kavri-signal/30 rounded-md border border-kavri-signal/40 transition-all focus-visible:outline-2 focus-visible:outline-kavri-signal disabled:opacity-60"
    >
      <Download className="h-3.5 w-3.5" aria-hidden />
      <span>{installing ? "Installing…" : "Install desktop app"}</span>
    </button>
  );
}
