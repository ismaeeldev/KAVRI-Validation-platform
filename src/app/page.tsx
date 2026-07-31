import React from "react";
import {
  getPublicUpdatesFeed,
  getPublicProducts,
  getPublicMetrics,
  type PublicUpdateDTO,
} from "@/server/services/public-queries-service";

// Landing section components
import { LandingNav } from "@/components/brand/landing-nav";
import {
  LandingHero,
  LandingValidationProgress,
} from "@/components/brand/landing-hero";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];
  let metrics = {
    revisionsCount: 0,
    samplesReceived: 0,
    approvedTesters: 0,
    activeAssignments: 0,
    publishedUpdates: 0,
  };
  let isOfflineFallback = false;

  try {
    [updates, products, metrics] = await Promise.all([
      getPublicUpdatesFeed(),
      getPublicProducts(),
      getPublicMetrics(),
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

      {/* 1. Header / Navigation */}
      <LandingNav />

      <main className="flex-1">
        {/* 2. Hero Section — hero image locked to /abstract-constellation.png */}
        <LandingHero />

        {/* 4. Live Validation Progress */}
        <LandingValidationProgress />

        {/* 5. Statistics Cards */}
        <LandingMetrics metrics={metrics} />

        {/* 6. Active Testing / Specifications */}
        <LandingActiveSpecs product={featuredProduct} />

        {/* 7. Testing Log / Development Timeline */}
        <LandingTimeline updates={updates} />

        {/* 8. Validation Values / Benefits */}
        <LandingValues />

        {/* 9. Newsletter / Follow-the-Build CTA */}
        <LandingNewsletterCTA utmSource={utmSource} utmMedium={utmMedium} utmCampaign={utmCampaign} refCode={ref} />
      </main>

      {/* 10. Footer */}
      <LandingFooter />
    </div>
  );
}
