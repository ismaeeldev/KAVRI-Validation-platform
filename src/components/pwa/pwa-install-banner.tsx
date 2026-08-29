"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Monitor, X } from "lucide-react";
import { PWA_APP_NAME } from "@/lib/pwa/config";
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt";

const DISMISS_KEY = "kavri-pwa-install-dismissed";

/** Desktop install prompt for the owner workspace — primary PWA audience. */
export function PwaInstallBanner() {
  const { canInstall, install, installing } = usePwaInstallPrompt();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canInstall) {
      setVisible(false);
      return;
    }
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);
  }, [canInstall]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    const accepted = await install();
    if (accepted) setVisible(false);
  }, [install]);

  if (!visible || !canInstall) return null;

  return (
    <div
      role="region"
      aria-label="Install KAVRI app"
      className="fixed bottom-5 right-5 z-[70] w-[min(100vw-2rem,22rem)] rounded-xl border border-kavri-line bg-kavri-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-kavri-ink text-kavri-signal">
          <Monitor className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-heading text-sm font-bold text-kavri-ink">Install {PWA_APP_NAME}</p>
          <p className="text-xs text-kavri-muted leading-relaxed">
            Pin the owner workspace to your desktop for fast access, offline shell, and app-like
            window controls.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-kavri-muted hover:text-kavri-ink hover:bg-kavri-surface-subtle"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void handleInstall()}
          disabled={installing}
          className="inline-flex flex-1 items-center justify-center gap-2 h-9 rounded-lg bg-kavri-ink text-kavri-paper text-xs font-bold disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {installing ? "Installing…" : "Install app"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="h-9 px-3 rounded-lg border border-kavri-line text-xs font-semibold text-kavri-muted"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
