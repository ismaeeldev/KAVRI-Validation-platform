"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { PWA_SW_URL } from "@/lib/pwa/config";
import { PwaUpdateNotifier } from "@/components/pwa/pwa-update-notifier";

export function PwaRootProvider({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider
      swUrl={PWA_SW_URL}
      disable={process.env.NODE_ENV === "development"}
      register
      reloadOnOnline
    >
      <PwaUpdateNotifier />
      {children}
    </SerwistProvider>
  );
}
