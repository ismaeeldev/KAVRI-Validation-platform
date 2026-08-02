import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { createRecruitingRound } from "./helpers/round-helper";

dotenv.config({ path: ".env.local" });

// Sprint1_rev.md Step 11, item 6: seed one overdue assignment, one open high-severity issue,
// and one round in review, then confirm the redesigned Owner Dashboard's Needs Attention
// section surfaces all three and each card links to a correctly pre-filtered list.
test.describe("Owner Dashboard Needs Attention E2E Test (Sprint 1 revision, Step 11)", () => {
  test("surfaces an overdue assignment, an open high-severity issue, and a round in review, each linking to the right filtered list", async ({ page }) => {
    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const stamp = Date.now().toString().slice(-6);
    const sampleCode = `S-DASH-${stamp}`;

    // 1. Log a ready sample and log an issue against it (owner-logged, high severity, open).
    await page.goto("/owner/samples/new");
    await page.fill("#sampleCode", sampleCode);
    await page.selectOption("#productSelect", { index: 1 });
    await page.selectOption("#revisionId", { index: 1 });
    await page.fill("#receivingObservations", "Seals intact.");
    await page.click("button:has-text('Log Sample')");

    await page.goto("/owner/samples");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('Review Sample')`);
    const sampleUrl = page.url();
    await page.fill("#readinessNote", "Scans completed.");
    await page.click("button:has-text('Begin Review')");
    await page.fill("#readinessNote", "Ready to dispatch.");
    await page.click("button:has-text('Mark Ready for Testing')");

    await page.goto(`${sampleUrl}/issues/new`);
    await page.selectOption("#category", "core_crush");
    await page.selectOption("#issueType", "cosmetic");
    await page.selectOption("#severity", "high");
    await page.fill("#description", "Dashboard E2E: seeded high-severity open issue.");
    await page.click("button:has-text('Submit Issue Report')");

    // 2. Create a round and immediately advance it to 'review' (no tester/evaluations needed to
    // reach review - review only requires active -> the round-status-controls path).
    const round = await createRecruitingRound(page, "Dash");
    await page.goto("/owner/rounds");
    await page.click(`tr:has-text('${round.roundName}') a:has-text('Manage')`);
    await page.click("button:has-text('Activate Round')");
    await page.click("button:has-text('Move to Review')");

    // 3. Create + invite an assignment with a due date in the past (overdue).
    const testerName = `T-Dash-${stamp}`;
    const testerEmail = `t-dash-${stamp}@kavri.co`;
    const testerPassword = "TesterDashSecret-2026!#";

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

    // Needs a second round in 'recruiting'/'active' to satisfy the assignment form (the first
    // round is already in 'review' and no longer selectable for new assignments).
    const assignmentRound = await createRecruitingRound(page, "DashAsg");

    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    await page.goto("/owner/assignments/new");
    await page.selectOption("#roundId", { label: assignmentRound.optionLabel });
    await page.selectOption("#testerProfileId", { label: testerName });
    await page.selectOption("#sampleSelect", { label: sampleCode });
    await page.fill("#instructions", "Dashboard E2E overdue assignment.");
    await page.fill("#dueAt", "2020-01-01"); // deliberately in the past
    await page.click("button:has-text('Save Draft Assignment')");

    await page.goto("/owner/assignments");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View brief')`);
    await page.click("button:has-text('Invite Tester')");

    // 4. Load the dashboard and confirm all three Needs Attention cards are present.
    await page.goto("/owner");
    await expect(page.locator("text=Needs Attention")).toBeVisible();
    await expect(page.locator("text=Overdue assignments")).toBeVisible();
    await expect(page.locator("text=Unresolved high/stop-use issues")).toBeVisible();
    await expect(page.locator("text=Rounds needing closeout")).toBeVisible();

    // 5. Click the Overdue assignments card -> confirm it lands pre-filtered.
    await page.click("text=Overdue assignments");
    await expect(page).toHaveURL(/\/owner\/assignments\?overdue=true/);
    await expect(page.locator("tbody")).toContainText(sampleCode);

    // 6. Click the issues card -> confirm it lands pre-filtered to open issues.
    await page.goto("/owner");
    await page.click("text=Unresolved high/stop-use issues");
    await expect(page).toHaveURL(/\/owner\/issues\?status=open/);
    await expect(page.locator("tbody")).toContainText(sampleCode);

    // 7. Click the rounds-needing-closeout card -> confirm it lands pre-filtered to review.
    await page.goto("/owner");
    await page.click("text=Rounds needing closeout");
    await expect(page).toHaveURL(/\/owner\/rounds\?status=review/);
    await expect(page.locator("tbody")).toContainText(round.roundName);
  });
});
