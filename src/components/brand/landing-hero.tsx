"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { BarChart3, Layers, UserRoundPlus } from "lucide-react";
import {
  MagneticButton,
  useLandingHeroMotion,
  useValidationRailMotion,
} from "@/components/brand/landing-motion";
import { ProgressBarFill } from "@/components/brand/animated-landing-elements";

const STAGES = ["Concept", "Design", "Prototype", "Field Test", "Production", "Launch"] as const;
const ACTIVE_STAGE_IDX = 3;

const TRUST_PILLARS = [
  {
    icon: BarChart3,
    title: "Built on Real Data",
    subtitle: "Measured. Not guessed.",
  },
  {
    icon: Layers,
    title: "Multi-Stage Validation",
    subtitle: "Tested across real conditions.",
  },
  {
    icon: UserRoundPlus,
    title: "Player-First Iteration",
    subtitle: "Feedback drives every step.",
  },
] as const;

export function LandingHero() {
  const scopeRef = useRef<HTMLElement>(null);
  useLandingHeroMotion(scopeRef);

  return (
    <section
      ref={scopeRef}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-16 lg:pt-[4.25rem]"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div data-hero-bg className="absolute inset-0">
          <Image
            src="/kavri-hero-paddles.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-[#070807]" />
        <div
          data-hero-glow
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 42%, rgba(184,255,46,0.14), transparent 65%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 lg:py-4">
        <div className="flex flex-col items-center w-full max-w-[40rem] mx-auto">
          <div
            data-hero-panel
            className="lp-hero-glass w-full text-center px-4 py-4 sm:px-7 sm:py-5 lg:px-8 lg:py-6 backdrop-blur-[20px]"
            style={{
              WebkitBackdropFilter: "blur(20px)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p
              data-hero-eyebrow
              className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-white/55 font-medium"
            >
              Premium Hardware · Built in the Open
            </p>

            <div
              data-hero-status
              className="mt-3 sm:mt-4 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-0 rounded-full border border-white/12 bg-black/35 px-1 py-1"
            >
              <span className="lp-hero-live-pill font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.14em] rounded-full">
                Live · Field Test
              </span>
              <span className="hidden sm:block w-px h-4 bg-white/15 mx-2" aria-hidden />
              <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.16em] text-white/45 px-2 sm:px-0">
                VAL-L06-001
              </span>
            </div>

            <div
              data-hero-narrative-label
              className="mt-5 sm:mt-6 flex items-center justify-center gap-3 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-[var(--lp-sage)] font-semibold"
            >
              <span className="h-px w-8 sm:w-12 bg-[var(--lp-sage)]/35" aria-hidden />
              Active narrative
              <span className="h-px w-8 sm:w-12 bg-[var(--lp-sage)]/35" aria-hidden />
            </div>

            <h1
              data-hero-headline
              className="mt-3 sm:mt-4 font-heading font-bold leading-[1.02] tracking-[-0.04em] text-[var(--lp-text)] text-balance"
              style={{ fontSize: "clamp(2rem, 5.5vw, 3.35rem)" }}
            >
              We <span className="text-[var(--lp-sage)]">Show</span> Testing.
            </h1>

            <p
              data-hero-body
              className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] text-white/62 leading-[1.65] max-w-[30rem] mx-auto font-sans"
            >
              Every KAVRI product earns its way to launch through measured inspection,
              real-world testing, and recorded decisions. This page is your window into our
              validation platform—what we test, how we test, and where we are right now.
            </p>

            <div
              data-hero-cta-group
              className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3"
            >
              <MagneticButton
                href="#join-the-build"
                className="lp-btn-primary inline-flex flex-1 sm:flex-none items-center justify-center gap-2 bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] px-6 min-h-[2.75rem] h-[2.75rem] font-sans text-xs sm:text-sm font-bold rounded-2xl focus-visible:outline-2 focus-visible:outline-[var(--lp-sage)] focus-visible:outline-offset-2 shadow-[0_0_24px_-6px_var(--lp-sage-glow)]"
              >
                <span data-hero-cta className="inline-flex items-center gap-2">
                  Join the Build <span aria-hidden>→</span>
                </span>
              </MagneticButton>
              <MagneticButton
                href="#how-we-test"
                strength={0.16}
                className="lp-btn-ghost inline-flex flex-1 sm:flex-none items-center justify-center gap-2 border border-white/22 text-[var(--lp-text)] px-5 min-h-[2.75rem] h-[2.75rem] font-sans text-xs sm:text-sm font-semibold rounded-2xl focus-visible:outline-2 focus-visible:outline-[var(--lp-sage)] focus-visible:outline-offset-2 bg-white/[0.04] backdrop-blur-sm"
              >
                <span data-hero-cta className="inline-flex items-center gap-2">
                  <span
                    className="inline-flex w-6 h-6 rounded-full border border-[var(--lp-sage)]/55 items-center justify-center"
                    aria-hidden
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="var(--lp-sage)">
                      <path d="M1.5 0.5v7l6-3.5z" />
                    </svg>
                  </span>
                  Watch How It Works
                </span>
              </MagneticButton>
            </div>

            <div
              data-hero-trust
              className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2"
              role="list"
            >
              {TRUST_PILLARS.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    role="listitem"
                    data-hero-trust-item
                    className={`flex flex-col items-center text-center px-1 ${
                      index > 0 ? "sm:border-l sm:border-white/10 sm:pl-3" : ""
                    }`}
                  >
                    <Icon
                      className="h-4 w-4 text-[var(--lp-sage)] mb-2"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.14em] text-white/85 font-semibold leading-tight">
                      {pillar.title}
                    </p>
                    <p className="mt-1 text-[10px] sm:text-[11px] text-white/45 leading-snug">
                      {pillar.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        data-hero-scroll
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-0"
        aria-hidden
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--lp-sage)]/70">
          Scroll
        </span>
        <span className="w-px h-7 bg-gradient-to-b from-[var(--lp-sage)]/55 to-transparent" />
      </div>
    </section>
  );
}

