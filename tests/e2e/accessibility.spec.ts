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
    { path: "/owner/updates", name: "public updates list (Step 13 6-state badges)" },
    { path: "/owner/updates/new", name: "public update create form (Step 13 Evidence & Context fields)" },
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

  // Step 13, item 13: the public preview route must also be audited, not left unaudited just
  // because it lives outside /owner. Uses the owner-session access path (already authenticated
  // via beforeEach) rather than the token path, since that's sufficient to render the same page.
  test("public update preview route (/preview/updates/[id]) should pass basic accessibility audits", async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    await page.goto("/owner/updates/new");
    await page.fill("#title", `A11y Preview ${stamp}`);
    await page.fill("#statusLabel", "IN PROGRESS");
    await page.fill("#summary", "Accessibility audit fixture for the preview route.");
    await page.click("button:has-text('Create Update')");
    await expect(page).toHaveURL(/\/owner\/updates/, { timeout: 15000 });

    await page.click(`tr:has-text('A11y Preview ${stamp}') a:has-text('Manage')`);
    const url = page.url();
    const updateId = url.split("/").pop();

    await page.goto(`/preview/updates/${updateId}`);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    const seriousOrCritical = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    if (seriousOrCritical.length > 0) {
      console.error("Accessibility violations on /preview/updates/[id]:", JSON.stringify(seriousOrCritical, null, 2));
    }
    expect(seriousOrCritical).toEqual([]);
  });
});
