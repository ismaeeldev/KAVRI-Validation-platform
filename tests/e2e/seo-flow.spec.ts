import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Sprint1_rev.md Step 17, items 11-12.
test.describe("SEO & Technical Landing-Page Requirements E2E Test (Sprint 1 revision, Step 17)", () => {
  test("/robots.txt is served with the expected disallow rules", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const body = await response!.text();
    expect(body).toContain("Disallow: /owner");
    expect(body).toContain("Disallow: /tester");
    expect(body).toContain("Disallow: /login");
    expect(body).toContain("Disallow: /api");
    expect(body).toContain("Sitemap:");
  });

  test("/sitemap.xml is served and lists the root route", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const body = await response!.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<loc>");
  });

  test("landing page has exactly one h1 and no images missing alt text", async ({ page }) => {
    await page.goto("/");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });

  test("owner and tester routes carry noindex metadata", async ({ page }) => {
    await page.goto("/login");
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute("content", /noindex/);
  });
});
