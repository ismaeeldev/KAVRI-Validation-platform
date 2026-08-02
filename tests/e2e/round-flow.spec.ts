import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Test Rounds Module E2E Test (Sprint 1 revision, Step 6)", () => {
  test("creates a round, transitions draft->recruiting->active->review, and blocks closing without a closeout decision", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    await page.goto("/owner/rounds/new");
    const stamp = Date.now().toString().slice(-6);
    await page.fill("#roundName", `E2E Round ${stamp}`);
    await page.fill("#roundCode", `E2E${stamp}`);
    await page.fill("#purpose", "Validate the E2E round creation and status transition flow.");
    await page.fill("#instructions", "Play the paddle for at least two sessions and log your impressions.");
    await page.fill("#requiredSessionCount", "2");
    await page.click("button:has-text('Create Round')");

    await expect(page).toHaveURL(/\/owner\/rounds$/, { timeout: 15000 });
    await page.click(`tr:has-text('E2E Round ${stamp}') a:has-text('Manage')`);

    await expect(page.locator("text=Begin Recruiting")).toBeVisible();
    await page.click("button:has-text('Begin Recruiting')");
    await expect(page.locator("text=Activate Round")).toBeVisible();
    await page.click("button:has-text('Activate Round')");
    await expect(page.locator("text=Move to Review")).toBeVisible();
    await page.click("button:has-text('Move to Review')");

    await expect(page.locator("text=Close Round")).toBeVisible();
    await expect(page.locator("text=Closeout Decision is required")).toBeVisible();

    await page.click("button:has-text('Close Round')");
    await expect(page.locator("body")).toContainText("Closeout Decision required");
  });
});
