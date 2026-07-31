import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Sprint1_rev.md Step 16, items 7 and 11: confirm (not assume) that every owner/** and tester/**
// route - including every new module added since Step 4 (Rounds, Evaluations, Issues, Closeout) -
// redirects a logged-out visitor to /login rather than rendering. Route-level auth is enforced by
// requireOwner()/requireActiveTester() in owner/layout.tsx and tester/layout.tsx, but that
// enforcement is what's under test here, not assumed to be correct.
test.describe("Logged-out direct URL access is blocked (Sprint 1 revision, Step 16)", () => {
  const ownerRoutes = [
    "/owner",
    "/owner/activity-log",
    "/owner/assignments",
    "/owner/assignments/new",
    "/owner/issues",
    "/owner/products",
    "/owner/products/new",
    "/owner/rounds",
    "/owner/rounds/new",
    "/owner/samples",
    "/owner/samples/new",
    "/owner/suppliers",
    "/owner/suppliers/new",
    "/owner/testers",
    "/owner/updates",
    "/owner/updates/new",
    "/owner/waitlist",
  ];

  const testerRoutes = ["/tester"];

  for (const route of [...ownerRoutes, ...testerRoutes]) {
    test(`${route} redirects to /login when logged out`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("/account/security redirects to /login when logged out", async ({ page }) => {
    await page.goto("/account/security");
    await expect(page).toHaveURL(/\/login/);
  });
});
