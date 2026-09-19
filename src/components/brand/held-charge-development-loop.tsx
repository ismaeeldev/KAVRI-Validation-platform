"use client";

import { useEffect, useRef, useState } from "react";
import { PROCESS_STAGES, pad } from "./held-charge-process-stages";
import { wrap, sectionPadding, eyebrow, sectionHead, sectionHeadP, deviceCorner, cx } from "./held-charge-shared";
import { HeldChargeReveal } from "./held-charge-reveal";

const LOOP_TRANSITION = "stroke-dashoffset 0.9s cubic-bezier(.22,.61,.36,1)";

export function HeldChargeDevelopmentLoop() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [railProgress, setRailProgress] = useState(0);
  const [loopInView, setLoopInView] = useState(false);

  const trackWrapRef = useRef<HTMLDivElement | null>(null);
  const railRefs = useRef<Array<HTMLLIElement | null>>([]);

  // Desktop: the loop arcs draw themselves in the first time the track
  // scrolls into view, oldest (innermost) pass first — a quiet nod to this
  // being an ongoing, repeated cycle rather than a single lap.
  useEffect(() => {
    const node = trackWrapRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setLoopInView(true);
          observer.disconnect();
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Mobile: scroll position lights the rail and fills the track.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.getAttribute("data-stage-index"));
          if (!Number.isNaN(idx)) setRailProgress(idx);
        });
      },
      { root: null, rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    railRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  const activeStage = PROCESS_STAGES[activeIndex];
  const railFillPct = PROCESS_STAGES.length > 1 ? (railProgress / (PROCESS_STAGES.length - 1)) * 100 : 0;

  return (
    <section id="journey" className={sectionPadding}>
      <div className={wrap}>
        <HeldChargeReveal className={sectionHead} stagger>
          <div className="inline-flex items-center gap-[11px]">
            <span className={eyebrow}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
                <use href="#i-refresh" />
              </svg>
              HOW KAVRI DEVELOPS
            </span>
            <svg viewBox="0 0 370 282" aria-hidden="true" className={deviceCorner}>
              <use href="#mk-02C" />
            </svg>
          </div>
          <h2 className="font-heading text-[clamp(28px,3.6vw,42px)]">How a build moves forward.</h2>
          <p className={sectionHeadP}>
            We don&apos;t freeze a specification and call the work finished. KAVRI continuously
            evaluates new materials, constructions, manufacturing methods, and equipment concepts
            against what already performs. Improvements earn their way into the product.
          </p>
        </HeldChargeReveal>

        {/* Desktop / tablet: horizontal track, hidden below 560px in favor of the mobile rail. */}
        <div ref={trackWrapRef} className="relative max-w-[960px] mx-auto pt-[28px] max-[559px]:hidden">
          <ol className="relative z-[2] list-none m-0 p-0 grid grid-cols-6 gap-x-2 max-[899px]:grid-cols-3 max-[899px]:gap-y-[30px]">
            {PROCESS_STAGES.map((stage, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={stage.title}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    onClick={() => setActiveIndex(i)}
                    className="flex flex-col items-center gap-[10px] pt-[10px] px-1 pb-1 w-full cursor-pointer outline-none border-none bg-transparent font-inherit appearance-none [-webkit-tap-highlight-color:transparent] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--kv-accent)] focus-visible:outline-offset-4 focus-visible:rounded"
                  >
                    <svg
                      viewBox="0 0 370 282"
                      aria-hidden="true"
                      className={cx(
                        "w-3 h-auto transition-[fill,opacity,transform] duration-200 ease-in-out flex-none",
                        isActive ? "fill-[var(--kv-ignition)] opacity-100 scale-[1.4]" : "fill-[var(--kv-ink-faint)] opacity-50"
                      )}
                    >
                      <use href="#mk-02C" />
                    </svg>
                    <span className="font-mono text-[10.5px] tracking-[.04em] text-[var(--kv-ink-faint)]">{pad(i + 1)}</span>
                    <span
                      className={cx(
                        "font-sans font-bold text-[13.5px] tracking-[.03em] uppercase transition-colors duration-200",
                        isActive ? "text-[var(--kv-ink)]" : "text-[var(--kv-ink-soft)]"
                      )}
                    >
                      {stage.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Nested echo arcs behind the return arrow — an ambient nod to
              "this loop has run before," drawn in from the arrowhead
              backward the first time the section scrolls into view. */}
          <svg
            viewBox="0 -40 1000 96"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute left-0 right-0 top-[-28px] w-full h-24 z-[1] overflow-visible max-[899px]:hidden"
          >
            <line x1="40" y1="40" x2="960" y2="40" className="stroke-[var(--kv-line)]" strokeWidth={1.4} />
            <path
              d="M 900,40 C 900,14 100,14 100,36"
              fill="none"
              className="stroke-[var(--kv-line)]"
              strokeWidth={1}
              opacity={0.18}
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: loopInView ? 0 : 1200,
                transition: LOOP_TRANSITION,
                transitionDelay: "0s",
              }}
            />
            <path
              d="M 930,40 C 930,3 70,3 70,33"
              fill="none"
              className="stroke-[var(--kv-line)]"
              strokeWidth={1.1}
              opacity={0.38}
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: loopInView ? 0 : 1200,
                transition: LOOP_TRANSITION,
                transitionDelay: "0.14s",
              }}
            />
            <path
              d="M 960,40 C 960,-8 40,-8 40,29"
              fill="none"
              className="stroke-[var(--kv-line)]"
              strokeWidth={1.4}
              strokeLinecap="round"
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: loopInView ? 0 : 1200,
                transition: LOOP_TRANSITION,
                transitionDelay: "0.3s",
              }}
            />
            <path
              d="M 34,26 L 40,37 L 46,26 Z"
              className="fill-[var(--kv-ink-faint)]"
              style={{
                opacity: loopInView ? 1 : 0,
                transition: "opacity 0.3s ease 0.95s",
              }}
            />
          </svg>
        </div>

        {/* Tablet only (560–899px): the arcs are hidden, so say in words
            that the sequence loops. */}
        <div className="hidden [@media(min-width:560px)_and_(max-width:899px)]:flex items-center justify-center gap-2 mt-4 font-mono text-[11px] tracking-[.05em] uppercase text-[var(--kv-ink-faint)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="flex-none w-[13px] h-[13px]">
            <use href="#i-refresh" />
          </svg>
          <span>Then it repeats</span>
        </div>

        <div className="max-w-[640px] mx-auto mt-[30px] text-center min-h-[76px] max-[559px]:hidden" role="status">
          <span className="inline-block font-mono text-[11.5px] tracking-[.06em] text-[#6f8a1f] mb-2">
            {pad(activeIndex + 1)} — {activeStage.title.toUpperCase()}
          </span>
          <p className="text-[17px] leading-[1.5] text-[var(--kv-ink)] m-0 font-sans">{activeStage.description}</p>
        </div>

        {/* Mobile (<560px): a vertical rail whose fill and lit state track scroll position. */}
        <div className="hidden max-[559px]:block relative">
          <div className="absolute left-[13px] top-1 bottom-[34px] w-[2px] bg-[var(--kv-line)]">
            <span
              className="block w-full bg-[var(--kv-ignition)] transition-[height] duration-[250ms] ease-in-out"
              style={{ height: `${railFillPct}%` }}
            />
          </div>
          <ol className="list-none m-0 p-0 flex flex-col gap-5">
            {PROCESS_STAGES.map((stage, i) => {
              const isLit = i <= railProgress;
              return (
                <li
                  key={stage.title}
                  ref={(el) => {
                    railRefs.current[i] = el;
                  }}
                  data-stage-index={i}
                  className="relative grid grid-cols-[28px_1fr] gap-x-4"
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "relative z-[1] w-7 h-7 rounded-full bg-[var(--kv-paper)] border-[1.6px] flex items-center justify-center transition-[border-color,background-color] duration-[250ms] ease-in-out",
                      isLit ? "border-[var(--kv-ignition)] bg-[var(--kv-ignition)]" : "border-[var(--kv-line)]"
                    )}
                  >
                    <span
                      className={cx(
                        "font-mono text-[10px] transition-colors duration-[250ms]",
                        isLit ? "text-[var(--kv-ink)]" : "text-[var(--kv-ink-faint)]"
                      )}
                    >
                      {pad(i + 1)}
                    </span>
                  </span>
                  <div>
                    <h4 className="mt-[2px] mb-1 text-[15.5px] font-bold text-[var(--kv-ink)]">{stage.title}</h4>
                    <p className="m-0 text-[13.5px] leading-[1.5] text-[var(--kv-ink-soft)] font-sans">{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="flex items-center gap-2 mt-[18px] ml-11 font-mono text-[11px] tracking-[.05em] uppercase text-[var(--kv-ink-faint)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="flex-none w-[13px] h-[13px]">
              <use href="#i-refresh" />
            </svg>
            <span>Runs again from {PROCESS_STAGES[0].title}</span>
          </div>
        </div>

        <div className="mt-11 pt-8 border-t border-[var(--kv-line)] text-center max-[559px]:mt-[34px] max-[559px]:pt-6">
          <p className="font-heading font-semibold text-[clamp(19px,2.2vw,25px)] leading-[1.35] text-[var(--kv-ink-soft)] m-0">
            Each change has to earn its place.
          </p>
        </div>
      </div>
    </section>
  );
}
