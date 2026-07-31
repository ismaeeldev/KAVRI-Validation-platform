import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { createRecruitingRound } from "./helpers/round-helper";

dotenv.config({ path: ".env.local" });

test.describe("Play Sessions & Evaluations Mobile E2E Test (Sprint 1 revision, Step 7)", () => {
  test("logs a play session, completes First Impression (draft -> reload -> resume -> submit), then completes Follow-Up", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });

    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Owner: log a ready sample
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const stamp = Date.now().toString().slice(-6);
    const sampleCode = `S-EVAL-${stamp}`;
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

    // 2. Owner: register + approve + invite tester
    const testerName = `T-Eval-${stamp}`;
    const testerEmail = `t-eval-${stamp}@kavri.co`;
    const testerPassword = "TesterEvalSecret-2026!#";

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

    // 3. Owner: create round, create + invite assignment with requiredSessionCount=1
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const round = await createRecruitingRound(page, "E2EEval");

    await page.goto("/owner/assignments/new");
    await page.selectOption("#roundId", { label: round.optionLabel });
    await page.selectOption("#testerProfileId", { label: testerName });
    await page.selectOption("#sampleSelect", { label: sampleCode });
    await page.fill("#instructions", "Log a session and complete both evaluations.");
    await page.fill("#requiredSessionCount", "1");
    await page.click("button:has-text('Save Draft Assignment')");

    await page.goto("/owner/assignments");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View brief')`);
    await page.click("button:has-text('Invite Tester')");
    await expect(page.locator("text=INVITED")).toBeVisible();
    const assignmentUrl = page.url();

    // 4. Tester: log in, open assignment
    await page.goto("/login");
    await page.fill("#email", testerEmail);
    await page.fill("#password", testerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/tester/, { timeout: 15000 });

    await page.click("a:has-text('View Brief')");
    await expect(page.locator("text=Instructions Brief")).toBeVisible();
    await page.click("button:has-text('Acknowledge Brief')");

    // 5. Tester: log a play session
    await page.click("button:has-text('Log a Play Session')");
    await page.click("button:has-text('Log Play Session')");
    await expect(page.locator("text=1 / 1 logged")).toBeVisible();

    // 6. Tester: First Impression - fill partially, verify draft persists across reload
    await page.click("button:has-text('Start First Impression')");
    await page.fill("#strengths", "Excellent pop off the paddle face.");
    await page.waitForTimeout(2500); // allow debounced autosave to fire
    await expect(page.locator("text=Draft saved")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.click("button:has-text('Continue First Impression')");
    await expect(page.locator("#strengths")).toHaveValue("Excellent pop off the paddle face.");

    await page.fill("#weaknesses", "Slightly heavy in the throat.");
    await page.waitForTimeout(2500);
    await page.click("button:has-text('Submit First Impression')");
    await expect(page.locator("body")).toContainText("First Impression evaluation submitted");

    // 7. Tester: Follow-Up now unlocked
    await expect(page.locator("button:has-text('Start Follow-Up')")).toBeVisible();
    await page.click("button:has-text('Start Follow-Up')");
    await page.fill("#strengths", "Consistent through extended play.");
    await page.waitForTimeout(2500);
    await page.click("button:has-text('Submit Follow-Up')");
    await expect(page.locator("body")).toContainText("Follow-Up evaluation submitted");

    // 8. Owner: confirm both evaluations appear on the round evaluations page. The assignment
    // is linked to a round (Step 10), so the evaluations' denormalized roundId is set and both
    // submissions should be listed there.
    await page.goto("/owner/rounds");
    await page.click(`tr:has-text('${round.roundName}') a:has-text('Manage')`);
    await page.click("a:has-text('View Evaluations')");
    await expect(page.locator("tbody")).toContainText("first impression");
    await expect(page.locator("tbody")).toContainText("follow up");

    await page.goto(assignmentUrl);
  });
});
