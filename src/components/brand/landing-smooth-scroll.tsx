"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/components/brand/motion-provider";
import { useLandingBootReady } from "@/components/brand/landing-boot-ready";

gsap.registerPlugin(ScrollTrigger);

/** Lenis + ScrollTrigger — starts after boot to avoid jank on landing entry. */
export function LandingSmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const bootReady = useLandingBootReady();

  useEffect(() => {
    if (reduced || !bootReady) return;

    let lenis: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;
    let onResize: (() => void) | null = null;
    let destroyed = false;

    const startTimer = window.setTimeout(() => {
      if (destroyed) return;

      lenis = new Lenis({
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.2,
        syncTouch: false,
      });

      lenis.on("scroll", ScrollTrigger.update);
      requestAnimationFrame(() => ScrollTrigger.refresh());

      ticker = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      onResize = () => requestAnimationFrame(() => ScrollTrigger.refresh());
      window.addEventListener("resize", onResize);
    }, 350);

    return () => {
      destroyed = true;
      window.clearTimeout(startTimer);
      if (onResize) window.removeEventListener("resize", onResize);
      if (ticker) gsap.ticker.remove(ticker);
      lenis?.destroy();
    };
  }, [reduced, bootReady]);

  return <>{children}</>;
}
