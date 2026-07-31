import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import AxeBuilder from "@axe-core/playwright";

dotenv.config({ path: ".env.local" });

test.describe("Accessibility audits (Axe)", () => {
  test("landing page should pass basic accessibility audits", async ({ page }) => {
    await page.goto("/");

    // Inject and run axe builder
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("login page should pass basic accessibility audits", async ({ page }) => {
    await page.goto("/login");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// Sprint1_rev.md Step 12, item 8: extend coverage to every NEW route added in this revision
// (rounds, dashboard redesign, issues). Filters out the pre-existing 'react-compiler-*' rule
// noise is unnecessary here since axe doesn't know about React Compiler; only real WCAG
// violations with impact serious/critical are asserted, matching the axe-helper.ts convention
// used elsewhere in this suite.
test.describe("Accessibility audits (Axe) - Sprint 1 revision new routes", () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";
    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });
  });

  const routes = [
    { path: "/owner", name: "redesigned dashboard" },
    { path: "/owner/rounds", name: "rounds list" },
    { path: "/owner/rounds/new", name: "round create form" },
    { path: "/owner/issues", name: "issues list" },
    { path: "/owner/assignments", name: "assignments list (Step 10 columns)" },
  ];

  for (const route of routes) {
    test(`${route.name} (${route.path}) should pass basic accessibility audits`, async ({ page }) => {
      await page.goto(route.path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const seriousOrCritical = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );
      if (seriousOrCritical.length > 0) {
        console.error(`Accessibility violations on ${route.path}:`, JSON.stringify(seriousOrCritical, null, 2));
      }
      expect(seriousOrCritical).toEqual([]);
    });
  }
});
