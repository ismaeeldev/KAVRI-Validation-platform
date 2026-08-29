"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MetricCountUp } from "@/components/brand/animated-landing-elements";
import { LandingScrollReveal, LandingColumnStagger } from "@/components/brand/landing-motion";
import type { PublicMetricsDTO } from "@/server/services/public-queries-service";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHECK_ITEMS = [
  { id: "01", label: "Static weight", unit: "g" },
  { id: "02", label: "Swing weight", unit: "SW" },
  { id: "03", label: "Twist weight", unit: "TW" },
  { id: "04", label: "Balance point", unit: "mm" },
  { id: "05", label: "Surface friction", unit: "μ" },
  { id: "06", label: "Core integrity", unit: "σ" },
];

const BATCH_ITEMS = [
  { step: "A", label: "Lab tests", desc: "Measured before field" },
  { step: "B", label: "Field tests", desc: "Real sessions logged" },
  { step: "C", label: "Durability", desc: "Wear & integrity" },
  { step: "D", label: "Feedback", desc: "Structured notes" },
];

const PIPELINE = [
  "Inspect incoming sample",
  "Measure & log specs",
  "Assign to field testers",
  "Collect cycle feedback",
  "Review & decide next step",
];

interface Props {
  metrics: PublicMetricsDTO;
}

