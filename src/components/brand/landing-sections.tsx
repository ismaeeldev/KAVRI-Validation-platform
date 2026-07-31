import React from "react";
import { WaitlistForm } from "@/components/brand/waitlist-form";
import { TesterApplicationDialog } from "@/components/brand/tester-application-dialog";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import Link from "next/link";

const VALUES = [
  {
    number: "01",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: "Accountability",
    desc: "We document every decision and share the results so you can hold us to a higher standard.",
    tag: "Transparent Process",
  },
  {
    number: "02",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "Better Products",
    desc: "Real data and real feedback from active field testing lead to products that perform when it counts.",
    tag: "Data-Driven",
  },
  {
    number: "03",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94-3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Community First",
    desc: "You're not just a customer—you're part of the process. The best products are built together.",
    tag: "Open Testing",
  },
];

export function LandingValues() {
  return (
    <section
      id="why-kavri-tests"
      className="bg-kavri-surface border-b border-kavri-line px-6 md:px-10 py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto space-y-14">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-block">
              <span className="relative inline-block text-kavri-ink font-mono text-[10px] uppercase tracking-[0.18em] font-black whitespace-nowrap select-none">
                <span
                  className="absolute -inset-x-4 -inset-y-2 bg-no-repeat pointer-events-none"
                  style={{ backgroundImage: "url('/paint-stroke.png')", backgroundSize: "100% 100%" }}
                />
                <span className="relative z-10">Why KAVRI Tests</span>
              </span>
            </div>
            <h2
              className="font-heading font-black uppercase text-kavri-ink leading-[1.05]"
              style={{ fontSize: "clamp(24px, 3vw, 40px)" }}
            >
              Rigorous Validation Is<br />Our Fingerprint
            </h2>
          </div>
          <p className="font-sans text-sm text-kavri-muted leading-relaxed max-w-xs md:text-right">
            Every product decision is backed by evidence—visible to anyone who cares to look.
          </p>
        </div>

        {/* Value cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map(({ number, icon, title, desc, tag }) => (
            <div
              key={title}
              className="group bg-kavri-surface border border-kavri-line rounded-xl p-8 space-y-6 hover:shadow-[0_6px_28px_rgba(0,0,0,0.08)] hover:border-kavri-line-strong hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
            >
              {/* Subtle top accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-kavri-signal opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-xl" />

              {/* Card top row: number + icon */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#f0f8ce] flex items-center justify-center text-kavri-ink shrink-0 group-hover:bg-kavri-signal group-hover:text-kavri-ink transition-colors duration-200">
                  {icon}
                </div>
                <span className="font-mono text-[11px] font-black text-kavri-muted tracking-wider select-none">
                  {number}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-heading font-black uppercase text-[15px] text-kavri-ink tracking-wide">
                  {title}
                </h3>
                <p className="text-[13px] text-kavri-muted leading-relaxed font-sans">{desc}</p>
              </div>

              {/* Tag pill */}
              <div>
                <span className="inline-block font-mono text-[9px] font-black uppercase tracking-wider bg-[#f0f0ed] text-kavri-muted border border-kavri-line px-2.5 py-1 rounded-md">
                  {tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingNewsletterCTA() {
  return (
    <section
      id="join-the-build"
      className="bg-[#0f1111] border-b border-[#1a1d1c] px-6 md:px-10 py-16 md:py-24 relative overflow-hidden"
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      <div className="max-w-[1280px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: headline */}
        <div className="space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-signal font-black">
            Join the Build
          </p>
          <h2
            className="font-heading font-black uppercase text-white leading-[1.0]"
            style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
          >
            Get Notified
            <br />
            of the{" "}
            <span className="text-kavri-signal">Launch.</span>
          </h2>
          <p className="font-sans text-sm text-[#7a8078] leading-relaxed max-w-sm">
            Join the waitlist and be first to know when new validation cycles go live, test results drop, and launch windows open.
          </p>
        </div>

        {/* Right: form */}
        <div className="space-y-5">
          <WaitlistForm ctaSource="update" />
          <div className="inline-block pt-1">
            <span className="relative inline-block text-kavri-ink font-mono text-[10px] uppercase tracking-wider font-black whitespace-nowrap select-none">
              <span
                className="absolute -inset-x-4 -inset-y-1.5 bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: "url('/paint-stroke.png')",
                  backgroundSize: "100% 100%"
                }}
              />
              <span className="relative z-10">No spam. Unsubscribe anytime.</span>
            </span>
          </div>
          <div className="pt-2 border-t border-[#1a1d1c] mt-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#7a8078] mb-3 pt-4">
              Want hands-on access instead?
            </p>
            <TesterApplicationDialog />
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const NAV_LINKS = [
    { href: "#current-testing", label: "What We Test" },
    { href: "#testing-log", label: "Testing Log" },
    { href: "#about-kavri", label: "About" },
  ];

  return (
    <footer className="bg-kavri-surface border-t border-kavri-line px-6 md:px-10 py-8">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" aria-label="KAVRI home" className="shrink-0">
          <KAVRIWordmark />
        </Link>

        {/* Nav */}
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="font-mono text-[11px] text-kavri-muted hover:text-kavri-ink transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-kavri-signal rounded-sm"
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            className="font-mono text-[11px] text-kavri-muted hover:text-kavri-ink transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-kavri-signal rounded-sm"
          >
            Team Login
          </Link>
        </nav>

        {/* Copyright */}
        <div>
          <span className="font-mono text-[10px] text-kavri-muted whitespace-nowrap">
            &copy; {new Date().getFullYear()} KAVRI. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
