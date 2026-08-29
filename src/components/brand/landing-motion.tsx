"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { animate, svg, utils } from "animejs";
import { motion } from "motion/react";
import { useReducedMotion } from "@/components/brand/motion-provider";
import { whenBootReady } from "@/components/brand/landing-boot-ready";

const { stagger } = utils;

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Quick, premium settle — snappy but smooth. */
const EASE = "power3.out";
const EASE_SNAP = "power4.out";

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

function afterPaint(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

/** Hero load — cinematic centered entrance. */
export function useLandingHeroMotion(scopeRef: React.RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !scopeRef.current) return;

      const runHero = () => {
        const root = scopeRef.current;
        if (!root) return;
        const bg = root.querySelector("[data-hero-bg]");
        const glow = root.querySelector("[data-hero-glow]");
        const panel = root.querySelector("[data-hero-panel]");
        const scrollHint = root.querySelector("[data-hero-scroll]");
        const mobile = isMobileViewport();

        gsap.set(panel, { opacity: 0, y: mobile ? 10 : 16 });
        gsap.set("[data-hero-eyebrow]", { opacity: 0 });
        gsap.set("[data-hero-status]", { opacity: 0 });
        gsap.set("[data-hero-narrative-label]", { opacity: 0 });
        gsap.set("[data-hero-headline]", { opacity: 0 });
        gsap.set("[data-hero-body]", { opacity: 0 });
        gsap.set("[data-hero-cta]", { opacity: 0 });
        gsap.set("[data-hero-cta-group]", { opacity: 0 });
        gsap.set("[data-hero-trust]", { opacity: 0 });
        gsap.set("[data-hero-trust-item]", { opacity: 0 });
        if (bg) gsap.set(bg, { scale: 1.04 });
        if (glow) gsap.set(glow, { opacity: 0 });
        if (scrollHint) gsap.set(scrollHint, { opacity: 0, y: -6 });

        const tl = gsap.timeline({ defaults: { ease: EASE_SNAP } });

        if (bg) {
          tl.to(bg, { scale: 1, duration: 1.1, ease: "power2.out" }, 0);
        }
        if (glow) {
          tl.to(glow, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0.1);
        }

        tl.to(panel, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, 0.15)
          .to("[data-hero-eyebrow]", { opacity: 1, duration: 0.35 }, 0.25)
          .to("[data-hero-status]", { opacity: 1, duration: 0.35 }, 0.3)
          .to("[data-hero-narrative-label]", { opacity: 1, duration: 0.35 }, 0.35)
          .to("[data-hero-headline]", { opacity: 1, duration: 0.45 }, 0.4)
          .to("[data-hero-body]", { opacity: 1, duration: 0.45, ease: EASE }, 0.48)
          .to("[data-hero-cta-group]", { opacity: 1, duration: 0.01 }, 0.52)
          .to("[data-hero-cta]", { opacity: 1, duration: 0.35, stagger: 0.05, ease: EASE }, 0.54)
          .to("[data-hero-trust]", { opacity: 1, duration: 0.25 }, 0.58)
          .to(
            "[data-hero-trust-item]",
            { opacity: 1, duration: 0.3, stagger: 0.05, ease: EASE },
            0.6
          );

        if (scrollHint) {
          tl.to(scrollHint, { opacity: 1, y: 0, duration: 0.4, ease: EASE }, "-=0.05");
          gsap.to(scrollHint, {
            y: 6,
            duration: 1.6,
            repeat: 2,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1.2,
          });
        }

        if (bg && !mobile) {
          gsap.delayedCall(1.2, () => {
            gsap.to(bg, {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
            });
          });
        }
      };

      return whenBootReady(() => afterPaint(runHero));
    },
    { scope: scopeRef, dependencies: [reduced] }
  );
}

