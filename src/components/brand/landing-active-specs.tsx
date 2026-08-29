"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PublicProductDTO, PublicSampleSummaryDTO } from "@/server/services/public-queries-service";
import { AnimeStaggerIn, LandingScrollReveal } from "@/components/brand/landing-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  product: PublicProductDTO | null;
  sampleSummaries: PublicSampleSummaryDTO[];
}

const PLACEHOLDER_ALIASES = new Set([
  "tester name",
  "generic product",
  "test",
  "untitled",
  "n/a",
]);

function isPlaceholder(value: string | null | undefined) {
  if (!value) return true;
  return PLACEHOLDER_ALIASES.has(value.trim().toLowerCase());
}

function statusTone(label: string, isActive: boolean) {
  const key = label.toLowerCase();
  if (key.includes("testing")) {
    return isActive
      ? "bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] border-[var(--lp-sage)] shadow-[0_0_20px_-2px_var(--lp-sage-glow)]"
      : "bg-[var(--lp-sage)]/15 text-[var(--lp-sage)] border-[var(--lp-sage)]/40";
  }
  if (key.includes("received")) {
    return "bg-sky-500/15 text-sky-200/90 border-sky-500/35";
  }
  if (key.includes("review")) {
    return "bg-amber-500/10 text-amber-200/90 border-amber-500/30";
  }
  return "bg-white/5 text-[var(--lp-muted)] border-[var(--lp-line)]";
}

function PaddleSilhouette({ active }: { active?: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {active && (
        <>
          <span
            className="absolute w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] rounded-full border border-[var(--lp-sage)]/30 lp-variant-ring"
            aria-hidden
          />
          <span
            className="absolute w-[60px] h-[60px] sm:w-16 sm:h-16 rounded-full bg-[var(--lp-sage)]/10 blur-lg"
            aria-hidden
          />
        </>
      )}
      <svg
        viewBox="0 0 72 120"
        className={`relative z-10 w-[3.5rem] h-[6rem] sm:w-14 sm:h-[6.75rem] transition-all duration-500 ${
          active
            ? "text-[var(--lp-sage)] drop-shadow-[0_0_20px_var(--lp-sage-glow)]"
            : "text-white/40 group-hover:text-white/65 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M22 8c0-2.5 4-4 14-4s14 1.5 14 4v42c0 10-6 16-14 16s-14-6-14-16V8z" />
        <path d="M30 18v28M36 16v32M42 18v28" opacity="0.4" strokeWidth="1" />
        <path d="M32 66h8v8h-8z" />
        <rect x="33" y="74" width="6" height="34" rx="2" />
        <rect x="30" y="108" width="12" height="6" rx="1.5" />
        {active && (
          <path
            d="M22 8c0-2.5 4-4 14-4s14 1.5 14 4v42c0 10-6 16-14 16s-14-6-14-16V8z"
            fill="currentColor"
            fillOpacity="0.06"
            stroke="none"
          />
        )}
      </svg>
    </div>
  );
}

interface VariantCardProps {
  label: string;
  statusLabel: string;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

const VISIBLE_VARIANTS = 4;

function VariantTestCard({ label, statusLabel, index, isActive, onSelect }: VariantCardProps) {
  const variantNum = label.replace(/variant\s*/i, "").trim() || String(index + 1);

  return (
    <button
      type="button"
      data-stagger-item
      onClick={onSelect}
      aria-pressed={isActive}
      className={`
        w-full min-h-[232px] sm:min-h-[244px]
        rounded-2xl border flex flex-col overflow-hidden
        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        focus-visible:outline-2 focus-visible:outline-[var(--lp-sage)] focus-visible:outline-offset-2
        group relative text-left origin-center
        ${
          isActive
            ? "border-[var(--lp-sage)] bg-[#0c1008] shadow-[0_0_40px_-8px_var(--lp-sage-glow),inset_0_1px_0_rgba(184,255,46,0.2)] scale-[1.02] z-10"
            : "border-[var(--lp-line)] bg-[var(--lp-elevated)]/90 hover:border-[var(--lp-line-strong)] hover:bg-[var(--lp-elevated)] scale-100 opacity-80 hover:opacity-100"
        }
      `}
    >
      {/* Top glow wash */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-32 transition-opacity duration-500 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--lp-sage) 28%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />

      <div className="relative flex items-center justify-between px-3.5 pt-3">
        <span
          className={`font-mono text-[10px] font-bold tracking-[0.2em] ${
            isActive ? "text-[var(--lp-sage)]" : "text-[var(--lp-muted)]"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {isActive && (
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--lp-sage)] opacity-50 lp-live-dot" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--lp-sage)]" />
          </span>
        )}
      </div>

      <div className="relative flex-1 flex items-center justify-center py-2 px-2.5 min-h-0">
        <div
          className={`w-full max-w-[96px] h-[108px] sm:h-[112px] rounded-xl flex items-center justify-center transition-all duration-500 ${
            isActive
              ? "bg-[var(--lp-sage-soft)] border border-[var(--lp-sage)]/25 shadow-[inset_0_0_32px_-8px_var(--lp-sage-glow)]"
              : "bg-black/25 border border-white/[0.06] group-hover:border-white/12"
          }`}
        >
          <PaddleSilhouette active={isActive} />
        </div>
      </div>

      <div className="relative px-3.5 pb-3 pt-1.5 space-y-2 border-t border-[var(--lp-line)]/80">
        <div>
          <p
            className={`font-heading font-bold text-[14px] sm:text-[15px] tracking-tight leading-none ${
              isActive ? "text-[var(--lp-text)]" : "text-[var(--lp-text)]/85"
            }`}
          >
            {variantNum}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--lp-muted)] mt-1">
            Variant
          </p>
        </div>
        <span
          className={`inline-flex w-full items-center justify-center font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${statusTone(statusLabel, isActive)}`}
        >
          {statusLabel}
        </span>
      </div>
    </button>
  );
}

