"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  MagneticButton,
  useLandingHeroMotion,
  useValidationRailMotion,
} from "@/components/brand/landing-motion";
import { ProgressBarFill } from "@/components/brand/animated-landing-elements";

const STAGES = ["Concept", "Design", "Prototype", "Field Test", "Production", "Launch"] as const;
const ACTIVE_STAGE_IDX = 3;

export function LandingHero() {
  const scopeRef = useRef<HTMLElement>(null);
  useLandingHeroMotion(scopeRef);

  return (
    <section
      ref={scopeRef}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-20"
    >
      {/* Background */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#070807]" />
        <div
          data-hero-glow
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(184,255,46,0.12), transparent 65%)",
          }}
        />
      </div>

      {/* Centered copy */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <p
            data-hero-eyebrow
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--lp-sage)] font-semibold mb-6 sm:mb-7"
          >
            Premium Hardware. Built in the Open.
          </p>

          <h1
            className="font-heading font-bold leading-[1.02] tracking-[-0.035em] text-[var(--lp-text)]"
            style={{ fontSize: "clamp(2.35rem, 7vw, 4.75rem)" }}
          >
            <span data-hero-line className="block overflow-hidden">
              <span className="inline-block">We Don&apos;t </span>
              <span className="inline-block text-[var(--lp-sage)]">Show</span>
            </span>
            <span
              data-hero-line
              className="block text-white/50 overflow-hidden mt-1"
            >
              <span className="inline-block">Coming Soon.</span>
            </span>
            <span data-hero-line className="block mt-2 sm:mt-3 overflow-hidden">
              <span className="inline-block">We </span>
              <span className="inline-block text-[var(--lp-sage)]">Show </span>
              <span className="relative inline-block">
                Testing
                <span
                  data-hero-underline
                  className="absolute left-0 right-0 -bottom-1 sm:-bottom-1.5 h-[3px] bg-[var(--lp-sage)] origin-left shadow-[0_0_16px_var(--lp-sage-glow)]"
                  aria-hidden
                />
              </span>
              <span className="inline-block">.</span>
            </span>
          </h1>

          <p
            data-hero-body
            className="mt-6 sm:mt-7 text-[15px] sm:text-[17px] text-[var(--lp-muted)] leading-relaxed max-w-[34rem] font-sans"
          >
            Every KAVRI product earns its way to launch through measured inspection, real-world
            testing, and recorded decisions. This page is your window into our validation
            platform—what we test, how we test, and where we are right now.
          </p>

          <div
            data-hero-cta-group
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-9 w-full sm:w-auto"
          >
            <MagneticButton
              href="#join-the-build"
              className="lp-btn-primary inline-flex items-center justify-center gap-2 bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] px-8 min-h-[3.25rem] h-[3.25rem] font-sans text-sm font-bold rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--lp-sage)] focus-visible:outline-offset-2 w-full sm:w-auto shadow-[0_0_32px_-4px_var(--lp-sage-glow)]"
            >
              <span data-hero-cta className="inline-flex items-center gap-2">
                Join the Build <span aria-hidden>→</span>
              </span>
            </MagneticButton>
            <MagneticButton
              href="#how-we-test"
              strength={0.16}
              className="lp-btn-ghost inline-flex items-center justify-center gap-2.5 border border-white/25 text-[var(--lp-text)] px-7 min-h-[3.25rem] h-[3.25rem] font-sans text-sm font-semibold rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--lp-sage)] focus-visible:outline-offset-2 w-full sm:w-auto backdrop-blur-sm bg-white/[0.03]"
            >
              <span data-hero-cta className="inline-flex items-center gap-2.5">
                <span
                  className="inline-flex w-7 h-7 rounded-full border border-[var(--lp-sage)]/60 items-center justify-center shadow-[0_0_12px_-2px_var(--lp-sage-glow)]"
                  aria-hidden
                >
                  <svg width="9" height="9" viewBox="0 0 8 8" fill="var(--lp-sage)">
                    <path d="M1.5 0.5v7l6-3.5z" />
                  </svg>
                </span>
                Watch How It Works
              </span>
            </MagneticButton>
          </div>

          <div
            data-hero-trust
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 sm:mt-12 pt-8 border-t border-white/10 w-full max-w-lg"
            role="list"
          >
            {[
              "Built on Real Data",
              "Multi-Stage Validation",
              "Player-First Iteration",
            ].map((label) => (
              <div
                key={label}
                role="listitem"
                data-hero-trust-item
                className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-white/75"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--lp-sage)] shadow-[0_0_10px_var(--lp-sage)]"
                  aria-hidden
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        data-hero-scroll
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0"
        aria-hidden
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
          Scroll
        </span>
        <span className="w-px h-8 bg-gradient-to-b from-[var(--lp-sage)]/60 to-transparent" />
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
      {/* Ambient glow behind active stage */}
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
