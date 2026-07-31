import React from "react";
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

export const revalidate = 0;

interface PublicLandingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PublicLandingPage({ searchParams }: PublicLandingPageProps) {
  const params = await searchParams;
  const utmSource = firstParam(params.utm_source);
  const utmMedium = firstParam(params.utm_medium);
  const utmCampaign = firstParam(params.utm_campaign);
  const ref = firstParam(params.ref);

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

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-kavri-ink flex flex-col font-sans antialiased selection:bg-kavri-signal selection:text-kavri-signal-ink">
      {/* Offline fallback banner */}
      {isOfflineFallback && (
        <div
          role="alert"
          className="bg-kavri-ink text-kavri-paper text-center py-2 font-mono text-[10px] uppercase tracking-wider border-b border-kavri-line select-none"
        >
          ⚠️ Local Preview Fallback Mode (Database Connection Unreachable)
        </div>
      )}

      {/* Header / Navigation */}
      <LandingNav utmSource={utmSource} utmMedium={utmMedium} utmCampaign={utmCampaign} refCode={ref} />

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
        <LandingNewsletterCTA utmSource={utmSource} utmMedium={utmMedium} utmCampaign={utmCampaign} refCode={ref} />

        {/* 11. About KAVRI */}
        <LandingAboutKavri />
      </main>

      {/* 12. Footer */}
      <LandingFooter />
    </div>
  );
}
