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

// Landing section components
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

// UTM/referral capture moved to client-side (UtmProvider, via useSearchParams) rather than
// reading the server page's searchParams prop - that prop would force this whole page into
// fully dynamic per-request rendering, which measurably hurt LCP (Step 17 performance fix).
// A 60s revalidate window is an acceptable freshness tradeoff for a public marketing page.
export const revalidate = 60;

export default async function PublicLandingPage() {
  // ── Data fetching with offline fallback ──────────────────────────────────
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

  // M5: production domain not yet confirmed - falls back to NEXT_PUBLIC_APP_URL.
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
    <div className="min-h-screen bg-[#f7f7f3] text-kavri-ink flex flex-col font-sans antialiased selection:bg-kavri-signal selection:text-kavri-signal-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Offline fallback banner */}
      {isOfflineFallback && (
        <div
          role="alert"
          className="bg-kavri-ink text-kavri-paper text-center py-2 font-mono text-[10px] uppercase tracking-wider border-b border-kavri-line select-none"
        >
          ⚠️ Local Preview Fallback Mode (Database Connection Unreachable)
        </div>
      )}

      <Suspense fallback={null}>
        <UtmProvider>
          {/* Header / Navigation */}
          <LandingNav />

          <main className="flex-1">
            {/* 1. Hero */}
            <LandingHero />

            {/* 2. Current Build Status (repurposed Live Validation Progress rail) */}
            <LandingValidationProgress />

            {/* 3. What We Are Building */}
            <LandingWhatWeAreBuilding products={products} />

            {/* 4. How KAVRI Validates */}
            <LandingHowWeValidate />

            {/* 5. Current Test Focus (repurposed Active Specs) */}
            <LandingActiveSpecs product={featuredProduct} sampleSummaries={sampleSummaries} />

            {/* 6. Validation Snapshot (repurposed Metrics, zero-value cards hidden) */}
            <LandingMetrics metrics={metrics} />

            {/* 7. What Changed and Why */}
            <LandingWhatChangedAndWhy decisions={whatChanged} />

            {/* 8. Development Log (repurposed Testing Log / Timeline) */}
            <LandingTimeline updates={updates} />

            {/* 9. Why KAVRI Tests (repurposed Values) */}
            <LandingValues />

            {/* 10. Join the Build (repurposed Newsletter CTA) */}
            <LandingNewsletterCTA />

            {/* 11. About KAVRI */}
            <LandingAboutKavri />
          </main>

          {/* 12. Footer */}
          <LandingFooter />
        </UtmProvider>
      </Suspense>
    </div>
  );
}
