"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WaitlistForm } from "@/components/brand/waitlist-form";
import { TesterApplicationDialog } from "@/components/brand/tester-application-dialog";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import { AnimeStaggerIn, LandingScrollReveal } from "@/components/brand/landing-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VALUES = [
  {
    number: "01",
    title: "Craftsmanship You Can Trace",
    desc: "We document every decision and share the results so you can hold us to a higher standard.",
    tag: "Accountability",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Proof, Not Hype",
    desc: "Real data and real feedback from active field testing lead to products that perform when it counts.",
    tag: "Better Products",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Built With Players",
    desc: "You're not just a customer—you're part of the process. The best products are built together.",
    tag: "Community First",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function LandingValues() {
  return (
    <section
      id="why-kavri-tests"
      className="border-b border-[var(--lp-line)] lp-section-wash px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-28"
    >
      <div className="max-w-[1280px] mx-auto space-y-12 md:space-y-14">
        <LandingScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-semibold">
              Why This Is Public
            </p>
            <h2
              className="font-heading font-bold tracking-[-0.02em] text-[var(--lp-text)] leading-[1.05]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              Rigorous Validation Is Our{" "}
              <span className="text-[var(--lp-sage)]">Fingerprint</span>
            </h2>
          </div>
          <p className="font-sans text-sm text-[var(--lp-muted)] leading-relaxed max-w-xs md:text-right">
            Every product decision is backed by evidence—visible to anyone who cares to look.
          </p>
        </LandingScrollReveal>

        <AnimeStaggerIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {VALUES.map(({ number, icon, title, desc, tag }) => (
              <div
                key={title}
                data-stagger-item
                className="lp-card lp-card-static relative overflow-hidden rounded-2xl p-6 sm:p-7 space-y-5 border-[var(--lp-line)]"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-60"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--lp-sage) 20%, transparent), transparent 70%)",
                  }}
                  aria-hidden
                />
                <div className="relative flex items-start justify-between">
                  <div className="w-11 h-11 rounded-full border border-[var(--lp-sage)]/40 flex items-center justify-center text-[var(--lp-sage)] shadow-[0_0_16px_-4px_var(--lp-sage-glow)]">
                    {icon}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[var(--lp-sage)] tracking-wider">
                    {number}
                  </span>
                </div>
                <div className="relative space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--lp-sage)]">
                    {tag}
                  </p>
                  <h3 className="font-heading font-bold text-[16px] text-[var(--lp-text)] tracking-tight">
                    {title}
                  </h3>
                  <p className="text-[13px] sm:text-[14px] text-[var(--lp-muted)] leading-relaxed font-sans">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AnimeStaggerIn>
      </div>
    </section>
  );
}

export function LandingNewsletterCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bg = bgRef.current;
      const panel = panelRef.current;
      if (!bg || !sectionRef.current) return;

      gsap.to(bg.querySelector("img"), {
        yPercent: 14,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      if (panel) {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="join-the-build"
      className="relative border-b border-[var(--lp-line)] px-5 sm:px-6 md:px-10 py-20 sm:py-24 md:py-32 overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0" aria-hidden>
        <Image
          src="/kavri-grip-closeup.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center scale-110"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 lp-grid-bg opacity-[0.12]" />
        <div className="absolute inset-0 lp-noise opacity-[0.18]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(184,255,46,0.12), transparent 55%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[var(--lp-sage)]/6 blur-[100px]"
        aria-hidden
      />

      <div ref={panelRef} className="max-w-[960px] mx-auto relative z-10">
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/45 backdrop-blur-xl shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9),0_0_60px_-20px_var(--lp-sage-glow)]">
          {/* Corner accents */}
          <span className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[var(--lp-sage)]/60 rounded-tl-sm pointer-events-none" aria-hidden />
          <span className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[var(--lp-sage)]/60 rounded-tr-sm pointer-events-none" aria-hidden />
          <span className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[var(--lp-sage)]/60 rounded-bl-sm pointer-events-none" aria-hidden />
          <span className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[var(--lp-sage)]/60 rounded-br-sm pointer-events-none" aria-hidden />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6 text-left">
              <div className="space-y-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lp-sage)] font-bold">
                  Join the Build
                </p>
                <h2
                  className="font-heading font-bold tracking-[-0.03em] text-white leading-[1.05]"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                >
                  Follow the build before the paddle is final.
                </h2>
                <p className="font-sans text-sm sm:text-[15px] text-white/60 leading-relaxed">
                  Be first when new validation cycles go live, results drop, and launch windows open.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Early access", "Zero spam", "Public by default"].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] uppercase tracking-wider text-white/50 border border-white/10 rounded-lg px-2.5 py-1 bg-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5 bg-black/25">
              <div className="w-full">
                <WaitlistForm ctaSource="update" variant="premium-banner" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--lp-sage)] text-center lg:text-left">
                No spam. Unsubscribe anytime.
              </p>
              <div className="pt-4 border-t border-white/10">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3 text-center lg:text-left">
                  Want hands-on access instead?
                </p>
                <div className="flex justify-center lg:justify-start">
                  <TesterApplicationDialog variant="premium" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const NAV_LINKS = [
    { href: "#how-we-test", label: "How We Test" },
    { href: "#current-testing", label: "Current Testing" },
    { href: "#testing-log", label: "Testing Log" },
    { href: "#about-kavri", label: "About" },
  ];

  const SOCIAL = [
    {
      label: "X",
      href: "https://x.com",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "https://instagram.com",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: "https://youtube.com",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.2 3.5-6.2 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative shrink-0 bg-[#050505] border-t border-[var(--lp-line)] px-5 sm:px-6 md:px-10 py-12 md:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--lp-sage)]/25 to-transparent"
        aria-hidden
      />
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Link href="/" aria-label="KAVRI home" className="shrink-0 lp-focus-ring rounded-md">
            <KAVRIWordmark className="text-[var(--lp-text)] [&_span]:text-[var(--lp-sage)]" />
          </Link>

          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                className="font-mono text-[11px] text-[var(--lp-muted)] hover:text-[var(--lp-text)] transition-colors duration-150 lp-link-underline lp-focus-ring px-2 py-1 rounded-md"
              >
                {label}
              </a>
            ))}
            <Link
              href="/login"
              className="font-mono text-[11px] text-[var(--lp-muted)] hover:text-[var(--lp-sage)] transition-colors duration-150 lp-link-underline lp-focus-ring px-2 py-1 rounded-md"
            >
              Team Login
            </Link>
          </nav>

          <div className="flex items-center justify-center gap-3">
            {SOCIAL.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-[var(--lp-line)] text-[var(--lp-muted)] hover:border-[var(--lp-sage)] hover:text-[var(--lp-sage)] transition-colors flex items-center justify-center lp-focus-ring"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--lp-line)] pt-6">
          <p className="font-sans text-[12px] text-[var(--lp-muted)] max-w-md leading-relaxed">
            KAVRI builds performance paddles in public — testing first, shipping when the data says so.
          </p>
          <span className="font-mono text-[10px] text-[var(--lp-muted)] whitespace-nowrap">
            &copy; {new Date().getFullYear()} KAVRI. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
