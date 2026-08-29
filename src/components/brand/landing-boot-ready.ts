"use client";

import { useEffect, useState } from "react";

export function isLandingBootReady() {
  if (typeof document === "undefined") return true;
  return !document.documentElement.classList.contains("lp-boot-active");
}

/** True once the boot overlay has fully exited. */
export function useLandingBootReady() {
  const [ready, setReady] = useState(isLandingBootReady);

  useEffect(() => {
    if (ready) return;
    const onReady = () => setReady(true);
    window.addEventListener("kavri-boot-complete", onReady, { once: true });
    return () => window.removeEventListener("kavri-boot-complete", onReady);
  }, [ready]);

  return ready;
}

/** Run GSAP/motion setup only after boot — avoids ScrollTrigger stampede during loader. */
export function whenBootReady(run: () => void | (() => void)) {
  if (isLandingBootReady()) {
    const cleanup = run();
    return typeof cleanup === "function" ? cleanup : () => {};
  }

  let cleanup: void | (() => void);
  const handler = () => {
    cleanup = run();
  };
  window.addEventListener("kavri-boot-complete", handler, { once: true });
  return () => {
    window.removeEventListener("kavri-boot-complete", handler);
    if (typeof cleanup === "function") cleanup();
  };
}
