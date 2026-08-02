"use client";

import React, { useState } from "react";
import type { PublicProductDTO, PublicSampleSummaryDTO } from "@/server/services/public-queries-service";

interface Props {
  product: PublicProductDTO | null;
  sampleSummaries: PublicSampleSummaryDTO[];
}

export function LandingActiveSpecs({ product, sampleSummaries }: Props) {
  const [expanded, setExpanded] = useState(false);
  const revision = product?.revisions[0] ?? null;

  return (
    <section
      id="current-testing"
      className="bg-kavri-surface border-b border-kavri-line px-6 md:px-10 py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* ── LEFT ── */}
        <div className="space-y-6 lg:pt-2">
          <div className="inline-block">
            <span className="relative inline-block text-kavri-ink font-mono text-[10px] uppercase tracking-[0.18em] font-black whitespace-nowrap select-none">
              <span
                className="absolute -inset-x-4 -inset-y-2 bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: "url('/paint-stroke.png')",
                  backgroundSize: "100% 100%",
                }}
              />
              <span className="relative z-10">Current Test Focus</span>
            </span>
          </div>

          <h2 className="font-heading font-black uppercase text-kavri-ink leading-[1.05]" style={{ fontSize: "clamp(28px, 3.5vw, 46px)" }}>
            What We Are
            <br />
            Testing Right Now
          </h2>

          <p className="text-[15px] text-kavri-muted leading-relaxed max-w-[420px] font-sans">
            {revision
              ? `We are currently focused on whether ${revision.publicTitle} holds up to real-world play — structural integrity and durability under repeated use.`
              : "We are currently validating structural integrity and durability under repeated real-world play."}
          </p>

          <a
            href="#testing-log"
            className="inline-flex items-center gap-2 border border-kavri-line bg-kavri-surface text-kavri-ink hover:bg-kavri-surface-subtle hover:border-kavri-line-strong transition-colors duration-150 px-6 h-11 font-sans text-sm font-bold rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-2"
          >
            View All Tests <span aria-hidden>›</span>
          </a>

          {sampleSummaries.length > 0 && (
            <div className="pt-4 space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-kavri-muted font-semibold">
                Samples In Rotation
              </p>
              <div className="flex flex-wrap gap-3">
                {sampleSummaries.map((sample) => (
                  <div
                    key={sample.alias}
                    className="border border-kavri-line rounded-lg bg-[#fafaf8] px-4 py-2.5 space-y-0.5"
                  >
                    <p className="font-mono text-[10px] font-black text-kavri-ink uppercase">{sample.alias}</p>
                    <p className="font-mono text-[9px] text-kavri-muted uppercase tracking-wide">{sample.statusLabel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Spec Card ── */}
        <div className="border border-kavri-line rounded-2xl bg-kavri-surface shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Card header */}
          <div className="px-7 py-6 border-b border-kavri-line flex items-center justify-between bg-[#fafaf8]">
            <h3 className="font-heading font-black uppercase text-kavri-ink text-[18px] tracking-tight">
              {product?.publicAlias ?? "KAVRI Apex Specimen"}
            </h3>
            <span className="relative inline-block text-kavri-ink font-mono text-[9px] font-black uppercase tracking-wider px-3 py-1 select-none">
              <span
                className="absolute -inset-x-2 -inset-y-1.5 bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: "url('/paint-stroke.png')",
                  backgroundSize: "100% 100%",
                }}
              />
              <span className="relative z-10">Field Test</span>
            </span>
          </div>

          {/* Status + progress bar */}
          <div className="px-7 py-5 border-b border-kavri-line space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-kavri-muted">Testing status</span>
              <span className="font-mono text-[11px] font-black text-kavri-ink">
                {revision?.developmentStage
                  ? revision.developmentStage.charAt(0).toUpperCase() +
                    revision.developmentStage.slice(1).replace("_", " ")
                  : "Field Testing"}
              </span>
            </div>
            {/* Thin lime progress bar */}
            <div className="h-1.5 bg-kavri-line rounded-full overflow-hidden">
              <div
                className="h-full bg-kavri-signal rounded-full transition-all duration-700"
                style={{ width: "60%" }}
                aria-label="Validation progress 60%"
                role="progressbar"
                aria-valuenow={60}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {!product ? (
            <div className="px-7 py-10 text-center font-sans text-sm text-kavri-muted">
              The current approved revision specs have not yet been published.
            </div>
          ) : (
            <div className="px-7 py-6">
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                aria-expanded={expanded}
                className="w-full flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-kavri-muted font-semibold pb-2"
              >
                <span>Current Revision Context</span>
                <span aria-hidden>{expanded ? "−" : "+"}</span>
              </button>
              {expanded && (
                <div className="space-y-0 pt-2">
                  {[
                    { label: "Revision Code", value: revision?.revisionCode ?? "REV-1" },
                    { label: "Public Title", value: revision?.publicTitle ?? "Revision 1.0" },
                    { label: "Testing Focus", value: "Core Integrity · Structural Load · Durability" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-baseline py-3 border-b border-kavri-line last:border-b-0"
                    >
                      <span className="font-sans text-xs text-kavri-muted">{label}</span>
                      <span className="font-mono text-[11px] font-semibold text-kavri-ink text-right max-w-[55%]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
