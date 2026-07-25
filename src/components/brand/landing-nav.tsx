"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KAVRIWordmark } from "@/components/brand/wordmark";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-kavri-line bg-kavri-surface sticky top-0 z-50 select-none">
      <div
        className="max-w-[1280px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between gap-6"
      >
        {/* Logo */}
        <Link href="/" aria-label="KAVRI home" className="shrink-0 focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-2 rounded-md">
          <KAVRIWordmark className="text-xl" />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-8"
        >
          {[
            { href: "#active-specimen", label: "What We Test" },
            { href: "#feed", label: "Testing Log" },
            { href: "#why-we-test", label: "About" },
            { href: "/login", label: "Validation Portal", isLink: true },
          ].map(({ href, label, isLink }) =>
            isLink ? (
              <Link
                key={label}
                href={href}
                className="font-sans text-sm text-kavri-muted hover:text-kavri-ink transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-kavri-signal rounded-md py-1.5"
              >
                {label}
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                className="font-sans text-sm text-kavri-muted hover:text-kavri-ink transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-kavri-signal rounded-md py-1.5"
              >
                {label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* CTA */}
          <a
            href="#signup"
            className="hidden md:inline-flex items-center justify-center gap-1.5 bg-kavri-signal text-kavri-ink border border-kavri-ink hover:bg-kavri-ink hover:text-white transition-all duration-200 px-5 h-10 font-sans text-xs font-bold rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-2 shadow-xs"
          >
            Follow the Build <span aria-hidden>›</span>
          </a>

          {/* Mobile hamburger */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal text-kavri-ink hover:bg-kavri-surface-subtle transition-colors"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-kavri-line bg-kavri-surface px-6 py-5 space-y-4"
        >
          {[
            { href: "#active-specimen", label: "What We Test" },
            { href: "#feed", label: "Testing Log" },
            { href: "#why-we-test", label: "About" },
            { href: "/login", label: "Validation Portal" },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block font-mono text-xs uppercase tracking-wider text-kavri-ink py-1.5 hover:text-kavri-signal transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href="#signup"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center gap-1.5 bg-kavri-signal text-kavri-ink border border-kavri-ink hover:bg-kavri-ink hover:text-white transition-all duration-200 px-5 h-10 font-sans text-xs font-bold rounded-lg mt-2 w-full shadow-xs"
          >
            Follow the Build ›
          </a>
        </nav>
      )}
    </header>
  );
}
