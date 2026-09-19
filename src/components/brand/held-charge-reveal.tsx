"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/components/brand/motion-provider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface HeldChargeRevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger children of the wrapper individually instead of animating the wrapper as one block. */
  stagger?: boolean;
  /** Vertical travel distance in px before settling. */
  y?: number;
  delay?: number;
}

/**
 * Fades + lifts a section (or its direct children, with `stagger`) into
 * place once it scrolls near the viewport. A single shared primitive so
 * every "Held Charge" section reveals consistently instead of each one
 * hand-rolling its own ScrollTrigger. No-ops under prefers-reduced-motion.
 */
export function HeldChargeReveal({
  children,
  className,
  stagger = false,
  y = 28,
  delay = 0,
}: HeldChargeRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;

      const targets = stagger ? gsap.utils.toArray(ref.current.children) : ref.current;

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power3.out",
          stagger: stagger ? 0.09 : 0,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: ref, dependencies: [reduced, stagger, y, delay] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
