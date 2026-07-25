"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface MotionContextType {
  shouldReduceMotion: boolean;
}

const MotionContext = createContext<MotionContextType>({ shouldReduceMotion: false });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateState = () => setShouldReduceMotion(mediaQuery.matches);
    
    const frameId = requestAnimationFrame(updateState);

    const listener = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => {
      cancelAnimationFrame(frameId);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  return (
    <MotionContext.Provider value={{ shouldReduceMotion }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useReducedMotion() {
  const context = useContext(MotionContext);
  return context.shouldReduceMotion;
}
