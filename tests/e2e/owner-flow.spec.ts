import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Owner Traceability Workflow E2E Test", () => {
  test("runs owner login, supplier creation, product creation, and revision creation workflow", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Owner Login
    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    
    // Expect redirection to dashboard. Login chains two network round trips
    // (signIn.email then a role-lookup server action) that can be slow on a
    // cold Neon connection, so allow more than Playwright's 5s default here.
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });
    await expect(page.locator("h3")).toContainText("Owner Dashboard");

    // 2. Create Supplier
    await page.goto("/owner/suppliers/new");
    await page.fill("#name", "E2E Test Supplier");
    const uniqueCode = `E2E-SUP-${Date.now().toString().slice(-6)}`;
    await page.fill("#code", uniqueCode);
    await page.fill("#contactName", "Col E2E");
    await page.fill("#contactEmail", "col-e2e@kavri.co");
    await page.fill("#notes", "Confidential notes for E2E test supplier.");
    await page.click("button:has-text('Create Supplier')");

    // Expect redirect back to list and persistence
    await expect(page).toHaveURL(/\/owner\/suppliers/);
    await expect(page.locator("table")).toContainText("E2E Test Supplier");
    await expect(page.locator("table")).toContainText(uniqueCode);

    // 3. Create Product
    await page.goto("/owner/products/new");
    await page.selectOption("#supplierId", { label: "E2E Test Supplier" });
    await page.fill("#internalName", "E2E Test Product");
    await page.fill("#publicAlias", "E2E-PROD-ALIAS");
    await page.fill("#descriptionInternal", "Confidential specs for E2E test product.");
    await page.fill("#publicSummary", "Public summary for E2E test product.");
    await page.click("button:has-text('Create Product')");

    // Expect redirect back to list and persistence
    await expect(page).toHaveURL(/\/owner\/products/);
    await expect(page.locator("table")).toContainText("E2E Test Product");

    // Go to product detail page
    await page.click("tr:has-text('E2E Test Product') a:has-text('View')");
    await expect(page.locator("h3")).toContainText("E2E Test Product");

    // 4. Create Revision
    await page.click("a:has-text('+ Add Revision')");
    await page.fill("#revisionCode", "REV-E2E-1");
    await page.selectOption("#developmentStage", { value: "prototype" });
    await page.fill("#revisionReason", "Initial E2E prototype validation");
    await page.fill("#requestedChanges", "Increase thickness by 0.5mm");
    await page.fill("#supplierReportedChanges", "Thickness adjusted as requested");
    await page.fill("#internalNotes", "Confidential internal specs for REV-E2E-1");
    await page.click("button:has-text('Create Revision')");

    // Expect redirect back to product detail page and timeline persistence
    await expect(page.locator("h3")).toContainText("E2E Test Product");
    await expect(page.locator("text=Revision REV-E2E-1")).toBeVisible();
    await expect(page.locator("text=Reason: Initial E2E prototype validation")).toBeVisible();
  });
});
