"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSerwist } from "@serwist/turbopack/react";

/** Notify when a new service worker is waiting — one-click refresh for desktop workspace users. */
export function PwaUpdateNotifier() {
  const { serwist } = useSerwist();

  useEffect(() => {
    if (!serwist) return;

    const onWaiting = () => {
      toast("Update available", {
        description: "A new version of KAVRI is ready. Refresh to apply.",
        duration: Infinity,
        action: {
          label: "Refresh",
          onClick: () => {
            serwist.messageSW({ type: "SKIP_WAITING" });
            window.location.reload();
          },
        },
      });
    };

    serwist.addEventListener("waiting", onWaiting);
    return () => {
      serwist.removeEventListener("waiting", onWaiting);
    };
  }, [serwist]);

  return null;
}
