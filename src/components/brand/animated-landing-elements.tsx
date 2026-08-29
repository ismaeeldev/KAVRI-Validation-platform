"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./motion-provider";

gsap.registerPlugin(ScrollTrigger);

export function HeroReveal({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-hero-reveal space-y-6">
      {children}
    </div>
  );
}

export function ProgressBarFill({ width }: { width: string }) {
  return (
    <div
      className="absolute inset-y-0 left-0 bg-kavri-signal border-r border-kavri-ink animate-progress-wipe"
      style={{ width }}
    />
  );
}

/** Smooth eased count-up when scrolled into view. */
export function MetricCountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced) {
      const frameId = requestAnimationFrame(() => setCount(value));
      return () => cancelAnimationFrame(frameId);
    }

    const el = ref.current;
    if (!el || value === 0) {
      setCount(value);
      return;
    }

    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: value,
                      duration: 1.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
      onUpdate: () => setCount(Math.round(obj.n)),
    });

    return () => {
      tween.kill();
    };
  }, [value, isReduced]);

  return <span ref={ref}>{count}</span>;
}

/** Premium staggered feed with GSAP blur settle. */
export function StaggeredFeed({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || isReduced) return;

    const items = el.querySelectorAll("[data-feed-item]");
    gsap.set(items, { opacity: 0, y: 20 });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "expo.out",
        });
      },
    });

    return () => st.kill();
  }, [isReduced, children]);

  if (isReduced) {
    return <div className="space-y-0">{children}</div>;
  }

  return (
    <div ref={ref} className="space-y-0">
      {React.Children.map(children, (child, idx) => (
        <div key={idx} data-feed-item>
          {child}
        </div>
      ))}
    </div>
  );
}
