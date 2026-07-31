import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { createRecruitingRound } from "./helpers/round-helper";

dotenv.config({ path: ".env.local" });

// This is the audit's Gate 2 acceptance test in full (sprint1_rev.md Step 10, item 16):
// "Owner can create round, invite tester, assign sample, collect first impression/follow-up,
// record issue, and close round." One continuous flow spanning Steps 6-9's modules plus the
// Step 10 integration wiring (round-required assignments, invited/acknowledged rename, sample
// disposition -> Complete, closeout decision -> round closed).
test.describe("Gate 2 — Full Round-to-Closeout E2E Test (Sprint 1 revision, Step 10)", () => {
  test("round -> invited tester -> assignment -> acknowledge -> session -> evaluations -> issue -> sample returned -> Complete -> closeout", async ({ page }) => {
    // Mobile-first viewport for the tester half of this flow (item 17: this spec is also run
    // under the mobile-chrome/mobile-safari Playwright projects to verify no horizontal scroll
    // and keyboard-safe input at every tester-facing screen).
    await page.setViewportSize({ width: 360, height: 740 });

    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    // 1. Log a ready sample
    const stamp = Date.now().toString().slice(-6);
    const sampleCode = `S-GATE2-${stamp}`;
    await page.goto("/owner/samples/new");
    await page.fill("#sampleCode", sampleCode);
    await page.selectOption("#productSelect", { index: 1 });
    await page.selectOption("#revisionId", { index: 1 });
    await page.fill("#receivingObservations", "Seals intact.");
    await page.click("button:has-text('Log Sample')");

    await page.goto("/owner/samples");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View Triage')`);
    await page.fill("#readinessNote", "Scans completed.");
    await page.click("button:has-text('Begin Review')");
    await page.fill("#readinessNote", "Ready to dispatch.");
    await page.click("button:has-text('Mark Ready for Testing')");
    await expect(page.locator("text=READY FOR TESTING")).toBeVisible();

    // 2. Create round, advance to recruiting (helper), link the sample's revision
    const round = await createRecruitingRound(page, "Gate2");

    // 3. Register + approve + invite tester
    const testerName = `T-Gate2-${stamp}`;
    const testerEmail = `t-gate2-${stamp}@kavri.co`;
    const testerPassword = "TesterGate2Secret-2026!#";

    await page.goto("/owner/testers");
    await page.click("button:has-text('Add Tester')");
    await page.fill("#name", testerName);
    await page.fill("#email", testerEmail);
    await page.click("button:has-text('Add Tester Profile')");

    await page.click(`tr:has-text('${testerName}') a:has-text('Manage')`);
    await page.click("button:has-text('Approve Tester')");
    await page.click("button:has-text('Generate Invitation')");
    const inviteUrlInput = page.locator("input[readonly]");
    const invitationLink = await inviteUrlInput.inputValue();
    await page.click("button:has-text('Close Warning Dialog')");

    await page.goto(invitationLink);
    await page.fill("#password", testerPassword);
    await page.fill("#confirmPassword", testerPassword);
    await page.click("button:has-text('Activate Account')");

    // 4. Owner: create the round-linked assignment and invite the tester (sample -> 'assigned')
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    await page.goto("/owner/assignments/new");
    await page.selectOption("#roundId", { label: round.optionLabel });
    await page.selectOption("#testerProfileId", { label: testerName });
    await page.selectOption("#sampleSelect", { label: sampleCode });
    await page.fill("#instructions", "Complete the full Gate 2 workflow.");
    await page.fill("#requiredSessionCount", "1");
    await page.click("button:has-text('Save Draft Assignment')");

    await page.goto("/owner/assignments");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View brief')`);
    await page.click("button:has-text('Invite Tester')");
    await expect(page.locator("text=INVITED")).toBeVisible();

    // Confirm the sample transitioned to 'assigned' as a side effect of the invite (Step 10 item 4)
    await page.goto("/owner/samples");
    await expect(page.locator(`tr:has-text('${sampleCode}')`)).toContainText("ASSIGNED");

    // 5. Tester: acknowledge, log session, submit both evaluations, report an issue
    await page.goto("/login");
    await page.fill("#email", testerEmail);
    await page.fill("#password", testerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/tester/, { timeout: 15000 });

    await page.click("a:has-text('View Brief')");
    await page.click("button:has-text('Acknowledge Brief')");
    await expect(page.locator("text=FIRST IMPRESSION DUE")).toBeVisible();

    await page.click("button:has-text('Log a Play Session')");
    await page.click("button:has-text('Log Play Session')");
    await expect(page.locator("text=1 / 1 logged")).toBeVisible();

    await page.click("button:has-text('Start First Impression')");
    await page.fill("#strengths", "Great pop.");
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Submit First Impression')");
    await expect(page.locator("body")).toContainText("First Impression evaluation submitted");

    await expect(page.locator("button:has-text('Start Follow-Up')")).toBeVisible();
    await page.click("button:has-text('Start Follow-Up')");
    await page.fill("#strengths", "Consistent over time.");
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Submit Follow-Up')");
    await expect(page.locator("body")).toContainText("Follow-Up evaluation submitted");

    // Assignment should now be Follow-Up Due (Awaiting Sample Return), not yet Complete.
    await page.goto("/tester");
    await expect(page.locator("text=FOLLOW-UP DUE")).toBeVisible();

    // Report an issue on the same assignment
    await page.click("a:has-text('View Brief')");
    await page.click("a:has-text('Report an Issue')");
    await page.selectOption("#category", "cosmetic");
    await page.selectOption("#issueType", "cosmetic");
    await page.selectOption("#severity", "low");
    await page.fill("#description", "Minor cosmetic scuff noted during Gate 2 flow.");
    await page.click("button:has-text('Submit Issue Report')");
    await expect(page.locator("text=Issue reported.")).toBeVisible();
    await page.click("button:has-text('Done')");

    // 6. Owner: mark the sample returned - this is the disposition step that flips the
    // assignment to Complete (not the evaluations alone).
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    await page.goto("/owner/samples");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View Triage')`);
    await page.fill("#readinessNote", "Tester finished all sessions; batch returned.");
    await page.click("button:has-text('Mark Returned')");
    await expect(page.locator("text=RETURNED")).toBeVisible();

    await page.goto("/owner/assignments");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View brief')`);
    await expect(page.locator("text=COMPLETE")).toBeVisible();

    // 7. Owner: advance the round through review and close it with a decision
    await page.goto("/owner/rounds");
    await page.click(`tr:has-text('${round.roundName}') a:has-text('Manage')`);
    await page.click("button:has-text('Activate Round')");
    await page.click("button:has-text('Move to Review')");
    await page.click("text=Record Closeout Decision");

    await page.selectOption("#decision", "advance");
    await page.fill("#decisionSummary", "Gate 2 flow completed with no blocking issues.");
    await page.fill("#nextAction", "Proceed to next validation phase.");
    await page.click("button:has-text('Submit Decision & Close Round')");

    await expect(page).toHaveURL(/\/owner\/rounds\/[^/]+$/, { timeout: 15000 });
    await expect(page.locator("text=CLOSED")).toBeVisible();
    await expect(page.locator("text=Gate 2 flow completed with no blocking issues.")).toBeVisible();
  });
});
