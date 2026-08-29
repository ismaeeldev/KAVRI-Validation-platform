"use client";

import React, { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { LandingBootLoader } from "@/components/brand/landing-boot-loader";
import { useReducedMotion } from "@/components/brand/motion-provider";

const BOOT_KEY = "kavri-boot-seen";
const BOOT_START_KEY = "kavri-boot-start";
const MIN_BOOT_MS = 1600;
const EXIT_MS = 380;

function clearBootLock() {
  document.documentElement.classList.remove("lp-boot-active");
  document.documentElement.style.overflow = "";
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("kavri-boot-complete"));
  });
}

function readContinued() {
  if (typeof window === "undefined") return false;
  const start = sessionStorage.getItem(BOOT_START_KEY);
  if (!start) return false;
  return Date.now() - Number(start) > 200;
}

function subscribeStorage() {
  return () => {};
}

function readHasSeenBoot() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BOOT_KEY) === "1";
}

interface LandingBootGateProps {
  children: React.ReactNode;
}

export function LandingBootGate({ children }: LandingBootGateProps) {
  const reduced = useReducedMotion();
  const hasSeenBoot = useSyncExternalStore(subscribeStorage, readHasSeenBoot, () => false);
  const continued = useSyncExternalStore(subscribeStorage, readContinued, () => false);
  const [phase, setPhase] = useState<"boot" | "exit" | "done">(() =>
    hasSeenBoot ? "done" : "boot"
  );

  useLayoutEffect(() => {
    if (reduced || hasSeenBoot) {
      clearBootLock();
      sessionStorage.setItem(BOOT_KEY, "1");
      setPhase("done");
      return;
    }

    const startRaw = sessionStorage.getItem(BOOT_START_KEY);
    const start = startRaw ? Number(startRaw) : Date.now();
    if (!startRaw) sessionStorage.setItem(BOOT_START_KEY, String(start));

    document.documentElement.classList.add("lp-boot-active");
    document.documentElement.style.overflow = "hidden";

    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_BOOT_MS - elapsed);
    const exitTimer = window.setTimeout(() => setPhase("exit"), remaining);

    return () => window.clearTimeout(exitTimer);
  }, [reduced, hasSeenBoot]);

  useEffect(() => {
    if (phase !== "exit") return;
    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem(BOOT_KEY, "1");
      sessionStorage.removeItem(BOOT_START_KEY);
      clearBootLock();
      setPhase("done");
    }, EXIT_MS);
    return () => window.clearTimeout(doneTimer);
  }, [phase]);

  const showOverlay = phase === "boot" || phase === "exit";
  const contentReady = hasSeenBoot || phase === "done";

  return (
    <>
      <div
        suppressHydrationWarning
        className={`lp-boot-content${contentReady ? " lp-boot-content-in" : ""}`}
      >
        {children}
      </div>
      {showOverlay && (
        <LandingBootLoader
          continued={continued}
          className={phase === "exit" ? "lp-boot-exit" : undefined}
        />
      )}
    </>
  );
}
