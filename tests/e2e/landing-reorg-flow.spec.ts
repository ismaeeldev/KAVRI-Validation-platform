import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Sprint1_rev.md Step 15, items 12-13.
test.describe("Public Landing Page Reorganization E2E Test (Sprint 1 revision, Step 15)", () => {
  test("guaranteed sections render in the audit's required order", async ({ page }) => {
    await page.goto("/");

    // Only sections that always render (not conditional on live data like What Changed and Why)
    // are asserted here — their relative DOM order must match the audit's recommended structure.
    const ids = [
      "how-we-test",
      "current-testing",
      "validation-snapshot",
      "testing-log",
      "why-kavri-tests",
      "join-the-build",
      "about-kavri",
    ];

    const tops = await page.evaluate((sectionIds: string[]) =>
      sectionIds.map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return el.getBoundingClientRect().top + window.scrollY;
      }),
    ids);

    expect(tops.every((t) => t !== null)).toBe(true);
    const sorted = [...(tops as number[])].sort((a, b) => a - b);
    expect(tops).toEqual(sorted);
  });

  test("nav links update the URL hash and scroll the correct section into view", async ({ page }) => {
    await page.goto("/");

    const navChecks: Array<{ label: string; id: string }> = [
      { label: "How We Test", id: "how-we-test" },
      { label: "Current Testing", id: "current-testing" },
      { label: "Testing Log", id: "testing-log" },
      { label: "About", id: "about-kavri" },
    ];

    for (const { label, id } of navChecks) {
      await page.locator("header nav[aria-label='Main navigation']").getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const inView = await page.evaluate((sectionId: string) => {
        const el = document.getElementById(sectionId);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      }, id);
      expect(inView).toBe(true);
    }
  });

  test("deep-linking directly to a section anchor lands correctly on load", async ({ page }) => {
    await page.goto("/#how-we-test");
    await expect(page).toHaveURL(/#how-we-test$/);
    const inView = await page.evaluate(() => {
      const el = document.getElementById("how-we-test");
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    expect(inView).toBe(true);
  });

  test("Apply to Test and Join the Build are distinct entry points with different fields", async ({ page }) => {
    await page.goto("/");

    // Join the Build: only an email field, no testing-related questions.
    await expect(page.locator("#join-the-build").getByPlaceholder("Enter your email address")).toBeVisible();
    await expect(page.locator("#join-the-build").locator("#applicant-name")).toHaveCount(0);

    // Apply to Test: opens a dialog with name/email/skill/notes/consent — never shown on the
    // general form.
    await page.locator("#join-the-build").getByRole("button", { name: "Apply to Test" }).click();
    await expect(page.locator("#applicant-name")).toBeVisible();
    await expect(page.locator("#applicant-email")).toBeVisible();
    await expect(page.getByRole("checkbox")).toBeVisible();
  });

  test("no zero-value metric cards render on the Validation Snapshot section", async ({ page }) => {
    await page.goto("/");
    const snapshot = page.locator("#validation-snapshot");
    await expect(snapshot).toBeVisible();
    // MetricCountUp renders the numeric value as its own text node; a literal "0" would only
    // appear if the zero-value filter in LandingMetrics failed to exclude it.
    const zeroValueCard = snapshot.locator("span.font-heading", { hasText: /^0$/ });
    await expect(zeroValueCard).toHaveCount(0);
  });
});
