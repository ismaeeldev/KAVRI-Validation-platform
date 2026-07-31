import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Physical Sample Identity & Triage E2E Test", () => {
  test("runs sample creation, triage reviews, status block/approvals, and validates timeline history", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Owner Login
    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/);

    // 2. Create Sample Page
    await page.goto("/owner/samples/new");
    const uniqueSampleCode = `S-E2E-${Date.now().toString().slice(-5)}`;
    await page.fill("#sampleCode", uniqueSampleCode);
    
    // Select Product (which automatically updates related Supplier/Revision selections)
    // Wait for options to render and select the first product
    await page.selectOption("#productSelect", { index: 1 });
    
    // Select the first revision of that product
    await page.selectOption("#revisionId", { index: 1 });
    
    await page.fill("#receivingObservations", "Incoming packaging box intact. Seals unbroken.");
    await page.fill("#identifyingNotes", "Batch tag A-12, metallic gray weave.");
    await page.click("button:has-text('Log Sample')");

    // Expect redirection to samples catalog directory listing
    await expect(page).toHaveURL(/\/owner\/samples/);
    await expect(page.locator("table")).toContainText(uniqueSampleCode);

    // 3. Status transitions and history
    // Go to triage detail page
    await page.click(`tr:has-text('${uniqueSampleCode}') a:has-text('Review Sample')`);
    await expect(page.locator("h3")).toContainText(`Sample ${uniqueSampleCode}`);

    // Initial state is "received"
    await expect(page.locator("text=received")).toBeVisible();
    await expect(page.locator("text=Validation Blocked")).toBeVisible();

    // Transition to "under_review"
    await page.fill("#readinessNote", "Seals checked, starting surface scans.");
    await page.click("button:has-text('Begin Review')");

    // Verify status update and timeline logging
    await expect(page.locator("text=under_review")).toBeVisible();
    await expect(page.locator("text=sample.status_transitioned")).toBeVisible();
    await expect(page.locator("text=Reason: Seals checked, starting surface scans.")).toBeVisible();

    // Transition to "ready_for_testing"
    await page.fill("#readinessNote", "Structural scan cleared. No microscopic stress cracks.");
    await page.click("button:has-text('Mark Ready for Testing')");

    // Verify readiness state update
    await expect(page.locator("text=ready_for_testing")).toBeVisible();
    await expect(page.locator("text=Validation Ready")).toBeVisible();
    await expect(page.locator("text=Reason: Structural scan cleared. No microscopic stress cracks.")).toBeVisible();
  });
});
