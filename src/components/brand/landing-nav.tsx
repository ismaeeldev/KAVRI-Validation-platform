"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import { TesterApplicationDialog } from "@/components/brand/tester-application-dialog";

const ANCHOR_LINKS = [
  { href: "#how-we-test", label: "How We Test" },
  { href: "#current-testing", label: "Current Testing" },
  { href: "#testing-log", label: "Testing Log" },
  { href: "#about-kavri", label: "About" },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 select-none transition-[background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
          ? "bg-[#050505]/88 backdrop-blur-2xl border-b border-[var(--lp-line)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="KAVRI home"
          className="shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--lp-sage)] focus-visible:outline-offset-2 rounded-md"
        >
          <KAVRIWordmark className="text-xl text-[var(--lp-text)] [&_span]:text-[var(--lp-sage)]" />
        </Link>

        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-9">
          {ANCHOR_LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="font-sans text-[13px] tracking-wide text-[var(--lp-text)]/80 hover:text-[var(--lp-text)] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lp-nav-link lp-focus-ring rounded-md py-1.5"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <a
              href="#current-testing"
              className="inline-flex items-center justify-center border border-white/25 text-[var(--lp-text)] hover:border-[var(--lp-sage)] hover:text-[var(--lp-sage)] transition-colors duration-200 px-4 h-10 font-sans text-xs font-semibold rounded-xl mr-2 lp-focus-ring"
            >
              View All Tests
            </a>
            <TesterApplicationDialog variant="premium" />
          </div>
          <a
            href="#join-the-build"
            className="hidden md:inline-flex items-center justify-center gap-1.5 bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] hover:bg-[var(--lp-sage-bright)] transition-colors duration-200 px-5 h-10 font-sans text-xs font-bold tracking-wide rounded-xl lp-focus-ring active:scale-[0.985]"
          >
            Join the Build
          </a>

          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2.5 rounded-md text-[var(--lp-text)] hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--lp-sage)]"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[var(--lp-line)] bg-[#050505]/98 backdrop-blur-xl px-6 py-5 space-y-4"
        >
          {ANCHOR_LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lp-text)] py-1.5 hover:text-[var(--lp-sage)] transition-colors lp-focus-ring rounded-md"
            >
              {label}
            </a>
          ))}
          <div className="pt-2">
            <TesterApplicationDialog variant="premium" />
          </div>
          <a
            href="#join-the-build"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center gap-1.5 bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] px-5 h-10 font-sans text-xs font-bold rounded-xl mt-2 w-full lp-focus-ring active:scale-[0.985]"
          >
            Join the Build
          </a>
        </nav>
      )}
    </header>
  );
}
