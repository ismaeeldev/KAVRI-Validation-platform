import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Tester Module Expansion E2E Test (Sprint 1 revision, Step 5)", () => {
  test("adds a tester via the dialog (full-width directory), edits their profile, and declines a pending applicant", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    await page.goto("/owner/testers");
    // Registration is no longer a permanent side card.
    await expect(page.locator("text=Register Tester").first()).not.toBeVisible();

    const stamp = Date.now().toString().slice(-6);
    await page.click("button:has-text('Add Tester')");
    await expect(page.locator("text=Register Tester")).toBeVisible();
    await page.fill("#name", `E2E Tester ${stamp}`);
    await page.fill("#email", `e2e-tester-${stamp}@example.com`);
    await page.selectOption("#skillLevel", { value: "4.0" });
    await page.click("button:has-text('Add Tester Profile')");

    // Dialog closes and the new tester appears in the full-width directory.
    await expect(page.locator("text=Register Tester")).not.toBeVisible();
    await expect(page.locator(`text=E2E Tester ${stamp}`)).toBeVisible();

    // Filter by skill level narrows to only matching rows.
    const skillFilters = page.locator("select");
    await skillFilters.nth(2).selectOption("4.0");
    await expect(page.locator(`text=E2E Tester ${stamp}`)).toBeVisible();

    // Open detail, edit profile.
    await page.click(`tr:has-text('E2E Tester ${stamp}') a:has-text('Manage')`);
    await page.click("a:has-text('Edit Profile')");
    await page.fill("#currentPaddle", "E2E Test Paddle Pro");
    await page.click("button:has-text('Save Profile')");
    await expect(page.locator("body")).toContainText("E2E Test Paddle Pro");

    // Decline a different pending tester with a reason.
    const declineStamp = Date.now().toString().slice(-6);
    await page.goto("/owner/testers");
    await page.click("button:has-text('Add Tester')");
    await page.fill("#name", `E2E Decline ${declineStamp}`);
    await page.fill("#email", `e2e-decline-${declineStamp}@example.com`);
    await page.click("button:has-text('Add Tester Profile')");
    await expect(page.locator(`text=E2E Decline ${declineStamp}`)).toBeVisible();
    await page.click(`tr:has-text('E2E Decline ${declineStamp}') a:has-text('Manage')`);
    await page.click("button:has-text('Decline Application')");
    await page.fill("textarea", "Not a fit for this validation round.");
    await page.click("button:has-text('Confirm Decline')");
    await expect(page.locator("body")).toContainText("declined");
  });
});
