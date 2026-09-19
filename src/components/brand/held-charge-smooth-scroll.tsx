"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/components/brand/motion-provider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis-driven smooth scroll for the "Held Charge" landing page, synced to
 * GSAP's ScrollTrigger so scroll-based reveal animations (HeldChargeReveal)
 * read the same eased scroll position instead of the raw native scrollTop.
 * Starts immediately (no boot-gate dependency, unlike the old landing
 * design) and no-ops entirely when the user prefers reduced motion.
 */
export function HeldChargeSmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.15,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    // Anchor links (#build, #form, etc.) should scroll through Lenis too,
    // not jump instantly via native anchor navigation.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.("a[href^='#']");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -68, duration: 1.1 });
    };
    document.addEventListener("click", onAnchorClick);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