export function LandingMetrics({ metrics }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const snapshot = [
    { value: metrics.revisionsCount, label: "Variants", sub: "in testing" },
    { value: metrics.samplesReceived, label: "Samples", sub: "tracked" },
    { value: metrics.approvedTesters, label: "Testers", sub: "approved" },
    { value: metrics.activeAssignments, label: "Active", sub: "assignments" },
    { value: metrics.publishedUpdates, label: "Updates", sub: "published" },
  ].filter((c) => c.value > 0);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const spine = root.querySelector("[data-pipeline-spine]");
      const activeNode = root.querySelector("[data-pipeline-node-active]");

      if (spine) {
        gsap.fromTo(
          spine,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 72%", once: true },
          }
        );
      }

      if (activeNode) {
        gsap.fromTo(
          activeNode,
          { boxShadow: "0 0 0 0 var(--lp-sage-glow)" },
          {
            boxShadow: "0 0 28px -2px var(--lp-sage-glow)",
            duration: 1.4,
            repeat: 2,
            yoyo: true,
            ease: "sine.inOut",
            scrollTrigger: { trigger: root, start: "top 70%", once: false },
          }
        );
      }

      root.querySelectorAll("[data-check-chip]").forEach((chip, i) => {
        gsap.fromTo(
          chip,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            delay: i * 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          }
        );
      });

      root.querySelectorAll("[data-metric-chip]").forEach((chip, i) => {
        gsap.fromTo(
          chip,
          { opacity: 0, y: 16, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            delay: i * 0.07,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 78%", once: true },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="validation-snapshot"
      className="relative border-b border-[var(--lp-line)] lp-section-wash px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-28 overflow-hidden"
      aria-label="Technical specifications and validation"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[var(--lp-sage)]/6 blur-3xl"
        aria-hidden
      />

      <div className="max-w-[1280px] mx-auto space-y-10 md:space-y-12">
        <LandingScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
              Technical Specifications & Validation
            </p>
            <h2
              className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-[1.05]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              Validation{" "}
              <span className="text-[var(--lp-sage)]">Snapshot</span>
            </h2>
            <p className="font-sans text-sm text-[var(--lp-muted)] max-w-lg leading-relaxed">
              Every batch runs through the same protocol — measured, logged, and published before
              anything moves forward.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 rounded-xl border border-[var(--lp-sage)]/25 bg-[var(--lp-sage-soft)] px-4 py-2.5">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--lp-sage)] opacity-40 lp-live-dot" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--lp-sage)]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lp-sage)] font-bold">
              Protocol Active
            </span>
          </div>
        </LandingScrollReveal>

        {snapshot.length > 0 && (
          <LandingScrollReveal>
            <div className="flex flex-wrap items-stretch gap-2.5 sm:gap-3">
              {snapshot.map(({ value, label, sub }, i) => (
                <div
                  key={label}
                  data-metric-chip
                  className="group relative flex min-w-[calc(50%-0.3125rem)] sm:min-w-0 sm:flex-1 items-center gap-3 sm:gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent px-4 sm:px-5 py-3.5 sm:py-4 backdrop-blur-sm transition-all duration-300 hover:border-[var(--lp-sage)]/35 hover:shadow-[0_0_32px_-12px_var(--lp-sage-glow)]"
                >
                  <span
                    className="font-mono text-[9px] font-bold text-[var(--lp-sage)]/50 group-hover:text-[var(--lp-sage)] transition-colors tabular-nums"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-heading font-bold text-2xl sm:text-[1.75rem] lg:text-3xl text-[var(--lp-sage)] tabular-nums leading-none tracking-tight shrink-0">
                      <MetricCountUp value={value} />
                    </span>
                    <div className="min-w-0 hidden sm:block">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--lp-text)] leading-tight truncate">
                        {label}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--lp-muted)] truncate">
                        {sub}
                      </p>
                    </div>
                  </div>
                  <div className="sm:hidden ml-auto text-right min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--lp-muted)] leading-tight truncate">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </LandingScrollReveal>
        )}

        <LandingColumnStagger className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* Spec grid */}
          <div
            data-column-item
            className="lg:col-span-5 relative overflow-hidden rounded-2xl border border-[var(--lp-line)] bg-[var(--lp-elevated)] p-6 sm:p-7"
          >
            <div className="absolute inset-0 lp-noise opacity-[0.15]" aria-hidden />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lp-sage)] font-bold">
                  What We Check
                </h3>
                <span className="font-mono text-[9px] text-white/35 uppercase tracking-wider">
                  6 metrics
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {CHECK_ITEMS.map(({ id, label, unit }) => (
                  <div
                    key={label}
                    data-check-chip
                    className="group relative rounded-xl border border-white/8 bg-black/30 px-3.5 py-3 transition-all duration-300 hover:border-[var(--lp-sage)]/40 hover:bg-[var(--lp-sage-soft)] hover:shadow-[0_0_24px_-8px_var(--lp-sage-glow)]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[9px] text-[var(--lp-sage)]/70">{id}</span>
                      <span className="font-mono text-[9px] text-white/25 group-hover:text-[var(--lp-sage)]/60 transition-colors">
                        {unit}
                      </span>
                    </div>
                    <p className="font-sans text-[13px] font-medium text-[var(--lp-text)] leading-snug">
                      {label}
                    </p>
                    <span
                      className="absolute bottom-2.5 right-2.5 w-4 h-4 rounded-md bg-[var(--lp-sage)]/0 group-hover:bg-[var(--lp-sage)] text-transparent group-hover:text-[var(--lp-sage-ink)] flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                      aria-hidden
                    >
                      ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Batch flow */}
          <div
            data-column-item
            className="lg:col-span-4 relative overflow-hidden rounded-2xl border border-[var(--lp-line)] bg-[var(--lp-elevated)] p-6 sm:p-7"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--lp-sage)]/8 blur-2xl"
              aria-hidden
            />
            <div className="relative space-y-5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lp-sage)] font-bold">
                For Every Batch
              </h3>
              <div className="relative space-y-0">
                <div
                  className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-[var(--lp-sage)]/50 via-white/10 to-transparent"
                  aria-hidden
                />
                {BATCH_ITEMS.map(({ step, label, desc }, i) => (
                  <div
                    key={label}
                    className="relative flex items-start gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--lp-sage)]/35 bg-black/50 font-mono text-[11px] font-bold text-[var(--lp-sage)]">
                      {step}
                    </span>
                    <div className="pt-0.5 min-w-0">
                      <p className="font-sans text-sm font-semibold text-[var(--lp-text)]">{label}</p>
                      <p className="font-mono text-[10px] text-[var(--lp-muted)] mt-0.5">{desc}</p>
                    </div>
                    {i < BATCH_ITEMS.length - 1 && (
                      <span className="absolute left-[31px] bottom-0 w-2 h-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/10" aria-hidden />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline rail */}
          <div
            data-column-item
            className="lg:col-span-3 relative overflow-hidden rounded-2xl border border-[var(--lp-sage)]/25 bg-gradient-to-b from-[var(--lp-sage-soft)] to-[var(--lp-elevated)] p-6 sm:p-7 shadow-[0_0_48px_-20px_var(--lp-sage-glow)]"
          >
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lp-sage)] font-bold">
                  Live Pipeline
                </h3>
                <span className="font-mono text-[9px] text-white/40">05 steps</span>
              </div>
              <ol className="relative space-y-0">
                <div
                  data-pipeline-spine
                  className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--lp-sage)] via-[var(--lp-sage)]/40 to-white/10"
                  aria-hidden
                />
                {PIPELINE.map((step, i) => {
                  const isActive = i === 3;
                  return (
                    <li
                      key={step}
                      className={`relative flex items-start gap-3 py-2.5 ${
                        isActive ? "pl-0" : ""
                      }`}
                    >
                      <span
                        data-pipeline-node-active={isActive ? "true" : undefined}
                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold ${
                          isActive
                            ? "border-[var(--lp-sage)] bg-[var(--lp-sage)] text-[var(--lp-sage-ink)]"
                            : i < 3
                              ? "border-[var(--lp-sage)]/60 bg-black/60 text-[var(--lp-sage)]"
                              : "border-white/20 bg-black/40 text-white/40"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`text-[13px] leading-snug pt-0.5 ${
                          isActive
                            ? "text-[var(--lp-text)] font-semibold"
                            : i < 3
                              ? "text-[var(--lp-muted)]"
                              : "text-white/35"
                        }`}
                      >
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </LandingColumnStagger>
      </div>
    </section>
  );
}
