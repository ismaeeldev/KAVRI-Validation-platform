import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Physical Sample Module Expansion E2E Test (Sprint 1 revision, Step 4)", () => {
  test("records measurements and inspection checklist on a sample, and confirms the QR label renders", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    await page.goto("/owner/samples/new");
    const uniqueSampleCode = `S-MEAS-${Date.now().toString().slice(-5)}`;
    await page.fill("#sampleCode", uniqueSampleCode);
    await page.selectOption("#productSelect", { index: 1 });
    await page.selectOption("#revisionId", { index: 1 });
    await page.fill("#receivingObservations", "E2E measurements test sample.");
    await page.click("button:has-text('Log Sample')");
    await expect(page).toHaveURL(/\/owner\/samples/);

    await page.click(`tr:has-text('${uniqueSampleCode}') a:has-text('View')`);
    await expect(page.locator("h3")).toContainText(uniqueSampleCode);

    // QR label renders with a short code.
    await expect(page.locator("text=Sample Label")).toBeVisible();
    await expect(page.locator("img[alt*='QR code']")).toBeVisible();

    // Current Holder shown alongside status.
    await expect(page.locator("text=Holder: KAVRI")).toBeVisible();

    // Record a measurement and confirm it persists.
    await page.fill("#actualStaticWeightG", "198.5");
    await page.fill("#actualHandleLengthIn", "5.0");
    await expect(page.locator("text=[Short]")).toBeVisible();
    await page.click("button:has-text('Save Measurements')");
    await expect(page.locator("body")).toContainText("198.5");

    // Complete inspection checklist.
    await page.locator("text=Packaging").locator("..").getByText("OK", { exact: true }).click();
    await page.click("button:has-text('Save Inspection')");
  });
});
