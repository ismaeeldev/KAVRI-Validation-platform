import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { createRecruitingRound } from "./helpers/round-helper";

dotenv.config({ path: ".env.local" });

test.describe("Mobile-First Tester Portal E2E Test", () => {
  test("onboards a tester, logs a ready sample, dispatches assignment, and acknowledges it from the mobile portal", async ({ page }) => {
    // Force mobile viewport emulation
    await page.setViewportSize({ width: 360, height: 740 });

    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Owner Login & Log Sample
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");

    // Log ready physical sample
    await page.goto("/owner/samples/new");
    const sampleCode = `S-PORTAL-${Date.now().toString().slice(-4)}`;
    await page.fill("#sampleCode", sampleCode);
    await page.selectOption("#productSelect", { index: 1 });
    await page.selectOption("#revisionId", { index: 1 });
    await page.fill("#receivingObservations", "Incoming seals checked.");
    await page.click("button:has-text('Log Sample')");

    // Mark ready for testing
    await page.goto("/owner/samples");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View Triage')`);
    await page.fill("#readinessNote", "Scans completed.");
    await page.click("button:has-text('Begin Review')");
    await page.fill("#readinessNote", "Ready to dispatch.");
    await page.click("button:has-text('Mark Ready for Testing')");

    // 2. Register Tester Profile
    await page.goto("/owner/testers");
    const testerName = `T-Portal-${Date.now().toString().slice(-4)}`;
    const testerEmail = `t-portal-${Date.now().toString().slice(-4)}@kavri.co`;
    const testerPassword = "TesterPortalSecret-2026!#";

    await page.fill("#name", testerName);
    await page.fill("#email", testerEmail);
    await page.click("button:has-text('Add Tester Profile')");

    // Manage tester approval and generate invite
    await page.click(`tr:has-text('${testerName}') a:has-text('Manage')`);
    await page.click("button:has-text('Approve Tester')");
    await page.click("button:has-text('Generate Invitation')");

    // Extract raw invitation token
    const inviteUrlInput = page.locator("input[readonly]");
    const invitationLink = await inviteUrlInput.inputValue();
    await page.click("button:has-text('Close Warning Dialog')");

    // 3. Accept Invitation & Setup Password
    await page.goto(invitationLink);
    await page.fill("#password", testerPassword);
    await page.fill("#confirmPassword", testerPassword);
    await page.click("button:has-text('Activate Account')");

    // 4. Owner logs back in to dispatch/invite the assignment brief
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");

    // Create a round and link it to the sample's revision (Step 10 requires a round on every
    // new assignment).
    const round = await createRecruitingRound(page, "E2EPortal");

    // Create Draft Assignment
    await page.goto("/owner/assignments/new");
    await page.selectOption("#roundId", { label: round.optionLabel });
    await page.selectOption("#testerProfileId", { label: testerName });
    await page.selectOption("#sampleSelect", { label: sampleCode });
    await page.fill("#instructions", "Conduct physical batch stress validation. Log observations.");
    await page.click("button:has-text('Save Draft Assignment')");

    // Invite the tester (formerly "Activate Assignment" - Step 10 renamed the stored 'active'
    // status to 'invited' to avoid colliding with the new computed 'Active' progress label)
    await page.goto("/owner/assignments");
    await page.click(`tr:has-text('${sampleCode}') a:has-text('View brief')`);
    await page.click("button:has-text('Invite Tester')");
    await expect(page.locator("text=INVITED")).toBeVisible();

    // 5. Log in as TESTER to mobile portal and Acknowledge brief
    await page.goto("/login");
    await page.fill("#email", testerEmail);
    await page.fill("#password", testerPassword);
    await page.click("button:has-text('Log In')");

    // Expect redirect to mobile tester portal overview
    await expect(page).toHaveURL(/\/tester/);
    await expect(page.locator("text=Tester Workspace")).toBeVisible();

    // View Assignment detail brief page
    await page.click("a:has-text('View Brief')");
    await expect(page.locator("text=Instructions Brief")).toBeVisible();
    
    // Acknowledge the brief
    await page.click("button:has-text('Acknowledge Brief')");

    // Verify the computed progress status advances past "acknowledged" to the next real step
    // (Step 10: computed status layers on top of the stored 'acknowledged' state).
    await expect(page.locator("text=FIRST IMPRESSION DUE")).toBeVisible();
  });
});
