import React from "react";
import {
  getPublicUpdatesFeed,
  getPublicProducts,
  type PublicUpdateDTO,
  type PublicProductDTO,
} from "@/server/services/public-queries-service";

import { UtmProvider } from "@/components/brand/landing-utm-context";
import { HeldChargeIconSprite } from "@/components/brand/held-charge-icon-sprite";
import { HeldChargeHeader } from "@/components/brand/held-charge-header";
import { HeldChargeHero } from "@/components/brand/held-charge-hero";
import { HeldChargeCurrentDevelopment } from "@/components/brand/held-charge-current-development";
import { HeldChargePaddleArchitecture } from "@/components/brand/held-charge-paddle-architecture";
import { HeldChargeDevelopmentLoop } from "@/components/brand/held-charge-development-loop";
import { HeldChargeRealPlayerInput } from "@/components/brand/held-charge-real-player-input";
import { HeldChargeDevelopmentLog } from "@/components/brand/held-charge-development-log";
import { HeldChargeWhyKavri } from "@/components/brand/held-charge-why-kavri";
import { HeldChargeSignup } from "@/components/brand/held-charge-signup";
import { HeldChargeFooter } from "@/components/brand/held-charge-footer";

export const revalidate = 60;

export default async function PublicLandingPage() {
  let updates: PublicUpdateDTO[] = [];
  let products: PublicProductDTO[] = [];
  let isOfflineFallback = false;

  try {
    [updates, products] = await Promise.all([
      getPublicUpdatesFeed(),
      getPublicProducts(),
    ]);
  } catch (error) {
    console.warn(
      "Database connection failed. Entering local preview fallback state:",
      error
    );
    isOfflineFallback = true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kavri.co";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "KAVRI",
        url: appUrl,
        logo: `${appUrl}/paddle-hero.png`,
      },
      {
        "@type": "WebSite",
        name: "KAVRI Validation Platform",
        url: appUrl,
      },
    ],
  };

  return (
    <div className="landing-held-charge min-h-screen flex flex-col antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {isOfflineFallback && (
        <div
          role="alert"
          className="bg-[var(--kv-ignition)] text-[var(--kv-pressure-ink)] text-center py-2 font-mono text-[10px] uppercase tracking-wider border-b border-white/10 select-none z-[60] relative"
        >
          Local Preview Fallback Mode (Database Connection Unreachable)
        </div>
      )}

      <UtmProvider>
        <HeldChargeIconSprite />
        <HeldChargeHeader />

        <main className="flex-1">
          <HeldChargeHero />
          <HeldChargeCurrentDevelopment products={products} />
          <HeldChargePaddleArchitecture />
          <HeldChargeDevelopmentLoop />
          <HeldChargeRealPlayerInput />
          <HeldChargeDevelopmentLog updates={updates} />
          <HeldChargeWhyKavri />
          <HeldChargeSignup />
        </main>

        <HeldChargeFooter />
      </UtmProvider>
    </div>
  );
}
