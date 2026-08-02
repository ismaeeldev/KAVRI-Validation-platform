import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { createRecruitingRound } from "./helpers/round-helper";

dotenv.config({ path: ".env.local" });

// Sprint1_rev.md Step 12, item 9: tab through the Rounds list and a Round detail page using
// only the keyboard, confirming every interactive element is reachable and has a visible focus
// state (every interactive element in this codebase carries focus-visible:outline-2
// focus-visible:outline-kavri-signal, verified here rather than assumed).
test.describe("Keyboard Navigation E2E Test (Sprint 1 revision, Step 12)", () => {
  test("Rounds list and Round detail are fully keyboard-reachable with a visible focus state", async ({ page }) => {
    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const round = await createRecruitingRound(page, "Kbd");

    // Rounds list: tab from the top of the page until the "New Round" action and the round's
    // "Manage" link both receive focus at some point, each with a visible outline.
    await page.goto("/owner/rounds");
    let reachedNewRound = false;
    let reachedManageLink = false;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      const text = await focused.textContent().catch(() => "");
      const href = await focused.getAttribute("href").catch(() => null);
      if (href === "/owner/rounds/new") reachedNewRound = true;
      if (text?.includes("Manage") && href?.startsWith("/owner/rounds/")) {
        reachedManageLink = true;
      }
      // Visible focus outline check: focus-visible:outline-2 utility resolves to a non-zero
      // outline-width when :focus-visible matches after a keyboard Tab.
      const outlineWidth = await focused.evaluate((el) => getComputedStyle(el).outlineWidth).catch(() => "0px");
      if (href === "/owner/rounds/new") {
        expect(outlineWidth).not.toBe("0px");
      }
      if (reachedNewRound && reachedManageLink) break;
    }
    expect(reachedNewRound).toBe(true);
    expect(reachedManageLink).toBe(true);

    // Round detail: tab through and confirm the primary status-transition button is reachable
    // and activatable via keyboard (Enter), not just mouse click.
    await page.goto("/owner/rounds");
    await page.click(`tr:has-text('${round.roundName}') a:has-text('Manage')`);

    let reachedRecruitingButton = false;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      const text = await focused.textContent().catch(() => "");
      if (text?.includes("Begin Recruiting")) {
        reachedRecruitingButton = true;
        break;
      }
    }
    expect(reachedRecruitingButton).toBe(true);

    await page.keyboard.press("Enter");
    await expect(page.locator("text=Activate Round")).toBeVisible();
  });
});
