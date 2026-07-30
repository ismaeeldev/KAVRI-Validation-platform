import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Supplier Module Expansion E2E Test (Sprint 1 revision, Step 2)", () => {
  test("creates a supplier with the full field set, views detail, edits one field, and archives with a linked-record confirmation", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    // Login chains signIn.email + a role-lookup server action, which can be
    // slow on a cold Neon connection - allow more than the 5s default here.
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    // 1. Create supplier with the full Step 2 field set.
    await page.goto("/owner/suppliers/new");
    const uniqueCode = `E2E-FULL-${Date.now().toString().slice(-6)}`;
    await page.fill("#name", "E2E Full Field Supplier");
    await page.fill("#code", uniqueCode);
    await page.fill("#contactName", "Jamie Fields");
    await page.fill("#contactEmail", "jamie@example.com");
    await page.fill("#notes", "Confidential onboarding notes for the full-field E2E supplier.");
    await page.selectOption("#supplierType", { value: "component" });
    await page.selectOption("#relationshipStatus", { value: "active" });
    await page.fill("#website", "https://example.com");
    await page.fill("#phone", "+1 555 000 1111");
    await page.fill("#addressLine1", "100 Main Street");
    await page.fill("#city", "Springfield");
    await page.fill("#region", "IL");
    await page.fill("#postalCode", "62704");
    await page.fill("#country", "USA");
    await page.click("button:has-text('Create Supplier')");

    await expect(page).toHaveURL(/\/owner\/suppliers/);
    await expect(page.locator("table")).toContainText("E2E Full Field Supplier");
    await expect(page.locator("table")).toContainText(uniqueCode);

    // 2. View detail page - confirm website/phone/address/relationship status render.
    await page.click(`tr:has-text('${uniqueCode}') a:has-text('View')`);
    await expect(page.locator("h3")).toContainText("E2E Full Field Supplier");
    await expect(page.locator("a[href='https://example.com']")).toBeVisible();
    await expect(page.locator("body")).toContainText("+1 555 000 1111");
    await expect(page.locator("body")).toContainText("100 Main Street");
    await expect(page.locator("body")).toContainText("Springfield");
    await expect(page.locator("body")).toContainText("ACTIVE"); // relationshipStatus badge

    // 3. Edit one field, confirm the others are unchanged after save.
    await page.click("a:has-text('Edit Details')");
    await page.fill("#phone", "+1 555 999 8888");
    await page.click("button:has-text('Save Changes')");
    await expect(page).toHaveURL(new RegExp(`/owner/suppliers/[^/]+$`));
    await expect(page.locator("body")).toContainText("+1 555 999 8888");
    // Untouched fields survived the edit.
    await expect(page.locator("body")).toContainText("Jamie Fields");
    await expect(page.locator("body")).toContainText("100 Main Street");
    await expect(page.locator("a[href='https://example.com']")).toBeVisible();

    // 4. Archive - confirmation UI must appear before the action fires.
    await page.click("button:has-text('Archive Supplier')");
    await expect(page.locator("text=Confirm Archive?")).toBeVisible();
    await page.click("button:has-text('Yes, Archive')");
    await expect(page).toHaveURL(/\/owner\/suppliers$/);
  });

  test("rejects a duplicate supplier code and preserves other entered values", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    // Login chains signIn.email + a role-lookup server action, which can be
    // slow on a cold Neon connection - allow more than the 5s default here.
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const uniqueCode = `E2E-DUP-${Date.now().toString().slice(-6)}`;

    // Create the first supplier that will hold the code.
    await page.goto("/owner/suppliers/new");
    await page.fill("#name", "E2E Duplicate Origin");
    await page.fill("#code", uniqueCode);
    await page.fill("#notes", "Origin supplier notes.");
    await page.click("button:has-text('Create Supplier')");
    await expect(page).toHaveURL(/\/owner\/suppliers/);

    // Attempt a second supplier with the same code (case-insensitive).
    await page.goto("/owner/suppliers/new");
    await page.fill("#name", "E2E Duplicate Attempt");
    await page.fill("#code", uniqueCode.toLowerCase());
    await page.fill("#notes", "Attempt notes that must be preserved after the error.");
    await page.click("button:has-text('Create Supplier')");

    // Stays on the create page; toast reports the conflict; other fields remain filled.
    await expect(page).toHaveURL(/\/owner\/suppliers\/new/);
    await expect(page.locator("#name")).toHaveValue("E2E Duplicate Attempt");
    await expect(page.locator("#notes")).toHaveValue("Attempt notes that must be preserved after the error.");
  });
});
