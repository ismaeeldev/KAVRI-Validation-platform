"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

type NetworkState = "online" | "offline" | "slow";

function getEffectiveType(): string | undefined {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; addEventListener?: (type: string, cb: () => void) => void; removeEventListener?: (type: string, cb: () => void) => void };
  };
  return nav.connection?.effectiveType;
}

function isSlowConnection(): boolean {
  const effectiveType = getEffectiveType();
  return effectiveType === "slow-2g" || effectiveType === "2g";
}

function NetworkStatusBanner() {
  const [state, setState] = useState<NetworkState>("online");
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    function evaluate() {
      if (!navigator.onLine) {
        setState("offline");
      } else if (isSlowConnection()) {
        setState("slow");
      } else {
        setState((prev) => {
          if (prev === "offline") {
            setReconnected(true);
            window.setTimeout(() => setReconnected(false), 3000);
          }
          return "online";
        });
      }
    }

    evaluate();
    window.addEventListener("online", evaluate);
    window.addEventListener("offline", evaluate);

    const nav = navigator as Navigator & {
      connection?: { addEventListener?: (type: string, cb: () => void) => void; removeEventListener?: (type: string, cb: () => void) => void };
    };
    nav.connection?.addEventListener?.("change", evaluate);

    return () => {
      window.removeEventListener("online", evaluate);
      window.removeEventListener("offline", evaluate);
      nav.connection?.removeEventListener?.("change", evaluate);
    };
  }, []);

  if (state === "online" && !reconnected) return null;

  const isOffline = state === "offline";
  const isSlow = state === "slow";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 text-xs font-sans font-semibold text-center transition-colors",
        isOffline && "bg-kavri-danger/10 text-kavri-danger border-b border-kavri-danger/30",
        isSlow && "bg-kavri-warning/10 text-kavri-warning border-b border-kavri-warning/30",
        reconnected && state === "online" && "bg-kavri-success/10 text-kavri-success border-b border-kavri-success/30"
      )}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>You&apos;re offline. Changes won&apos;t save until your connection returns.</span>
        </>
      ) : isSlow ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Slow connection detected. Some actions may take longer than usual.</span>
        </>
      ) : (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Back online.</span>
        </>
      )}
    </div>
  );
}

export { NetworkStatusBanner };
