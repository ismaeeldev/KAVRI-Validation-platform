import React from "react";
import { StaggeredFeed } from "@/components/brand/animated-landing-elements";
import type { PublicUpdateDTO } from "@/server/services/public-queries-service";

interface Props {
  updates: PublicUpdateDTO[];
}

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  concept:      { bg: "#f0f0ed", text: "#5a605e", border: "#d6d9d4" },
  design:       { bg: "#eef4ff", text: "#3b5fc0", border: "#c0d0f0" },
  prototype:    { bg: "#fff8e8", text: "#8a6200", border: "#f0d880" },
  field_testing:{ bg: "#f0f8ce", text: "#3a6000", border: "#b8da30" },
  production:   { bg: "#e8f7e8", text: "#2a6b2a", border: "#b8e0b8" },
  launch:       { bg: "#111312", text: "#c6e83a", border: "#c6e83a" },
};

export function LandingTimeline({ updates }: Props) {
  return (
    <section
      id="testing-log"
      className="bg-[#f7f7f3] border-b border-kavri-line px-6 md:px-10 py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto space-y-12">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-block">
              <span className="relative inline-block text-kavri-ink font-mono text-[10px] uppercase tracking-[0.18em] font-black whitespace-nowrap select-none">
                <span
                  className="absolute -inset-x-4 -inset-y-2 bg-no-repeat pointer-events-none"
                  style={{
                    backgroundImage: "url('/paint-stroke.png')",
                    backgroundSize: "100% 100%",
                  }}
                />
                <span className="relative z-10">Development Timeline</span>
              </span>
            </div>
            <h2
              className="font-heading font-black uppercase text-kavri-ink leading-none"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}
            >
              Development Log
            </h2>
            <p className="font-sans text-sm text-kavri-muted max-w-lg leading-relaxed">
              A live record of every validation cycle, prototype review, and engineering milestone.
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-kavri-ink font-black shrink-0 mb-1">
            <span className="w-2 h-2 rounded-full bg-kavri-signal inline-block animate-pulse" aria-hidden />
            Live Updates
          </div>
        </div>

        {/* Timeline */}
        {updates.length === 0 ? (
          <div className="border border-kavri-line rounded-xl bg-kavri-surface py-16 text-center">
            <p className="font-mono text-xs text-kavri-muted">
              Development updates will appear here after review.
            </p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-6 bottom-6 w-[2px] bg-kavri-line hidden md:block" aria-hidden />

            <StaggeredFeed>
              {updates.map((update, idx) => {
                const stageKey = update.developmentStage?.toLowerCase().replace(" ", "_") ?? "";
                const stageStyle = STAGE_COLORS[stageKey] ?? { bg: "#f0f0ed", text: "#5a605e", border: "#d6d9d4" };

                return (
                  <div key={update.id} className="relative flex gap-0 md:gap-8 group">

                    {/* Node */}
                    <div className="hidden md:flex flex-col items-center pt-5 shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-200 ${
                          idx === 0
                            ? "bg-kavri-signal border-kavri-ink shadow-[0_0_0_4px_rgba(198,232,58,0.18)]"
                            : "bg-kavri-surface border-kavri-line group-hover:border-kavri-line-strong"
                        }`}
                        aria-hidden
                      >
                        {idx === 0 ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-kavri-line-strong" />
                        )}
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 mb-6">
                      <div className="border border-kavri-line rounded-xl bg-kavri-surface hover:border-kavri-line-strong hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-200 overflow-hidden">

                        {/* Card top bar — accent color based on stage */}
                        {idx === 0 && (
                          <div className="h-0.5 w-full bg-kavri-signal" />
                        )}

                        <div className="p-6 md:p-7 space-y-4">
                          {/* Header row */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-2 flex-1 min-w-0">
                              {/* Badges row */}
                              <div className="flex flex-wrap items-center gap-2">
                                {idx === 0 && (
                                  <span className="inline-flex items-center gap-1 font-mono text-[9px] font-black uppercase tracking-widest bg-kavri-ink text-kavri-signal px-2.5 py-1 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-kavri-signal" aria-hidden /> Latest
                                  </span>
                                )}
                                {update.developmentStage && (
                                  <span
                                    className="inline-block font-mono text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-md border"
                                    style={{ background: stageStyle.bg, color: stageStyle.text, borderColor: stageStyle.border }}
                                  >
                                    {update.developmentStage.replace("_", " ")}
                                  </span>
                                )}
                                {update.statusLabel && (
                                  <span className="inline-block font-mono text-[9px] font-black uppercase tracking-wider bg-[#e8f7e8] text-[#2a6b2a] border border-[#b8e0b8] px-2.5 py-1 rounded-md">
                                    {update.statusLabel}
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="font-heading text-[17px] font-extrabold text-kavri-ink leading-snug">
                                {update.title}
                              </h3>
                            </div>

                            {/* Date */}
                            <time
                              dateTime={update.publishedAt ? new Date(update.publishedAt).toISOString() : undefined}
                              className="font-mono text-[10px] text-kavri-muted shrink-0 text-right"
                            >
                              <span className="block font-bold text-kavri-ink">
                                {update.publishedAt
                                  ? new Date(update.publishedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                              {update.publishedAt && (
                                <span className="block">
                                  {new Date(update.publishedAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </time>
                          </div>

                          {/* Summary */}
                          <p className="font-sans text-sm text-kavri-muted leading-relaxed">
                            {update.summary}
                          </p>

                          {/* Footer meta */}
                          {update.product && (
                            <div className="flex flex-wrap gap-5 font-mono text-[10px] text-kavri-muted border-t border-kavri-line pt-4">
                              <span>
                                Product:{" "}
                                <span className="font-bold text-kavri-ink">{update.product.publicAlias}</span>
                              </span>
                              {update.revision && (
                                <span>
                                  Revision:{" "}
                                  <span className="font-bold text-kavri-ink">{update.revision.revisionCode}</span>
                                </span>
                              )}
                              <span>
                                By: <span className="font-bold text-kavri-ink">KAVRI Lab</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </StaggeredFeed>
          </div>
        )}
      </div>
    </section>
  );
}
