import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { createRecruitingRound } from "./helpers/round-helper";

dotenv.config({ path: ".env.local" });

test.describe("Issue Reports Module E2E Test (Sprint 1 revision, Step 8)", () => {
  test("tester reports a functional issue from an evaluation trigger, owner sees it and resolves it", async ({ page }) => {
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
    const sampleCode = `S-ISSUE-${stamp}`;
    await page.goto("/owner/samples/new");
    await page.fill("#sampleCode", sampleCode);
    await page.selectOption("#productSelect", { index: 1 });
    await page.selectOption("#revisionId", { index: 1 });
    await page.fill("#receivingObservations", "Seals intact.");
    await page.click("button:has-text('Log Sample')");

    await page.goto("/owner/samples");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('Review Sample')`);
    await page.fill("#readinessNote", "Scans completed.");
    await page.click("button:has-text('Begin Review')");
    await page.fill("#readinessNote", "Ready to dispatch.");
    await page.click("button:has-text('Mark Ready for Testing')");

    // 2. Owner: register + approve + invite tester
    const testerName = `T-Issue-${stamp}`;
    const testerEmail = `t-issue-${stamp}@kavri.co`;
    const testerPassword = "TesterIssueSecret-2026!#";

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

    // 3. Owner: create round, create + invite assignment
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 15000 });

    const round = await createRecruitingRound(page, "E2EIssue");

    await page.goto("/owner/assignments/new");
    await page.selectOption("#roundId", { label: round.optionLabel });
    await page.selectOption("#testerProfileId", { label: testerName });
    await page.selectOption("#sampleSelect", { label: sampleCode });
    await page.fill("#instructions", "Report any defects observed.");
    await page.click("button:has-text('Save Draft Assignment')");

    await page.goto("/owner/assignments");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View brief')`);
    await page.click("button:has-text('Invite Tester')");
    await expect(page.locator("text=INVITED")).toBeVisible();

    // 4. Tester: log in, acknowledge, use the standalone "Report an Issue" entry point
    await page.goto("/login");
    await page.fill("#email", testerEmail);
    await page.fill("#password", testerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/tester/, { timeout: 15000 });

    await page.click("a:has-text('View Brief')");
    await page.click("button:has-text('Acknowledge Brief')");

    await page.click("a:has-text('Report an Issue')");
    await expect(page.locator("text=Report an Issue")).toBeVisible();

    await page.selectOption("#category", "core_crush");
    await page.selectOption("#issueType", "functional");
    await page.selectOption("#severity", "high");
    // Still-playable field only renders once issueType=functional is selected.
    await expect(page.locator("#stillPlayable")).toBeVisible();
    await page.selectOption("#stillPlayable", "no");
    await page.fill("#description", "Audible core crush near the throat after light use.");
    await page.click("button:has-text('Submit Issue Report')");
    await expect(page.locator("text=Issue reported.")).toBeVisible();

    // Photo upload requires BLOB_READ_WRITE_TOKEN (Vercel Blob), which is not provisioned in
    // this sandbox (same gap documented in Step 4) - the upload code path itself reuses Step 4's
    // uploadPhotoAction verbatim (already covered by that step's tests), so it is intentionally
    // not exercised end-to-end here.
    await page.click("button:has-text('Done')");

    // 5. Owner: confirm the issue appears on the sample detail page and the owner issue list
    await page.goto("/owner/samples");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('Review Sample')`);
    await expect(page.locator("text=core crush")).toBeVisible();
    await expect(page.locator("text=HIGH")).toBeVisible();

    await page.goto("/owner/issues");
    await expect(page.locator(`tr:has-text('${sampleCode}')`)).toBeVisible();
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View')`);

    // 6. Owner: resolve the issue
    await expect(page.locator("text=Still Playable")).toBeVisible();
    await page.selectOption("#immediateAction", "monitor");
    await page.selectOption("#resolutionStatus", "resolved");
    await page.fill("#resolutionNotes", "Confirmed with supplier, monitoring next batch.");
    await page.click("button:has-text('Save Resolution')");
    await expect(page.locator("text=Resolution saved.")).toBeVisible();
    await expect(page.locator("text=RESOLVED")).toBeVisible();
  });
});