export function LandingActiveSpecs({ product, sampleSummaries }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const liveCardRef = useRef<HTMLDivElement>(null);
  const revision = product?.revisions[0] ?? null;

  const samples =
    sampleSummaries.length > 0
      ? sampleSummaries
      : [
          { alias: "Variant 7.0", statusLabel: "In Testing" },
          { alias: "Variant 6.8", statusLabel: "In Testing" },
          { alias: "Variant 6.1", statusLabel: "Received" },
          { alias: "Variant 5.8", statusLabel: "Under Review" },
        ];

  const active = samples[activeIdx] ?? samples[0];

  const liveTitle = !isPlaceholder(active?.alias)
    ? active.alias
    : !isPlaceholder(product?.publicAlias)
      ? product!.publicAlias
      : "Variant 7.0";

  const liveSubtitle = !isPlaceholder(revision?.publicTitle)
    ? revision!.publicTitle
    : "Maria R. · Field cycle";

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bar = progressRef.current;
      const live = liveCardRef.current;
      if (!section) return;

      if (live) {
        gsap.fromTo(
          live,
          { opacity: 0, x: 32 },
          {
            opacity: 1,
            x: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 78%", once: true },
          }
        );
      }

      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 0.67,
            duration: 1.2,
            ease: "power2.out",
            transformOrigin: "left center",
            delay: 0.35,
            scrollTrigger: { trigger: live || section, start: "top 75%", once: true },
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [activeIdx] }
  );

  const scrollBy = (dir: -1 | 1) => {
    const next = Math.min(samples.length - 1, Math.max(0, activeIdx + dir));
    setActiveIdx(next);

    const el = trackRef.current;
    if (!el || samples.length <= VISIBLE_VARIANTS) return;

    const card = el.querySelector<HTMLElement>("[data-stagger-item]");
    if (!card) return;
    const gap = 14;
    const step = card.offsetWidth + gap;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const hasOverflow = samples.length > VISIBLE_VARIANTS;

  return (
    <section
      ref={sectionRef}
      id="current-testing"
      className="border-b border-[var(--lp-line)] lp-section-wash px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-28"
    >
      <div className="max-w-[1280px] mx-auto space-y-10 md:space-y-12">
        <LandingScrollReveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3 max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
              Current Testing
            </p>
            <h2
              className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-[1.05]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              What We Are{" "}
              <span className="text-[var(--lp-sage)]">Testing</span> Right Now
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[var(--lp-muted)] leading-relaxed font-sans">
              {revision && !isPlaceholder(revision.publicTitle)
                ? `We are currently focused on whether ${revision.publicTitle} holds up to real-world play — structural integrity and durability under repeated use.`
                : "We are currently validating structural integrity and durability under repeated real-world play."}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${!hasOverflow ? "lg:opacity-60" : ""}`}>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={activeIdx === 0}
              aria-label="Previous samples"
              className="w-11 h-11 rounded-full border border-[var(--lp-line-strong)] text-[var(--lp-text)] hover:border-[var(--lp-sage)] hover:text-[var(--lp-sage)] hover:bg-[var(--lp-sage-soft)] transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={activeIdx === samples.length - 1}
              aria-label="Next samples"
              className="w-11 h-11 rounded-full border border-[var(--lp-line-strong)] text-[var(--lp-text)] hover:border-[var(--lp-sage)] hover:text-[var(--lp-sage)] hover:bg-[var(--lp-sage-soft)] transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              →
            </button>
          </div>
        </LandingScrollReveal>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 xl:gap-10 items-stretch">
          <AnimeStaggerIn className="pt-1 min-w-0">
            <div
              ref={trackRef}
              className={`
                pt-5 pb-3 px-1 grid gap-3.5 sm:gap-4 scrollbar-none
                ${
                  hasOverflow
                    ? "grid-flow-col auto-cols-[calc((100%-2.625rem)/4)] overflow-x-auto snap-x snap-mandatory"
                    : "grid-cols-2 lg:grid-cols-4"
                }
              `}
              style={{ scrollbarWidth: "none" }}
            >
              {samples.map((sample, idx) => {
                const isActive = idx === activeIdx;
                const label = isPlaceholder(sample.alias) ? `Variant ${(7 - idx * 0.2).toFixed(1)}` : sample.alias;
                return (
                  <VariantTestCard
                    key={`${sample.alias}-${idx}`}
                    label={label}
                    statusLabel={sample.statusLabel}
                    index={idx}
                    isActive={isActive}
                    onSelect={() => setActiveIdx(idx)}
                  />
                );
              })}
            </div>
          </AnimeStaggerIn>

          <LandingScrollReveal>
            <div
              ref={liveCardRef}
              className="lp-card h-full rounded-2xl overflow-hidden border border-[var(--lp-sage)]/35 shadow-[0_0_48px_-12px_var(--lp-sage-glow)] relative"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--lp-sage) 18%, transparent), transparent 55%)",
                }}
                aria-hidden
              />

              <div className="relative px-5 py-4 border-b border-[var(--lp-line)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5" aria-hidden>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--lp-sage)] opacity-60 lp-live-dot" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--lp-sage)]" />
                  </span>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lp-sage)] font-bold">
                    Live Test in Progress
                  </p>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-[var(--lp-sage)] text-[var(--lp-sage-ink)]">
                  Field Test
                </span>
              </div>

              <div className="relative px-5 py-5 space-y-5">
                <div>
                  <p className="font-heading font-bold text-lg text-[var(--lp-text)] tracking-tight">
                    {liveTitle}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--lp-muted)] mt-1 uppercase tracking-wider">
                    {liveSubtitle}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-sans text-[var(--lp-muted)]">Cycle progress</span>
                    <span className="font-mono font-bold text-[var(--lp-text)]">14 / 21 Days</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      ref={progressRef}
                      className="h-full w-full bg-[var(--lp-sage)] rounded-full shadow-[0_0_16px_var(--lp-sage-glow)] origin-left"
                      style={{ transform: "scaleX(0)" }}
                      role="progressbar"
                      aria-valuenow={67}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Test cycle 67 percent complete"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--lp-line)] bg-black/40 p-4 space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-sage)]">
                    Latest Feedback
                  </p>
                  <p className="font-sans text-[13px] text-[var(--lp-muted)] leading-relaxed italic">
                    “Torsional feel is tighter than REV-1. Spin window holds after long sessions.”
                  </p>
                </div>

                <a
                  href="#testing-log"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lp-sage)] hover:text-[var(--lp-sage-bright)] transition-colors"
                >
                  View All Tests <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </LandingScrollReveal>
        </div>
      </div>
    </section>
  );
}
