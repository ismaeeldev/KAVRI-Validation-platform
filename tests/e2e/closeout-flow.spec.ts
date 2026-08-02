import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Note: the full Gate 2 continuous flow ("create round -> invite tester -> assign sample ->
// collect evaluations -> record issue -> close round") requires assignments to be linked to a
// round, which sprint1_rev.md's own Step 6 AI Master Prompt explicitly defers to Step 10
// ("nullable so it does not break the existing assignment-creation flow immediately; Step 10
// will make it required in the create-assignment UI going forward"). This spec covers what
// Step 9 alone makes testable: the round status state machine's terminal transition through the
// closeout decision form. The full round-linked Gate 2 spec is completed in Step 10 once the
// assignment-to-round linkage exists.
test.describe("Closeout Decisions Module E2E Test (Sprint 1 revision, Step 9)", () => {
  test("transitions a round through review, records a closeout decision, and confirms the round closes", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const stamp = Date.now().toString().slice(-6);
    await page.goto("/owner/rounds/new");
    await page.fill("#roundName", `E2E Closeout Round ${stamp}`);
    await page.fill("#roundCode", `CO${stamp}`);
    await page.fill("#purpose", "Validate the full round status state machine through closeout.");
    await page.fill("#instructions", "Play sessions and log impressions.");
    await page.fill("#requiredSessionCount", "1");
    await page.click("button:has-text('Create Round')");

    await expect(page).toHaveURL(/\/owner\/rounds$/, { timeout: 15000 });
    await page.click(`tr:has-text('E2E Closeout Round ${stamp}') a:has-text('Manage')`);

    await page.click("button:has-text('Begin Recruiting')");
    await page.click("button:has-text('Activate Round')");
    await page.click("button:has-text('Move to Review')");

    await expect(page.locator("text=Record Closeout Decision")).toBeVisible();
    await page.click("text=Record Closeout Decision");

    await expect(page.locator("text=Evidence Summary")).toBeVisible();
    await page.selectOption("#decision", "advance");
    await page.fill("#decisionSummary", "No blocking issues found; ready to advance.");
    await page.fill("#nextAction", "Proceed to production tooling review.");
    await page.click("button:has-text('Submit Decision & Close Round')");

    await expect(page).toHaveURL(/\/owner\/rounds\/[^/]+$/, { timeout: 15000 });
    await expect(page.locator("text=CLOSED")).toBeVisible();
    await expect(page.locator("text=Closeout Decision")).toBeVisible();
    await expect(page.locator("text=No blocking issues found; ready to advance.")).toBeVisible();
  });

  test("blocks recording a closeout decision on a round that is not yet in review", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const stamp = Date.now().toString().slice(-6);
    await page.goto("/owner/rounds/new");
    await page.fill("#roundName", `E2E Draft Round ${stamp}`);
    await page.fill("#roundCode", `DR${stamp}`);
    await page.fill("#purpose", "Confirm the closeout form is inaccessible before review.");
    await page.fill("#instructions", "N/A");
    await page.fill("#requiredSessionCount", "1");
    await page.click("button:has-text('Create Round')");

    await expect(page).toHaveURL(/\/owner\/rounds$/, { timeout: 15000 });
    await page.click(`tr:has-text('E2E Draft Round ${stamp}') a:has-text('Manage')`);

    const roundUrl = page.url();
    await page.goto(`${roundUrl}/closeout`);
    await expect(page.locator("text=Round Not Ready to Close")).toBeVisible();
  });
});
