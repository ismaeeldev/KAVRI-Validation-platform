import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { useReducedMotion, MotionProvider } from "@/components/brand/motion-provider";

describe("useReducedMotion hook", () => {
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    matchMediaMock.mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns default false when not matching reduce query", async () => {
    // Override matches mock
    matchMediaMock.mockImplementationOnce(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(MotionProvider, null, children)
    );

    const { result } = renderHook(() => useReducedMotion(), { wrapper });
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("returns true when matching prefers-reduced-motion", async () => {
    // Override matches mock to return true
    matchMediaMock.mockImplementationOnce(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(MotionProvider, null, children)
    );

    const { result } = renderHook(() => useReducedMotion(), { wrapper });
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
