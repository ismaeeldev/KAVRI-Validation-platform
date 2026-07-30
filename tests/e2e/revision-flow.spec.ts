import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Product & Revision Module Expansion E2E Test (Sprint 1 revision, Step 3)", () => {
  // The spec-field lock + controlled-correction logic itself is covered by unit tests in
  // tests/unit/owner-workflow.test.ts ("rejects a spec field change on a revision with a
  // linked sample..."); this E2E test focuses on what only a real browser can verify: the
  // new fields actually render, persist, and compute the handle-length category live.
  test("creates a revision with expanded spec fields and confirms they render, persist, and remain editable while unlocked", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    // 1. Create a supplier and product to hang the revision off of.
    const stamp = Date.now().toString().slice(-6);
    await page.goto("/owner/suppliers/new");
    await page.fill("#name", "E2E Revision Supplier");
    await page.fill("#code", `E2E-REV-${stamp}`);
    await page.fill("#notes", "Supplier for revision E2E test.");
    await page.click("button:has-text('Create Supplier')");
    await expect(page).toHaveURL(/\/owner\/suppliers/);

    await page.goto("/owner/products/new");
    await page.selectOption("#supplierId", { label: "E2E Revision Supplier" });
    await page.fill("#internalName", `E2E Revision Product ${stamp}`);
    await page.fill("#descriptionInternal", "Internal description for revision E2E test.");
    await page.click("button:has-text('Create Product')");
    await expect(page).toHaveURL(/\/owner\/products/);
    await page.click(`tr:has-text('E2E Revision Product ${stamp}') a:has-text('View')`);
    const productUrl = page.url();

    // 2. Create a revision with the new spec fields populated.
    await page.click("a:has-text('Add Revision')");
    await page.fill("#revisionCode", "REV-E2E-SPEC");
    await page.selectOption("#developmentStage", { value: "prototype" });
    await page.fill("#revisionReason", "E2E spec field test");
    await page.fill("#requestedChanges", "Add spec fields");
    await page.fill("#supplierReportedChanges", "Confirmed");
    await page.fill("#overallLengthIn", "16.5");
    await page.fill("#handleLengthIn", "5.0");
    await expect(page.locator("body")).toContainText("[Short]");
    await page.click("button:has-text('Create Revision')");
    await expect(page).toHaveURL(new RegExp(productUrl.split("/").pop()!));

    // 3. Open the revision detail page and confirm the spec values render.
    await page.click("a:has-text('Revision REV-E2E-SPEC')");
    await expect(page.locator("body")).toContainText("16.5");
    await expect(page.locator("body")).toContainText("Short");

    // 4. Edit while unlocked - spec fields should be freely editable (no lock banner).
    await page.click("a:has-text('Edit Revision')");
    await expect(page.locator("text=specification fields")).not.toBeVisible();
    await page.fill("#overallLengthIn", "16.75");
    await page.click("button:has-text('Save Changes')");
    await expect(page.locator("body")).toContainText("16.75");
  });
});
