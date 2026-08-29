import React, { Suspense } from "react";
import {
  getPublicUpdatesFeed,
  getPublicProducts,
  getPublicMetrics,
  getPublicWhatChangedAndWhy,
  getPublicSampleSummaries,
  type PublicUpdateDTO,
  type PublicProductDTO,
  type PublicWhatChangedDTO,
  type PublicSampleSummaryDTO,
} from "@/server/services/public-queries-service";

import { LandingNav } from "@/components/brand/landing-nav";
import {
  LandingHero,
  LandingValidationProgress,
} from "@/components/brand/landing-hero";
import {
  LandingWhatWeAreBuilding,
  LandingHowWeValidate,
  LandingWhatChangedAndWhy,
  LandingAboutKavri,
} from "@/components/brand/landing-info-sections";
import { LandingMetrics } from "@/components/brand/landing-metrics";
import { LandingActiveSpecs } from "@/components/brand/landing-active-specs";
import { LandingTimeline } from "@/components/brand/landing-timeline";
import {
  LandingValues,
  LandingNewsletterCTA,
  LandingFooter,
} from "@/components/brand/landing-sections";
import { UtmProvider } from "@/components/brand/landing-utm-context";
import { LandingBootGate } from "@/components/brand/landing-boot-gate";
import { LandingBootInlineScript } from "@/components/brand/landing-boot-inline-script";
import { LandingSmoothScroll } from "@/components/brand/landing-smooth-scroll";

export const revalidate = 60;

export default async function PublicLandingPage() {
  let updates: PublicUpdateDTO[] = [];
  let products: PublicProductDTO[] = [];
  let whatChanged: PublicWhatChangedDTO[] = [];
  let sampleSummaries: PublicSampleSummaryDTO[] = [];
  let metrics = {
    revisionsCount: 0,
    samplesReceived: 0,
    approvedTesters: 0,
    activeAssignments: 0,
    publishedUpdates: 0,
  };
  let isOfflineFallback = false;

  try {
    [updates, products, metrics, whatChanged, sampleSummaries] = await Promise.all([
      getPublicUpdatesFeed(),
      getPublicProducts(),
      getPublicMetrics(),
      getPublicWhatChangedAndWhy(),
      getPublicSampleSummaries(),
    ]);
  } catch (error) {
    console.warn(
      "Database connection failed. Entering local preview fallback state:",
      error
    );
    isOfflineFallback = true;
  }

  const featuredProduct = products[0] ?? null;

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
    <div className="landing-premium min-h-screen flex flex-col antialiased">
      <LandingBootInlineScript />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {isOfflineFallback && (
        <div
          role="alert"
          className="bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] text-center py-2 font-mono text-[10px] uppercase tracking-wider border-b border-white/10 select-none z-[60] relative"
        >
          Local Preview Fallback Mode (Database Connection Unreachable)
        </div>
      )}

      <Suspense fallback={null}>
        <UtmProvider>
          <LandingBootGate>
          <LandingSmoothScroll>
          <LandingNav />

          <main className="flex-1">
            <LandingHero />
            <LandingValidationProgress />
            <LandingActiveSpecs
              product={featuredProduct}
              sampleSummaries={sampleSummaries}
            />
            <LandingHowWeValidate />
            <LandingWhatWeAreBuilding products={products} />
            <LandingMetrics metrics={metrics} />
            <LandingWhatChangedAndWhy decisions={whatChanged} />
            <LandingTimeline updates={updates} />
            <LandingValues />
            <LandingNewsletterCTA />
            <LandingAboutKavri />
          </main>

          <LandingFooter />
          </LandingSmoothScroll>
          </LandingBootGate>
        </UtmProvider>
      </Suspense>
    </div>
  );
}
