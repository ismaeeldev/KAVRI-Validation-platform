import React from "react";
import Image from "next/image";
import { HeroReveal, ProgressBarFill } from "@/components/brand/animated-landing-elements";

// Stages for the validation progress rail
const STAGES = ["Concept", "Design", "Prototype", "Field Test", "Production", "Launch"] as const;
const ACTIVE_STAGE_IDX = 3; // "Field Test"

export function LandingHero() {
  return (
    <section className="bg-kavri-surface border-b border-kavri-line py-14 md:py-20 lg:py-24 px-6 md:px-10">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-8">
          <HeroReveal>
            {/* Eyebrow */}
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-muted font-semibold">
              Premium Hardware. Built in the Open.
            </p>

            {/* Headline */}
            <h1
              className="font-heading font-black uppercase leading-[1.0] text-kavri-ink"
              style={{ fontSize: "clamp(36px, 4.5vw, 60px)" }}
            >
              We Don&apos;t Show
              <br />
              Coming Soon.
              <br />
              <span className="relative inline-block text-kavri-signal-ink mt-5 select-none font-black whitespace-nowrap">
                <span
                  className="absolute -inset-x-10 -inset-y-12 bg-no-repeat pointer-events-none"
                  style={{
                    backgroundImage: "url('/paint-stroke.png')",
                    backgroundSize: "100% 100%",
                  }}
                />
                <span className="relative z-10">We Show Testing.</span>
              </span>
            </h1>

            {/* Supporting copy */}
            <p className="text-base text-kavri-muted leading-relaxed max-w-[500px] font-sans">
              Every KAVRI product earns its way to launch through measured inspection, real-world testing,
              and recorded decisions. This page is your window into our validation platform—what we
              test, how we test, and where we are right now.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#join-the-build"
                className="inline-flex items-center gap-2 bg-kavri-signal text-kavri-ink border border-kavri-ink hover:bg-kavri-ink hover:text-white transition-all duration-200 px-6 h-11 font-sans text-sm font-bold rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-2 shadow-xs"
              >
                Join the Build <span aria-hidden>›</span>
              </a>
              <a
                href="#current-testing"
                className="inline-flex items-center gap-2 bg-kavri-ink text-kavri-surface hover:bg-[#2b2f35] active:bg-[#1a1d20] transition-colors duration-150 px-6 h-11 font-sans text-sm font-bold rounded-lg border border-kavri-ink focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-2"
              >
                View Active Tests <span aria-hidden>›</span>
              </a>
              <a
                href="#how-we-test"
                className="inline-flex items-center gap-2 border border-kavri-line bg-transparent text-kavri-ink hover:bg-kavri-surface-subtle transition-colors duration-150 px-6 h-11 font-sans text-sm font-bold rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-2"
              >
                See How We Test
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-1 border-t border-kavri-line" role="list">
              {[
                {
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                  label: "Built in the Open",
                },
                {
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                  label: "Real Tester Feedback",
                },
                {
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  ),
                  label: "Data-Driven Decisions",
                },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  role="listitem"
                  className="flex items-center gap-2 font-mono text-[11px] text-kavri-muted pt-4"
                >
                  <span className="text-kavri-ink">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </HeroReveal>
        </div>

        {/* ── RIGHT COLUMN: Hero Image Card ── */}
        <div className="w-full">
          <div className="relative rounded-2xl border border-kavri-line overflow-hidden bg-[#0d0e0f] shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
            {/* Main image */}
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <Image
                src="/abstract-constellation.png"
                alt="KAVRI Hardware Product Specimen — Abstract Data Constellation"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            {/* Specification panel attached to bottom of image */}
            <div className="bg-[#0f1112] text-white px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a8078] mb-1">
                    Current Test Focus
                  </p>
                  <p className="font-heading font-black uppercase text-[20px] tracking-tight text-white leading-tight">
                    Apex Matrix Core
                  </p>
                </div>
                <span className="bg-kavri-signal text-kavri-signal-ink font-mono text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#c6e83a]">
                  Field Test
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-3 border-t border-[#1f2223]">
                {[
                  { label: "Core", value: "Honeycomb Matrix" },
                  { label: "Frame", value: "Raw T700 Carbon" },
                  { label: "Weight (Target)", value: "220g" },
                  { label: "Testers", value: "12 Active" },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="font-mono text-[8px] uppercase tracking-wider text-[#5a605e]">
                      {label}
                    </p>
                    <p className="font-mono text-[11px] font-semibold text-white leading-snug">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingValidationProgress() {
  return (
    <section className="bg-[#f7f7f3] border-b border-kavri-line px-6 md:px-10 py-10">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-muted font-semibold">
            Live Validation Progress
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-kavri-ink font-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-kavri-signal inline-block animate-pulse" aria-hidden />
            Field Testing
          </p>
        </div>

        {/* Progress bar connecting line (visual only) */}
        <div className="relative">
          {/* Track line */}
          <div className="absolute top-[14px] left-0 right-0 h-[2px] bg-kavri-line z-0" aria-hidden />
          {/* Filled portion up to active stage */}
          <div
            className="absolute top-[14px] left-0 h-[2px] bg-kavri-signal z-10 animate-progress-wipe"
            style={{ width: `${((ACTIVE_STAGE_IDX) / (STAGES.length - 1)) * 100}%` }}
            aria-hidden
          />

          {/* Stage nodes */}
          <ol
            className="relative z-20 grid gap-0"
            style={{ gridTemplateColumns: `repeat(${STAGES.length}, 1fr)` }}
          >
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < ACTIVE_STAGE_IDX;
              const isActive = idx === ACTIVE_STAGE_IDX;
              return (
                <li key={stage} className="flex flex-col items-center gap-2.5 min-w-[56px]">
                  {/* Node */}
                  <div
                    aria-current={isActive ? "step" : undefined}
                    className={`
                      w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300
                      ${isCompleted
                        ? "bg-kavri-signal border-kavri-signal"
                        : isActive
                        ? "bg-kavri-ink border-kavri-signal shadow-[0_0_0_4px_rgba(198,232,58,0.2)]"
                        : "bg-kavri-surface border-kavri-line"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Completed" role="img">
                        <path d="M2.5 6L5 8.5L9.5 4" stroke="#39420a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-kavri-signal" aria-hidden />
                    ) : null}
                  </div>

                  {/* Label */}
                  <span
                    className={`font-mono text-[9px] md:text-[10px] uppercase tracking-wider text-center leading-tight whitespace-nowrap
                      ${isCompleted || isActive ? "text-kavri-ink font-black" : "text-kavri-muted"}
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
    </section>
  );
}

// Re-export ProgressBarFill for use elsewhere
export { ProgressBarFill };
