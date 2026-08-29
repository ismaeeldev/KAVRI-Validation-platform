import { test, expect } from "@playwright/test";

/**
 * Validates KAVRI-Client-Testing-Guide.pdf claims against the live app.
 * Run: pnpm exec playwright test tests/e2e/client-guide-validation.spec.ts --config=playwright.audit.config.ts
 */
test.describe("Client Testing Guide — accuracy validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("kavri-boot-seen", "1");
      document.documentElement.classList.remove("lp-boot-active");
    });
  });

  test("public landing sections from guide exist", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText(/Testing/i);

    const sections = [
      { id: "current-testing", label: "Current Testing" },
      { id: "how-we-test", label: "How We Validate" },
      { id: "testing-log", label: "Development Log" },
      { id: "join-the-build", label: "Join the Build" },
      { id: "about-kavri", label: "About KAVRI" },
    ];

    for (const { id } of sections) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("nav anchor links scroll to guide sections", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "How We Test" }).click();
    await expect(page).toHaveURL(/#how-we-test/);

    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Testing Log" }).click();
    await expect(page).toHaveURL(/#testing-log/);
  });

  test("footer Team Login goes to /login", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /Team Login/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logged-out user cannot access owner dashboard", async ({ page }) => {
    await page.goto("/owner");
    await expect(page).toHaveURL(/\/login/);
  });

  test("owner login with guide credentials reaches dashboard", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/owner/, { timeout: 20000 });
  });

  test("owner sidebar modules match guide", async ({ page }) => {
    const email = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
    const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/owner/);

    const expected = [
      "Suppliers",
      "Products",
      "Samples",
      "Testers",
      "Rounds",
      "Assignments",
      "Issues",
      "Public Updates",
      "Waitlist",
    ];

    for (const name of expected) {
      await expect(page.getByRole("link", { name, exact: true }).first()).toBeVisible();
    }
  });

  test("waitlist form on join-the-build section works", async ({ page }) => {
    await page.goto("/#join-the-build", { waitUntil: "domcontentloaded" });
    const email = page.locator("#join-the-build input[type='email']").first();
    await expect(email).toBeVisible();
    await email.fill("not-an-email");
    await page.locator("#join-the-build button[type='submit']").first().click();
    // HTML5 or zod validation should prevent success
    await expect(page.locator("text=Thank you")).not.toBeVisible();
  });

  test("tester login page exists at /tester/login", async ({ page }) => {
    await page.goto("/tester/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.getByRole("link", { name: /KAVRI staff sign-in/i })).toBeVisible();
  });
});
