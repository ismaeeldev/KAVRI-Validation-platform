"use client";

import React, { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";

interface UtmAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  refCode?: string;
}

const UtmContext = createContext<UtmAttribution>({});

// Reads UTM/referral params client-side (via useSearchParams) rather than the server page's
// searchParams prop, so the landing page itself can stay ISR-cacheable (Step 17 performance
// fix) instead of being forced fully dynamic just to capture marketing attribution.
export function UtmProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const value: UtmAttribution = {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    refCode: params.get("ref") || undefined,
  };
  return <UtmContext.Provider value={value}>{children}</UtmContext.Provider>;
}

export function useUtmAttribution(): UtmAttribution {
  return useContext(UtmContext);
}
