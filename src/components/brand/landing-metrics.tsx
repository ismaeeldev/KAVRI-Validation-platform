import React from "react";
import { MetricCountUp } from "@/components/brand/animated-landing-elements";
import type { PublicMetricsDTO } from "@/server/services/public-queries-service";

const METRIC_ICONS = {
  revisions: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  samples: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  testers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  assignments: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  updates: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

interface Props {
  metrics: PublicMetricsDTO;
}

export function LandingMetrics({ metrics }: Props) {
  const cards = [
    {
      icon: METRIC_ICONS.revisions,
      value: metrics.revisionsCount,
      label: "Revisions Documented",
      desc: "Design decisions logged",
    },
    {
      icon: METRIC_ICONS.samples,
      value: metrics.samplesReceived,
      label: "Samples Received",
      desc: "Physical builds tested",
    },
    {
      icon: METRIC_ICONS.testers,
      value: metrics.approvedTesters,
      label: "Approved Testers",
      desc: "Vetted & trusted",
    },
    {
      icon: METRIC_ICONS.assignments,
      value: metrics.activeAssignments,
      label: "Assignments Active",
      desc: "Tests in progress",
    },
    {
      icon: METRIC_ICONS.updates,
      value: metrics.publishedUpdates,
      label: "Updates Published",
      desc: "Public changelog",
    },
  ];

  // Hide or de-emphasize zero-value metrics rather than presenting a dashboard full of zeros.
  const nonZeroCards = cards.filter((c) => c.value > 0);

  return (
    <section
      id="validation-snapshot"
      className="bg-kavri-surface border-b border-kavri-line px-6 md:px-10 py-12"
      aria-label="Validation statistics"
    >
      <div className="max-w-[1280px] mx-auto space-y-6">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-muted font-semibold">
          Validation Snapshot
        </h2>

        {nonZeroCards.length === 0 ? (
          <div className="border border-dashed border-kavri-line rounded-xl bg-kavri-surface py-12 text-center">
            <p className="font-mono text-xs text-kavri-muted">Just getting started — the first numbers will appear here soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 border border-kavri-line rounded-xl overflow-hidden divide-x divide-y sm:divide-y-0 divide-kavri-line shadow-xs">
            {nonZeroCards.map(({ icon, value, label, desc }) => (
              <div
                key={label}
                className="p-6 lg:p-7 space-y-4 bg-kavri-surface hover:bg-[#f9f9f7] transition-colors duration-150 group"
              >
                <span className="text-kavri-muted group-hover:text-kavri-ink transition-colors duration-150 block">
                  {icon}
                </span>
                <div className="space-y-1">
                  <span className="font-heading text-[44px] font-black leading-none block text-kavri-ink">
                    <MetricCountUp value={value} />
                  </span>
                  <span className="font-sans text-xs font-bold text-kavri-ink block leading-snug">
                    {label}
                  </span>
                  <span className="font-mono text-[10px] text-kavri-muted block">
                    {desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
