import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Public Landing Page & Waitlist Lifecycle E2E Test", () => {
  test("manages public updates lifecycle and processes waitlist subscriptions", async ({ page }) => {
    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Owner Login
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/);

    // 2. Create Public Update as DRAFT
    await page.goto("/owner/updates/new");
    const uniqueTitle = `Log Update - ${Date.now().toString().slice(-5)}`;
    await page.fill("#title", uniqueTitle);
    await page.fill("#statusLabel", "STABLE");
    await page.selectOption("#publishedState", "draft");
    await page.fill("#summary", "This update description should remain hidden during draft state.");
    await page.click("button:has-text('Create Update')");

    // Expect to see it in owner update list
    await expect(page).toHaveURL(/\/owner\/updates/);
    await expect(page.locator("table")).toContainText(uniqueTitle);

    // 3. Verify Landing page does NOT show draft update
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(uniqueTitle);

    // 4. Publish the Update
    await page.goto("/owner/updates");
    await page.click(`tr:has-text('${uniqueTitle}') a:has-text('Manage')`);
    await page.click("button:has-text('Publish Update')");
    await expect(page.locator("text=State: published")).toBeVisible();

    // 5. Verify Landing page DOES show published update
    await page.goto("/");
    await expect(page.locator("#feed")).toContainText(uniqueTitle);
    await expect(page.locator("#feed")).toContainText("This update description should remain hidden during draft state.");

    // 6. Test Waitlist form submission
    await page.goto("/");
    const uniqueEmail = `subscriber-${Date.now().toString().slice(-4)}@kavri.co`;
    await page.fill("input[placeholder='Enter your email address']", uniqueEmail);
    await page.click("button:has-text('Follow the build')");
    await expect(page.locator("text=Thank you. You have been added to the build follow feed.")).toBeVisible();

    // 7. Test Waitlist duplicate submission
    await page.goto("/");
    await page.fill("input[placeholder='Enter your email address']", uniqueEmail);
    await page.click("button:has-text('Follow the build')");
    await expect(page.locator("text=Thank you. You have been added to the build follow feed.")).toBeVisible();

    // 8. Verify waitlist subscriber is listed on owner waitlist view
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    
    await page.goto("/owner/waitlist");
    await expect(page.locator("table")).toContainText(uniqueEmail);
  });
});
