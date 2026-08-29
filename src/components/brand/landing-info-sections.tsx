"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PublicProductDTO, PublicWhatChangedDTO } from "@/server/services/public-queries-service";
import { AnimeStaggerIn, LandingScrollReveal, useSvgStrokeReveal } from "@/components/brand/landing-motion";
import { WaitlistForm } from "@/components/brand/waitlist-form";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EVIDENCE_STRENGTH_LABELS: Record<string, { label: string; tone: string }> = {
  early_signal: {
    label: "Early Signal",
    tone: "bg-white/5 text-[var(--lp-muted)] border-white/10",
  },
  directional_evidence: {
    label: "Directional Evidence",
    tone: "bg-amber-500/10 text-amber-200/90 border-amber-500/20",
  },
  repeated_observation: {
    label: "Repeated Observation",
    tone: "bg-sky-500/10 text-sky-200/90 border-sky-500/20",
  },
  strong_internal_confidence: {
    label: "Strong Internal Confidence",
    tone: "bg-[var(--lp-sage)]/15 text-[var(--lp-sage-bright)] border-[var(--lp-sage)]/30",
  },
};

export function EvidenceStrengthBadge({ evidenceStrength }: { evidenceStrength: string | null }) {
  const entry = evidenceStrength ? EVIDENCE_STRENGTH_LABELS[evidenceStrength] : null;
  if (!entry) return null;
  return (
    <span
      className={`inline-block font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${entry.tone}`}
    >
      {entry.label}
    </span>
  );
}

interface LandingWhatWeAreBuildingProps {
  products: PublicProductDTO[];
}

function CornerBrackets() {
  const corner =
    "absolute w-8 h-8 border-[var(--lp-sage)]/70 pointer-events-none";
  return (
    <>
      <span className={`${corner} top-4 left-4 border-t-2 border-l-2 rounded-tl-sm`} aria-hidden />
      <span className={`${corner} top-4 right-4 border-t-2 border-r-2 rounded-tr-sm`} aria-hidden />
      <span className={`${corner} bottom-16 left-4 border-b-2 border-l-2 rounded-bl-sm`} aria-hidden />
      <span className={`${corner} bottom-16 right-4 border-b-2 border-r-2 rounded-br-sm`} aria-hidden />
    </>
  );
}

