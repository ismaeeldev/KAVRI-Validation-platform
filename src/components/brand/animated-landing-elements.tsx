"use client";

import React, { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "./motion-provider";

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

export function MetricCountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced) {
      // Set count asynchronously in requestAnimationFrame to prevent render cycle conflicts
      const frameId = requestAnimationFrame(() => setCount(value));
      return () => cancelAnimationFrame(frameId);
    }

    let start = 0;
    const end = value;
    if (end === 0) return;

    const duration = 1200;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isReduced]);

  return <>{count}</>;
}

export function StaggeredFeed({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Asynchronously update visibility trigger state
          requestAnimationFrame(() => setVisible(true));
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (isReduced) {
    return <div className="space-y-6">{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {React.Children.map(children, (child, idx) => (
        <div
          style={{
            transitionDelay: `${idx * 150}ms`,
          }}
          className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