export function LandingValidationProgress() {
  const railRef = useRef<HTMLElement>(null);
  useValidationRailMotion(railRef);

  return (
    <section
      ref={railRef}
      className="relative z-10 border-y border-[var(--lp-line)] bg-[#0a0a0a]/95 backdrop-blur-md px-4 sm:px-6 md:px-10 py-7 md:py-10 overflow-hidden"
    >
      <div
        data-rail-ambient
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-32 w-32 rounded-full opacity-0 blur-3xl bg-[var(--lp-sage)]"
        style={{ left: `${(ACTIVE_STAGE_IDX / (STAGES.length - 1)) * 100}%`, transform: "translateX(-50%) translateY(-50%)" }}
        aria-hidden
      />

      <div className="max-w-[1280px] mx-auto space-y-6 md:space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            data-rail-header
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lp-muted)] font-semibold"
          >
            <span className="hidden sm:inline">Active Validation / Multiple Variants / </span>
            In Testing
          </p>
          <p
            data-rail-live
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--lp-sage)] font-bold flex items-center gap-2"
          >
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--lp-sage)] opacity-50 lp-live-dot" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--lp-sage)]" />
            </span>
            Live: Field Testing
          </p>
        </div>

        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible scrollbar-none">
          <div className="relative min-w-[520px] sm:min-w-0">
            <div className="absolute top-[15px] left-0 right-0 h-px bg-white/12 z-0" aria-hidden />
            <div
              data-rail-track
              className="absolute top-[15px] left-0 right-0 h-[2px] z-[5] origin-left overflow-hidden"
              aria-hidden
            >
              <div
                data-rail-fill
                className="absolute inset-0 bg-[var(--lp-sage)] origin-left shadow-[0_0_14px_var(--lp-sage-glow)]"
                style={{ transform: "scaleX(0)" }}
              />
              <div
                data-rail-shimmer
                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                aria-hidden
              />
            </div>

            <ol
              className="relative z-20 grid gap-0"
              style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(72px, 1fr))` }}
            >
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < ACTIVE_STAGE_IDX;
                const isActive = idx === ACTIVE_STAGE_IDX;
                return (
                  <li key={stage} className="flex flex-col items-center gap-2.5 min-w-0 px-1">
                    <div
                      data-rail-node
                      data-rail-active={isActive ? "true" : undefined}
                      aria-current={isActive ? "step" : undefined}
                      className={`
                        relative w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0
                        ${
                          isCompleted
                            ? "bg-[var(--lp-sage)] border-[var(--lp-sage)] shadow-[0_0_14px_var(--lp-sage-glow)]"
                            : isActive
                              ? "bg-[#050505] border-[var(--lp-sage)] shadow-[0_0_24px_var(--lp-sage-glow)]"
                              : "bg-[#0e0e0e] border-white/20"
                        }
                      `}
                    >
                      {isActive && (
                        <span
                          data-rail-pulse
                          className="absolute inset-0 rounded-full border-2 border-[var(--lp-sage)] opacity-0"
                          aria-hidden
                        />
                      )}
                      {isCompleted ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Completed" role="img">
                          <path
                            d="M2.5 6L5 8.5L9.5 4"
                            stroke="#0a1004"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : isActive ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--lp-sage)] shadow-[0_0_8px_var(--lp-sage)]" aria-hidden />
                      ) : null}
                    </div>
                    <span
                      data-rail-label
                      className={`font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-center leading-tight
                        ${isCompleted || isActive ? "text-[var(--lp-text)] font-bold" : "text-[var(--lp-muted)]"}
                      `}
                    >
                      {stage}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export { ProgressBarFill };