function BuildingCraftVisual({
  imageRef,
  title,
}: {
  imageRef: React.RefObject<HTMLDivElement | null>;
  title: string;
}) {
  return (
    <div className="relative lg:pr-5 lg:pb-5">
      {/* Offset luminous frame */}
      <div
        className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 rounded-2xl border border-[var(--lp-sage)]/20 shadow-[0_0_40px_-12px_var(--lp-sage-glow)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-2 -left-2 h-16 w-16 rounded-full bg-[var(--lp-sage)]/10 blur-2xl"
        aria-hidden
      />

      <div
        ref={imageRef}
        className="relative min-h-[360px] sm:min-h-[440px] lg:min-h-[520px] overflow-hidden rounded-2xl border border-[var(--lp-line-strong)] bg-[#0a0a0a] shadow-[0_32px_80px_-28px_rgba(0,0,0,0.9)]"
      >
        <div data-building-img className="absolute inset-0 will-change-transform">
          <Image
            src="/kavri-craft-hands.jpg"
            alt="Craftsman inspecting a KAVRI paddle in the workshop"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover object-[center_38%] scale-105"
            priority={false}
          />
        </div>

        {/* Technical overlays */}
        <div className="absolute inset-0 lp-grid-bg opacity-[0.14]" aria-hidden />
        <div className="absolute inset-0 lp-noise opacity-[0.22]" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(184,255,46,0.08), transparent 55%)",
          }}
          aria-hidden
        />
        {/* Fade toward copy column on desktop */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/15 to-black/65 lg:to-[#070807]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/35" />

        {/* Bridge line to text panel */}
        <div
          className="hidden lg:block absolute top-[18%] -right-px w-[2px] h-[64%] bg-gradient-to-b from-transparent via-[var(--lp-sage)] to-transparent opacity-80 shadow-[0_0_16px_var(--lp-sage-glow)]"
          aria-hidden
        />

        <CornerBrackets />

        {/* Floating spec chips */}
        <div
          data-building-chip
          className="absolute top-5 left-5 right-5 sm:right-auto flex items-center gap-2 rounded-xl border border-white/10 bg-black/45 backdrop-blur-md px-3.5 py-2.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--lp-sage)] shadow-[0_0_8px_var(--lp-sage)]" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-sage)] font-bold">
            Craft Verification
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-white/45">·</span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-white/60">
            Layer-by-layer
          </span>
        </div>

        <div
          data-building-chip
          className="absolute top-[4.5rem] right-5 hidden sm:flex flex-col gap-0.5 rounded-xl border border-[var(--lp-sage)]/25 bg-[var(--lp-sage-soft)] backdrop-blur-sm px-3 py-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--lp-muted)]">
            Current focus
          </span>
          <span className="font-heading font-bold text-sm text-[var(--lp-text)] leading-tight max-w-[140px]">
            {title}
          </span>
        </div>

        {/* Bottom metadata strip */}
        <div
          data-building-chip
          className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-black/55 backdrop-blur-md px-5 py-3.5 flex items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lp-sage)]">
              Hand-finished carbon
            </p>
            <p className="font-sans text-[12px] text-white/70 leading-snug">
              Every surface inspected before field testing
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] text-white/45 uppercase tracking-wider shrink-0">
            <span>220g</span>
            <span className="w-px h-3 bg-white/20" aria-hidden />
            <span>16mm</span>
            <span className="w-px h-3 bg-white/20" aria-hidden />
            <span className="text-[var(--lp-sage)]">Pass</span>
          </div>
        </div>

        {/* Scan line accent */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[var(--lp-sage)]/40 to-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
}

function isPlaceholderAlias(value: string | null | undefined) {
  if (!value) return true;
  const v = value.trim().toLowerCase();
  return (
    v === "tester name" ||
    v === "generic product" ||
    v === "test" ||
    v === "untitled" ||
    v === "public summary" ||
    v.includes("punlic") ||
    v.length < 24
  );
}