/** Validation rail — cinematic cascade with glow trail. */
export function useValidationRailMotion(scopeRef: React.RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !scopeRef.current) return;

      const root = scopeRef.current;
      const fill = root.querySelector("[data-rail-fill]");
      const shimmer = root.querySelector("[data-rail-shimmer]");
      const ambient = root.querySelector("[data-rail-ambient]");
      const header = root.querySelector("[data-rail-header]");
      const live = root.querySelector("[data-rail-live]");
      const nodes = root.querySelectorAll("[data-rail-node]");
      const labels = root.querySelectorAll("[data-rail-label]");
      const activePulse = root.querySelector("[data-rail-pulse]");
      const ACTIVE_IDX = 3;
      const fillTarget = ACTIVE_IDX / (nodes.length - 1);

      if (header) gsap.set(header, { opacity: 0, x: -16 });
      if (live) gsap.set(live, { opacity: 0, x: 16 });
      if (fill) gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
      if (shimmer) gsap.set(shimmer, { x: "-100%", opacity: 0 });
      if (ambient) gsap.set(ambient, { opacity: 0, scale: 0.5 });
      gsap.set(nodes, { scale: 0, opacity: 0 });
      gsap.set(labels, { opacity: 0, y: 8 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 88%",
          once: true,
        },
      });

      tl.to(header, { opacity: 1, x: 0, duration: 0.5, ease: EASE }, 0)
        .to(live, { opacity: 1, x: 0, duration: 0.5, ease: EASE }, 0.05)
        .to(
          fill,
          { scaleX: fillTarget, duration: 1.1, ease: "power2.inOut" },
          0.15
        )
        .to(shimmer, { opacity: 1, duration: 0.2 }, 0.2)
        .to(
          shimmer,
          { x: "400%", duration: 1, ease: "power2.inOut" },
          0.25
        )
        .to(shimmer, { opacity: 0, duration: 0.3 }, "-=0.2")
        .to(
          nodes,
          {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            stagger: 0.09,
            ease: "back.out(1.6)",
          },
          0.2
        )
        .to(
          labels,
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: EASE },
          0.35
        )
        .to(ambient, { opacity: 0.35, scale: 1, duration: 0.8, ease: "power2.out" }, 0.9);

      if (activePulse) {
        gsap.to(activePulse, {
          scale: 1.8,
          opacity: 0,
          duration: 1.6,
          repeat: 2,
          ease: "power2.out",
          delay: 1.2,
        });
      }

      if (shimmer && fill) {
        gsap.delayedCall(1.5, () => {
          gsap.set(shimmer, { x: "-100%", opacity: 0.6 });
          gsap.to(shimmer, {
            x: "400%",
            duration: 2.2,
            ease: "power1.inOut",
            repeat: 0,
          });
        });
      }
    },
    { scope: scopeRef, dependencies: [reduced] }
  );
}

/** Fast scroll reveals. */
export function LandingScrollReveal({
  children,
  className = "",
  y = 32,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const mobile = isMobileViewport();
      gsap.from(ref.current, {
        opacity: 0,
        y: mobile ? Math.min(y, 18) : y,
        duration: mobile ? 0.5 : 0.65,
        ease: EASE_SNAP,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 92%",
          once: true,
        },
      });
    },
    { dependencies: [reduced, y] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Magnetic CTA — desktop only. */
export function MagneticButton({
  children,
  className = "",
  href,
  strength = 0.22,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.35, ease: EASE });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, strength]);

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 480, damping: 32 }}
    >
      {children}
    </motion.a>
  );
}

export function useSvgStrokeReveal(containerRef: React.RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduced) return;

    const paths = el.querySelectorAll(
      ".journey-icon path, .journey-icon circle, .journey-icon line, .journey-icon polyline, .journey-icon rect"
    );
    if (!paths.length) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        try {
          const targets = svg.createDrawable(
            ".journey-icon path, .journey-icon circle, .journey-icon line, .journey-icon polyline, .journey-icon rect"
          );
          animate(targets, {
            draw: ["0 0", "0 1"],
            ease: "outCubic",
            duration: 900,
            delay: stagger(80, { start: 40 }),
          });
        } catch {
          animate(paths, {
            opacity: [0, 1],
            ease: "outCubic",
            duration: 400,
            delay: stagger(50),
          });
        }
        io.disconnect();
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [containerRef, reduced]);
}

export function AnimeStaggerIn({
  children,
  className = "",
  itemSelector = "[data-stagger-item]",
}: {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const items = ref.current.querySelectorAll(itemSelector);
      if (!items.length) return;

      const mobile = isMobileViewport();
      gsap.set(items, { opacity: 0, y: mobile ? 16 : 24 });

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.42 : 0.52,
            stagger: mobile ? 0.06 : 0.07,
            ease: EASE_SNAP,
          });
        },
      });
    },
    { dependencies: [reduced, itemSelector] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Stagger grid columns on scroll (left → right). */
export function LandingColumnStagger({
  children,
  className = "",
  itemSelector = "[data-column-item]",
}: {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const items = ref.current.querySelectorAll(itemSelector);
      if (!items.length) return;

      const mobile = isMobileViewport();
      gsap.set(items, {
        opacity: 0,
        y: mobile ? 20 : 32,
        x: mobile ? 0 : -10,
      });

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            x: 0,
            duration: mobile ? 0.5 : 0.65,
            stagger: mobile ? 0.1 : 0.12,
            ease: EASE_SNAP,
          });
        },
      });
    },
    { dependencies: [reduced, itemSelector] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
