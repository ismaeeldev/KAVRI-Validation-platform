import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { createRecruitingRound } from "./helpers/round-helper";

dotenv.config({ path: ".env.local" });

test.describe("Tester Onboarding & Assignments Workflow E2E Test", () => {
  test("creates tester, generates invitation, accepts invitation, creates draft assignment, and activates it", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Owner Login
    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/);

    // 2. Log a Ready Physical Sample first (so we have a sample ready for assignment binding)
    await page.goto("/owner/samples/new");
    const uniqueSampleCode = `S-ASG-${Date.now().toString().slice(-5)}`;
    await page.fill("#sampleCode", uniqueSampleCode);
    await page.selectOption("#productSelect", { index: 1 });
    await page.selectOption("#revisionId", { index: 1 });
    await page.fill("#receivingObservations", "Seals intact, ready for assignment.");
    await page.click("button:has-text('Log Sample')");

    // Go to triage detail page and mark ready
    await page.goto("/owner/samples");
    await page.click(`tr:has-text('${uniqueSampleCode}') a:has-text('Review Sample')`);
    await page.fill("#readinessNote", "Surface scans completed, approved for assignments.");
    await page.click("button:has-text('Begin Review')");
    await page.fill("#readinessNote", "Microscope stress test passed, marked ready.");
    await page.click("button:has-text('Mark Ready for Testing')");
    await expect(page.locator("text=ready_for_testing")).toBeVisible();

    // 2b. Create a Test Round and link it to the same revision the sample uses (Step 10 requires
    // every assignment to be linked to a round whose revision list includes the sample's revision).
    const round = await createRecruitingRound(page, "E2EAssignment");

    // 3. Register Pending Tester
    await page.goto("/owner/testers");
    const testerName = `Tester-${Date.now().toString().slice(-4)}`;
    const testerEmail = `tester-${Date.now().toString().slice(-4)}@kavri.co`;
    await page.fill("#name", testerName);
    await page.fill("#email", testerEmail);
    await page.click("button:has-text('Add Tester Profile')");

    // Expect pending tester in list
    await expect(page.locator("table")).toContainText(testerName);
    await expect(page.locator("table")).toContainText(testerEmail);

    // Go to tester detail manage view
    await page.click(`tr:has-text('${testerName}') a:has-text('Manage')`);
    await expect(page.locator("h3")).toContainText(testerName);

    // Approve the tester
    await page.click("button:has-text('Approve Tester')");
    await expect(page.locator("text=Status: approved")).toBeVisible();

    // Generate Secure Invitation
    await page.click("button:has-text('Generate Invitation')");
    await expect(page.locator("text=One-Time Secure Invitation Link")).toBeVisible();

    // Extract the raw invitation link from input
    const inviteUrlInput = page.locator("input[readonly]");
    const invitationLink = await inviteUrlInput.inputValue();
    expect(invitationLink).toContain("/invite/");

    // Close the warning dialog
    await page.click("button:has-text('Close Warning Dialog')");

    // 4. Accept Invitation (navigate to the extracted URL)
    await page.goto(invitationLink);
    await expect(page.locator("h3")).toContainText("Activate Tester Account");

    // Fill password details
    await page.fill("#password", "TesterSecret-2026!#");
    await page.fill("#confirmPassword", "TesterSecret-2026!#");
    await page.click("button:has-text('Activate Account')");

    // Verify redirect back to Login view
    await expect(page).toHaveURL(/\/login/);

    // 5. Owner Logs Back In to Create Assignment
    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/);

    // Navigate to Create Assignment Form
    await page.goto("/owner/assignments/new");
    await page.selectOption("#roundId", { label: round.optionLabel });
    await page.selectOption("#testerProfileId", { label: testerName });
    await page.selectOption("#sampleSelect", { label: uniqueSampleCode });
    await page.fill("#instructions", "Conduct carbon weave wear logs. Log logs hourly.");
    await page.click("button:has-text('Save Draft Assignment')");

    // Expect redirect back to assignments list
    await expect(page).toHaveURL(/\/owner\/assignments/);
    await expect(page.locator("table")).toContainText(testerName);
    await expect(page.locator("table")).toContainText(uniqueSampleCode);

    // View assignment detail and invite the tester (formerly "Activate")
    await page.click(`tr:has-text('${uniqueSampleCode}') a:has-text('View brief')`);
    await expect(page.locator("text=draft")).toBeVisible();
    await page.click("button:has-text('Invite Tester')");

    // Verify the stored status renamed from 'active' to 'invited' (Step 10) is now set
    await expect(page.locator("text=INVITED")).toBeVisible();
    await expect(page.locator("text=assignment.invited")).toBeVisible();
  });
});
