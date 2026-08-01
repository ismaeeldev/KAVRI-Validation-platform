import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Sprint1_rev.md Step 19 / Section 15 checklist: "Test loading, empty, success, validation,
// network failure, and unauthorized states." Loading/empty/success/validation states are already
// exercised across the module-specific specs (e.g. supplier-flow, sample-flow); unauthorized
// state is covered by logged-out-access-flow.spec.ts. This spec is the one dedicated to actually
// simulating a network failure rather than assuming the existing try/catch + toast pattern works.
test.describe("Network Failure State (Sprint 1 revision, Step 19)", () => {
  test("login shows an error toast and does not navigate away when the auth request fails at the network level", async ({ page }) => {
    await page.goto("/login");

    await page.route("**/api/auth/sign-in/email", (route) => route.abort("failed"));

    await page.fill("#email", "admin@kavri.co");
    await page.fill("#password", "Kavri-SecureAdmin-2026!#");
    await page.click("button:has-text('Log In')");

    // Must surface a visible error, not hang silently or navigate to /owner regardless.
    await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
