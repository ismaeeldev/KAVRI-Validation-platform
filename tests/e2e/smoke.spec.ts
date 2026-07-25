import { test, expect } from "@playwright/test";
import { assertPageAccessibility } from "./helpers/axe-helper";

test.describe("App Baseline Smoke Test", () => {
  test("loads the landing page successfully", async ({ page }) => {
    // Navigate to the local server home page
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    
    // Wait for the document to be fully loaded to ensure hydration and elements are settled
    await page.waitForLoadState("networkidle");

    // Run Axe accessibility scan
    await assertPageAccessibility(page);
  });

  test("loads the dev component gallery successfully", async ({ page }) => {
    await page.goto("/dev-gallery");
    
    // Wait for the DEV GALLERY indicator tag to render
    const galleryTag = page.locator("span", { hasText: "DEV GALLERY" }).first();
    await expect(galleryTag).toBeVisible();
    
    // Validate accessibility of all component states rendered in the gallery
    await assertPageAccessibility(page);
  });
});
