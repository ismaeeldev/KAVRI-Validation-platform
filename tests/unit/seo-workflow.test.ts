import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("SEO & Technical Landing-Page Requirements Unit Tests (Sprint 1 revision, Step 17)", () => {
  describe("robots.ts", () => {
    it("disallows every private route", () => {
      const result = robots();
      const disallow = result.rules && !Array.isArray(result.rules) ? result.rules.disallow : [];
      const disallowList = Array.isArray(disallow) ? disallow : [disallow];

      const privateRoutes = [
        "/owner",
        "/tester",
        "/login",
        "/account",
        "/invite",
        "/forgot-password",
        "/reset-password",
        "/preview",
        "/api",
      ];
      for (const route of privateRoutes) {
        expect(disallowList).toContain(route);
      }
    });

    it("allows the public root route", () => {
      const result = robots();
      const allow = result.rules && !Array.isArray(result.rules) ? result.rules.allow : undefined;
      expect(allow).toBe("/");
    });

    it("references a sitemap URL", () => {
      const result = robots();
      expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
    });
  });

  describe("sitemap.ts", () => {
    it("lists the public root route", () => {
      const result = sitemap();
      expect(result.some((entry) => entry.url && !entry.url.includes("/owner") && !entry.url.includes("/tester"))).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
