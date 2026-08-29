import React from "react";
import { KAVRIWordmark } from "@/components/brand/wordmark";

const BOOT_STAGES = ["Concept", "Design", "Prototype", "Field Test", "Production", "Launch"] as const;

const BOOT_MESSAGES = [
  "Initializing validation protocol",
  "Syncing field test cycles",
  "Preparing public changelog",
];

interface LandingBootLoaderProps {
  className?: string;
  continued?: boolean;
}

export function LandingBootLoader({ className = "", continued = false }: LandingBootLoaderProps) {
  return (
    <div
      className={`landing-premium lp-boot-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#070807] ${continued ? "lp-boot-continued" : ""} ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading KAVRI validation platform"
      suppressHydrationWarning
    >
      <div className="absolute inset-0 lp-grid-bg opacity-[0.1]" aria-hidden />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(184,255,46,0.09), transparent 62%)",
        }}
        aria-hidden
      />

      <svg
        className="lp-boot-paddle absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(38vw,200px)] h-[min(52vh,300px)] opacity-[0.12] pointer-events-none"
        viewBox="0 0 140 260"
        fill="none"
        aria-hidden
      >
        <path
          className="lp-boot-paddle-stroke"
          d="M70 18 C48 18 32 52 30 88 L26 198 C25 214 36 228 52 232 L88 232 C104 228 115 214 114 198 L110 88 C108 52 92 18 70 18 Z"
          stroke="var(--lp-sage)"
          strokeWidth="1.5"
        />
      </svg>

      <span className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[var(--lp-sage)]/35 rounded-tl-sm pointer-events-none" aria-hidden />
      <span className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[var(--lp-sage)]/35 rounded-tr-sm pointer-events-none" aria-hidden />
      <span className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[var(--lp-sage)]/35 rounded-bl-sm pointer-events-none" aria-hidden />
      <span className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[var(--lp-sage)]/35 rounded-br-sm pointer-events-none" aria-hidden />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center text-center">
        <div className="lp-boot-fade-in mb-9 sm:mb-10">
          <KAVRIWordmark className="text-[var(--lp-text)] text-2xl sm:text-3xl [&_span]:text-[var(--lp-sage)]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lp-muted)] mt-3">
            Validation Platform
          </p>
        </div>

        <div className="lp-boot-fade-in w-full mb-7 sm:mb-8" style={{ animationDelay: "0.08s" }}>
          <div className="relative px-1">
            <div className="absolute top-[11px] left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden" aria-hidden>
              <div className="lp-boot-rail-fill h-full w-full origin-left rounded-full bg-gradient-to-r from-[var(--lp-sage)] to-[var(--lp-sage-bright)]" />
            </div>
            <div className="relative flex justify-between gap-1">
              {BOOT_STAGES.map((stage, i) => {
                const isActive = i === 3;
                const isPast = i < 3;
                return (
                  <div key={stage} className="flex flex-col items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`relative flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-[8px] font-mono font-bold ${
                        isActive
                          ? "border-[var(--lp-sage)] bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] lp-boot-node-active"
                          : isPast
                            ? "border-[var(--lp-sage)]/70 bg-black/60 text-[var(--lp-sage)]"
                            : "border-white/20 bg-black/40 text-white/35"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`font-mono text-[7px] sm:text-[8px] uppercase tracking-wider leading-tight text-center ${
                        isActive ? "text-[var(--lp-sage)] font-bold" : "text-white/35"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative h-5 w-full max-w-sm mb-7 sm:mb-8 overflow-hidden">
          {BOOT_MESSAGES.map((msg, i) => (
            <p
              key={msg}
              className="lp-boot-message absolute inset-x-0 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lp-muted)]"
              style={{ animationDelay: `${i * 0.55}s` }}
            >
              <span className="text-[var(--lp-sage)] mr-2" aria-hidden>
                ▸
              </span>
              {msg}
            </p>
          ))}
        </div>

        <div className="w-full max-w-xs space-y-2.5">
          <div className="h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
            <div className="lp-boot-progress h-full w-full origin-left rounded-full bg-gradient-to-r from-[var(--lp-sage)] to-[var(--lp-sage-bright)]" />
          </div>
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
            <span>Boot sequence</span>
            <span className="lp-boot-percent text-[var(--lp-sage)] tabular-nums" aria-hidden />
          </div>
        </div>
      </div>

      <p className="absolute bottom-8 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 pointer-events-none">
        Premium hardware · validated in public
      </p>
    </div>
  );
}
