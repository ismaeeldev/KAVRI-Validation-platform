"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimeStaggerIn, LandingScrollReveal } from "@/components/brand/landing-motion";
import type { PublicUpdateDTO } from "@/server/services/public-queries-service";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  updates: PublicUpdateDTO[];
}

const STAGE_COLORS: Record<string, string> = {
  concept: "text-[var(--lp-muted)] border-white/15 bg-white/5",
  design: "text-sky-200/90 border-sky-500/25 bg-sky-500/10",
  prototype: "text-amber-200/90 border-amber-500/25 bg-amber-500/10",
  field_testing: "text-[var(--lp-sage-bright)] border-[var(--lp-sage)]/35 bg-[var(--lp-sage)]/10",
  production: "text-emerald-200/90 border-emerald-500/25 bg-emerald-500/10",
  launch: "text-[var(--lp-sage)] border-[var(--lp-sage)] bg-[var(--lp-sage)]/15",
};

function formatLogId(index: number) {
  return String(index + 1).padStart(3, "0");
}

export function LandingTimeline({ updates }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const spine = sectionRef.current?.querySelector("[data-log-spine-fill]");
      if (!spine || !sectionRef.current) return;
      gsap.fromTo(
        spine,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  const latest = updates[0];
  const rest = updates.slice(1);

  return (
    <section
      ref={sectionRef}
      id="testing-log"
      className="relative border-b border-[var(--lp-line)] lp-section-wash px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-28 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[var(--lp-sage)]/5 blur-3xl"
        aria-hidden
      />

      <div className="max-w-[1280px] mx-auto space-y-10 md:space-y-12">
        <LandingScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
              Testing Log & Public Transparency
            </p>
            <h2
              className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-none"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              Development{" "}
              <span className="text-[var(--lp-sage)]">Log</span>
            </h2>
            <p className="font-sans text-sm sm:text-[15px] text-[var(--lp-muted)] max-w-lg leading-relaxed">
              A live record of every validation cycle, prototype review, and engineering milestone.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--lp-sage)] font-bold">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--lp-sage)] opacity-50 lp-live-dot" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--lp-sage)]" />
              </span>
              Live Updates
            </div>
            {updates.length > 0 && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">
                {updates.length} entries logged
              </span>
            )}
          </div>
        </LandingScrollReveal>

        {updates.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-[var(--lp-line)] bg-[var(--lp-elevated)] py-16 text-center">
            <div className="absolute inset-0 lp-grid-bg opacity-[0.06]" aria-hidden />
            <p className="relative font-mono text-xs text-[var(--lp-muted)]">
              Development updates will appear here after review.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Spine */}
            <div
              className="hidden lg:block absolute left-[19px] top-8 bottom-8 w-px bg-white/8"
              aria-hidden
            />
            <div
              data-log-spine-fill
              className="hidden lg:block absolute left-[19px] top-8 w-[2px] h-[calc(100%-4rem)] bg-gradient-to-b from-[var(--lp-sage)] via-[var(--lp-sage)]/50 to-transparent origin-top"
              aria-hidden
            />

            <div className="space-y-4">
              {/* Featured latest */}
              {latest && (
                <LandingScrollReveal>
                  <article className="relative lg:pl-12">
                    <span
                      className="hidden lg:flex absolute left-0 top-8 h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--lp-sage)] bg-[var(--lp-sage)] font-mono text-[11px] font-bold text-[var(--lp-sage-ink)] shadow-[0_0_20px_var(--lp-sage-glow)]"
                      aria-hidden
                    >
                      ●
                    </span>
                    <div className="relative overflow-hidden rounded-2xl border border-[var(--lp-sage)]/30 bg-gradient-to-br from-[var(--lp-sage-soft)] via-[var(--lp-elevated)] to-[var(--lp-elevated)] p-6 sm:p-8 shadow-[0_0_56px_-20px_var(--lp-sage-glow)]">
                      <div className="absolute inset-0 lp-grid-bg opacity-[0.06]" aria-hidden />
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--lp-sage)]/8 blur-3xl rounded-full" aria-hidden />

                      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--lp-sage-ink)] bg-[var(--lp-sage)] px-2.5 py-0.5 rounded-lg">
                              Latest
                            </span>
                            <span className="font-mono text-[10px] text-white/40">
                              LOG-{formatLogId(0)}
                            </span>
                          </div>
                          <time
                            dateTime={
                              latest.publishedAt
                                ? new Date(latest.publishedAt).toISOString()
                                : undefined
                            }
                            className="block font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[var(--lp-text)]"
                          >
                            {latest.publishedAt
                              ? new Date(latest.publishedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                })
                              : "—"}
                          </time>
                          {latest.developmentStage && (
                            <span
                              className={`inline-block font-mono text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg border ${
                                STAGE_COLORS[
                                  latest.developmentStage.toLowerCase().replace(" ", "_")
                                ] ?? STAGE_COLORS.concept
                              }`}
                            >
                              {latest.developmentStage.replace("_", " ")}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 min-w-0">
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--lp-text)] leading-snug">
                            {latest.title}
                          </h3>
                          <p className="font-sans text-[14px] sm:text-[15px] text-[var(--lp-muted)] leading-relaxed">
                            {latest.summary}
                          </p>
                          {latest.statusLabel && (
                            <span className="inline-flex font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--lp-sage)] border border-[var(--lp-sage)]/30 px-2.5 py-1 rounded-lg">
                              {latest.statusLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </LandingScrollReveal>
              )}

              {/* Feed */}
              {rest.length > 0 && (
                <div className="relative lg:pl-12 space-y-0 rounded-2xl border border-[var(--lp-line)] overflow-hidden divide-y divide-white/[0.06]">
                  <AnimeStaggerIn>
                    {rest.map((update, idx) => {
                      const logIndex = idx + 1;
                      const stageKey =
                        update.developmentStage?.toLowerCase().replace(" ", "_") ?? "";
                      const stageTone = STAGE_COLORS[stageKey] ?? STAGE_COLORS.concept;

                      return (
                        <article
                          key={update.id}
                          data-stagger-item
                          className="relative group grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] gap-3 sm:gap-6 items-start px-5 sm:px-7 py-5 bg-[var(--lp-elevated)]/80 hover:bg-white/[0.02] transition-colors duration-300"
                        >
                          <span
                            className="hidden lg:flex absolute -left-[31px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-white/25 bg-[var(--lp-bg)] group-hover:border-[var(--lp-sage)]/50 group-hover:bg-[var(--lp-sage-soft)] transition-colors"
                            aria-hidden
                          />

                          <div className="flex items-center justify-between gap-3 sm:block sm:space-y-1">
                            <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">
                              {formatLogId(logIndex)}
                            </span>
                            <time
                              dateTime={
                                update.publishedAt
                                  ? new Date(update.publishedAt).toISOString()
                                  : undefined
                              }
                              className="font-mono text-[12px] font-bold uppercase tracking-wider text-[var(--lp-text)]"
                            >
                              {update.publishedAt
                                ? new Date(update.publishedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "2-digit",
                                  })
                                : "—"}
                            </time>
                          </div>

                          <div className="space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {update.developmentStage && (
                                <span
                                  className={`inline-block font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-lg border ${stageTone}`}
                                >
                                  {update.developmentStage.replace("_", " ")}
                                </span>
                              )}
                            </div>
                            <h3 className="font-heading text-[15px] font-semibold text-[var(--lp-text)] leading-snug group-hover:text-white transition-colors">
                              {update.title}
                            </h3>
                            <p className="font-sans text-[13px] text-[var(--lp-muted)] leading-relaxed line-clamp-2">
                              {update.summary}
                            </p>
                          </div>

                          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                            {update.statusLabel && (
                              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--lp-muted)] border border-[var(--lp-line)] px-2.5 py-1 rounded-lg">
                                {update.statusLabel}
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </AnimeStaggerIn>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