export function LandingWhatWeAreBuilding({ products }: LandingWhatWeAreBuildingProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const featured = products[0] ?? null;
  const title =
    featured && !isPlaceholderAlias(featured.publicAlias)
      ? featured.publicAlias
      : "Apex Matrix · Field Cycle";
  const summary =
    featured?.publicSummary?.trim() && !isPlaceholderAlias(featured.publicSummary)
      ? featured.publicSummary
      : "Premium hardware developed with the player in mind — logged samples, measured specs, and public validation before anything ships.";

  useGSAP(
    () => {
      const root = imageRef.current;
      if (!root || !sectionRef.current) return;

      const img = root.querySelector("[data-building-img]");
      const chips = root.querySelectorAll("[data-building-chip]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
      });

      tl.fromTo(
        root,
        { clipPath: "inset(6% 6% 6% 6% round 1rem)", opacity: 0.85 },
        { clipPath: "inset(0% 0% 0% 0% round 1rem)", opacity: 1, duration: 1, ease: "power3.out" },
        0
      );

      if (img) {
        tl.fromTo(
          img,
          { scale: 1.14 },
          { scale: 1.05, duration: 1.2, ease: "power2.out" },
          0
        );
      }

      if (chips.length) {
        tl.fromTo(
          chips,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out" },
          0.35
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="what-we-are-building"
      className="border-b border-[var(--lp-line)] px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-28"
    >
      <LandingScrollReveal className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
        <BuildingCraftVisual imageRef={imageRef} title={title} />

        <div className="flex flex-col justify-center space-y-6 lg:py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
            The People Behind the Build
          </p>
          <h2
            className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-[1.05]"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            What We Are{" "}
            <span className="text-[var(--lp-sage)]">Building</span>
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[var(--lp-muted)] leading-relaxed font-sans max-w-md">
            {summary}
          </p>

          <div className="lp-card lp-card-lift rounded-2xl p-6 sm:p-7 space-y-4 border-[var(--lp-sage)]/20 shadow-[0_0_40px_-18px_var(--lp-sage-glow)]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-sage)] mb-1.5">
                Current Direction
              </p>
              <h3 className="font-heading font-bold text-xl tracking-tight text-[var(--lp-text)]">
                {title}
              </h3>
            </div>
            <div className="space-y-2 pt-1 border-t border-[var(--lp-line)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lp-muted)]">
                Join the Early Access List
              </p>
              <WaitlistForm ctaSource="what-we-are-building" variant="premium" />
            </div>
          </div>
        </div>
      </LandingScrollReveal>
    </section>
  );
}

const VALIDATION_STEPS = [
  {
    step: "01",
    title: "Select Partners",
    desc: "Manufacturing and material partners are chosen for precision, not just price.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="journey-icon">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Build Prototypes",
    desc: "Physical samples are produced and logged before they earn a place in testing.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="journey-icon">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Inspect & Measure",
    desc: "Every incoming sample is logged and visually inspected before it earns the right to be tested.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="journey-icon">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Assign & Play",
    desc: "Approved testers log first-impression and follow-up evaluations from real sessions.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="journey-icon">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Review & Refine",
    desc: "Results are compared against target specs and prior revisions to see what actually changed.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="journey-icon">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    step: "06",
    title: "Certify & Release",
    desc: "A recorded decision — advance, modify, reject, or gather more evidence — closes the loop.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="journey-icon">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export function LandingHowWeValidate() {
  const iconsRef = useRef<HTMLElement>(null);
  useSvgStrokeReveal(iconsRef);

  return (
    <section
      id="how-we-test"
      className="border-b border-[var(--lp-line)] lp-section-wash px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-28"
    >
      <div className="max-w-[1280px] mx-auto space-y-12 md:space-y-14">
        <LandingScrollReveal className="max-w-2xl space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
            Our Open Product Journey
          </p>
          <h2
            className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-[1.05]"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            How KAVRI{" "}
            <span className="text-[var(--lp-sage)]">Validates</span>
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[var(--lp-muted)] leading-relaxed font-sans">
            Six gates. No shortcuts. Every paddle that reaches players has passed through this
            public process.
          </p>
        </LandingScrollReveal>

        <AnimeStaggerIn>
          <ol
            ref={iconsRef as React.RefObject<HTMLOListElement>}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {VALIDATION_STEPS.map(({ step, title, desc, icon }) => (
              <li
                key={step}
                data-stagger-item
                className="lp-card lp-card-lift group relative overflow-hidden rounded-2xl p-6 sm:p-7 space-y-4 transition-all duration-300 hover:border-[var(--lp-sage)]/35 hover:shadow-[0_0_36px_-14px_var(--lp-sage-glow)]"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--lp-sage) 22%, transparent), transparent 70%)",
                  }}
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="text-[var(--lp-sage)] drop-shadow-[0_0_10px_var(--lp-sage-glow)]">
                    {icon}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[var(--lp-sage)] tracking-[0.16em]">
                    {step}
                  </span>
                </div>
                <div className="relative space-y-2">
                  <h3 className="font-heading font-bold text-[15px] tracking-tight text-[var(--lp-text)]">
                    {title}
                  </h3>
                  <p className="text-[13px] sm:text-[14px] text-[var(--lp-muted)] leading-relaxed font-sans">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </AnimeStaggerIn>
      </div>
    </section>
  );
}

interface LandingWhatChangedAndWhyProps {
  decisions: PublicWhatChangedDTO[];
}

export function LandingWhatChangedAndWhy({ decisions }: LandingWhatChangedAndWhyProps) {
  if (decisions.length === 0) return null;

  return (
    <section className="border-b border-[var(--lp-line)] lp-section-wash px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto space-y-10">
        <LandingScrollReveal className="max-w-2xl space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
            Recorded Decisions
          </p>
          <h2
            className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-[1.05]"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            What Changed and{" "}
            <span className="text-[var(--lp-sage)]">Why</span>
          </h2>
        </LandingScrollReveal>

        <AnimeStaggerIn className="space-y-4">
          {decisions.map((decision) => (
            <div
              key={decision.id}
              data-stagger-item
              className="lp-card lp-card-lift border border-[var(--lp-line)] rounded-2xl p-6 md:p-7 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <EvidenceStrengthBadge evidenceStrength={decision.evidenceStrength} />
                <time
                  dateTime={new Date(decision.decisionDate).toISOString()}
                  className="font-mono text-[10px] text-[var(--lp-muted)]"
                >
                  {new Date(decision.decisionDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <p className="text-sm text-[var(--lp-text)]/90 leading-relaxed font-sans font-light">
                {decision.publicVersion}
              </p>
            </div>
          ))}
        </AnimeStaggerIn>
      </div>
    </section>
  );
}

export function LandingAboutKavri() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;
      gsap.fromTo(
        root.querySelector("[data-about-accent]"),
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  const PRINCIPLES = [
    { label: "Open validation", desc: "Every cycle published" },
    { label: "Player-first", desc: "Built with testers" },
    { label: "Data-led", desc: "Specs over slogans" },
  ];

  return (
    <section
      ref={sectionRef}
      id="about-kavri"
      className="relative px-5 sm:px-6 md:px-10 pt-16 sm:pt-20 md:pt-28 pb-24 sm:pb-28 md:pb-36"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 lp-grid-bg opacity-[0.04]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[var(--lp-sage)]/5 blur-3xl"
        aria-hidden
      />

      <AnimeStaggerIn className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div data-stagger-item className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
              Who We Are
            </p>
            <h2
              className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-[1.05]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              About{" "}
              <span className="text-[var(--lp-sage)]">KAVRI</span>
            </h2>
            <div
              data-about-accent
              className="h-[2px] w-16 bg-gradient-to-r from-[var(--lp-sage)] to-transparent"
              aria-hidden
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {PRINCIPLES.map(({ label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-[var(--lp-line)] bg-[var(--lp-elevated)]/60 px-4 py-3 transition-colors hover:border-[var(--lp-sage)]/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lp-sage)] shrink-0" aria-hidden />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--lp-sage)] font-bold">
                    {label}
                  </p>
                  <p className="font-sans text-[12px] text-[var(--lp-muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-stagger-item className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--lp-line)] bg-gradient-to-br from-[var(--lp-elevated)] to-black/40 p-8 sm:p-10 lg:p-12 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 lp-noise opacity-[0.12]" aria-hidden />
            <div
              className="absolute top-0 right-0 w-40 h-40 bg-[var(--lp-sage)]/6 blur-3xl rounded-full"
              aria-hidden
            />
            <div className="relative space-y-6">
              <span className="font-heading text-5xl sm:text-6xl text-[var(--lp-sage)]/20 leading-none select-none" aria-hidden>
                &ldquo;
              </span>
              <p className="font-sans text-[16px] sm:text-[18px] text-[var(--lp-text)] leading-relaxed -mt-8">
                KAVRI builds premium hardware for players who care how a product{" "}
                <span className="text-[var(--lp-sage)] font-medium">performs</span>, not just how
                it&apos;s marketed. We publish our validation process because accountability makes
                better products — every design decision on this page is backed by real testing, not
                a press release.
              </p>
              <div className="flex items-center gap-4 pt-2 border-t border-[var(--lp-line)]">
                <div className="h-10 w-10 rounded-full border border-[var(--lp-sage)]/40 flex items-center justify-center font-heading font-bold text-[var(--lp-sage)] text-sm">
                  K
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-[var(--lp-text)]">KAVRI</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--lp-muted)]">
                    Performance hardware, validated in public
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimeStaggerIn>
    </section>
  );
}
