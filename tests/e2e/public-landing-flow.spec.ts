import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

test.describe("Public Landing Page & Waitlist Lifecycle E2E Test", () => {
  test("manages public updates lifecycle and processes waitlist subscriptions", async ({ page }) => {
    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Owner Login
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/);

    // 2. Create Public Update - always starts as DRAFT (Step 13: state is no longer a form field)
    await page.goto("/owner/updates/new");
    const uniqueTitle = `Log Update - ${Date.now().toString().slice(-5)}`;
    await page.fill("#title", uniqueTitle);
    await page.fill("#statusLabel", "STABLE");
    await page.fill("#summary", "This update description should remain hidden during draft state.");
    await page.click("button:has-text('Create Update')");

    // Expect to see it in owner update list
    await expect(page).toHaveURL(/\/owner\/updates/);
    await expect(page.locator("table")).toContainText(uniqueTitle);

    // 3. Verify Landing page does NOT show draft update
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(uniqueTitle);

    // 4. Move through the full 6-state workflow: draft -> internal_review -> approved -> published
    await page.goto("/owner/updates");
    await page.click(`tr:has-text('${uniqueTitle}') a:has-text('Manage')`);
    await page.click("button:has-text('Send to Internal Review')");
    await expect(page.locator("text=INTERNAL REVIEW")).toBeVisible();
    await page.click("button:has-text('Approve')");
    await expect(page.locator("text=APPROVED")).toBeVisible();
    await page.click("button:has-text('Publish Now')");
    await page.click("button:has-text('Confirm')");
    await expect(page.locator("text=PUBLISHED")).toBeVisible();

    // 5. Verify Landing page DOES show published update
    await page.goto("/");
    await expect(page.locator("#feed")).toContainText(uniqueTitle);
    await expect(page.locator("#feed")).toContainText("This update description should remain hidden during draft state.");

    // 6. Test Waitlist form submission
    await page.goto("/");
    const uniqueEmail = `subscriber-${Date.now().toString().slice(-4)}@kavri.co`;
    await page.fill("input[placeholder='Enter your email address']", uniqueEmail);
    await page.click("button:has-text('Follow the build')");
    await expect(page.locator("text=Thank you. You have been added to the build follow feed.")).toBeVisible();

    // 7. Test Waitlist duplicate submission
    await page.goto("/");
    await page.fill("input[placeholder='Enter your email address']", uniqueEmail);
    await page.click("button:has-text('Follow the build')");
    await expect(page.locator("text=Thank you. You have been added to the build follow feed.")).toBeVisible();

    // 8. Verify waitlist subscriber is listed on owner waitlist view
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");
    
    await page.goto("/owner/waitlist");
    await expect(page.locator("table")).toContainText(uniqueEmail);
  });

  test("captures UTM/referral attribution and distinguishes general signups from tester applications (Sprint 1 revision, Step 14)", async ({ page }) => {
    const ownerEmail = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const ownerPassword = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    // 1. Visit the landing page with UTM params and submit the general waitlist form
    const generalEmail = `utm-subscriber-${Date.now().toString().slice(-5)}@kavri.co`;
    await page.goto("/?utm_source=twitter&utm_medium=social&utm_campaign=launch");
    await page.fill("input[placeholder='Enter your email address']", generalEmail);
    await page.click("button:has-text('Follow the build')");
    await expect(page.locator("text=Thank you. You have been added to the build follow feed.")).toBeVisible();

    // 2. Submit the genuinely separate Apply to Test entry point
    const applicantName = "Playwright Applicant";
    const applicantEmail = `applicant-${Date.now().toString().slice(-5)}@kavri.co`;
    await page.goto("/?ref=affiliate-9");
    await page.click("button:has-text('Apply to Test')");
    await page.fill("#applicant-name", applicantName);
    await page.fill("#applicant-email", applicantEmail);
    await page.getByRole("checkbox").click();
    await page.click("button:has-text('Submit Application')");
    await expect(page.locator("text=We will reach out if you are a fit")).toBeVisible();

    // 3. Owner login and verify both records appear distinctly on the waitlist page
    await page.goto("/login");
    await page.fill("#email", ownerEmail);
    await page.fill("#password", ownerPassword);
    await page.click("button:has-text('Log In')");

    await page.goto("/owner/waitlist");
    await expect(page.locator("table")).toContainText(generalEmail);
    await expect(page.locator("table")).toContainText(applicantEmail);

    // 4. Expand the tester-application row and verify captured detail fields
    await page.click(`tr:has-text('${applicantEmail}')`);
    await expect(page.locator("body")).toContainText(applicantName);
    await expect(page.locator("body")).toContainText("referral");

    // 5. Expand the general-signup row and verify UTM attribution was captured
    await page.click(`tr:has-text('${generalEmail}')`);
    await expect(page.locator("body")).toContainText("twitter");

    // 6. Trigger CSV export and confirm a download fires
    const downloadPromise = page.waitForEvent("download");
    await page.click("button:has-text('Export CSV')");
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("waitlist-export");
  });
});
