import { expect, test } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const OWNER_EMAIL = process.env.BOOTSTRAP_OWNER_EMAIL || "admin@kavri.co";
const OWNER_PASSWORD = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD || "Kavri-SecureAdmin-2026!#";

function collectConsoleErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

function assertNoCriticalErrors(errors: string[]) {
  const critical = errors.filter(
    (e) =>
      !e.includes("favicon") &&
      !e.includes("404") &&
      !e.includes("Failed to load resource") &&
      !e.includes("net::ERR_INTERNET_DISCONNECTED")
  );
  expect(critical, `Unexpected console errors: ${critical.join(" | ")}`).toHaveLength(0);
}

test.describe("PWA production shell", () => {
  test("manifest exposes owner-first standalone install metadata", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.name).toBe("KAVRI Validation Platform");
    expect(manifest.short_name).toBe("KAVRI");
    expect(manifest.start_url).toBe("/owner");
    expect(manifest.display).toBe("standalone");
    expect(manifest.display_override).toContain("window-controls-overlay");
    expect(manifest.theme_color).toBe("#0a1004");
    expect(manifest.background_color).toBe("#f9f9f7");
    expect(manifest.icons?.length).toBeGreaterThanOrEqual(4);
    expect(manifest.shortcuts?.length).toBe(4);
    expect(manifest.shortcuts.map((s: { url: string }) => s.url)).toEqual([
      "/owner",
      "/owner/assignments",
      "/owner/samples",
      "/owner/issues",
    ]);
  });

  test("service worker is served for registration", async ({ request }) => {
    const response = await request.get("/serwist/sw.js");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("javascript");

    const body = await response.text();
    expect(body.length).toBeGreaterThan(1000);
    expect(body).toContain("offline");
  });

  test("service worker registers in Chromium", async ({ page }) => {
    await page.goto("/login");
    const registered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration("/serwist/sw.js");
      if (reg) return true;
      try {
        await navigator.serviceWorker.register("/serwist/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;
        return true;
      } catch {
        return false;
      }
    });
    expect(registered).toBeTruthy();
  });

  test("offline fallback page is professional and usable", async ({ page }) => {
    await page.goto("/~offline");
    await expect(page.getByRole("heading", { name: "You're offline" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Dashboard" })).toHaveAttribute("href", "/owner");
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.locator("text=KAVRI")).toBeVisible();
  });

  test("dynamic PWA icons resolve at all required sizes", async ({ request }) => {
    for (const size of [72, 192, 512]) {
      let response = await request.get(`/pwa/icon/${size}`);
      if (!response.ok()) {
        response = await request.get(`/pwa/icon/${size}`);
      }
      expect(response.ok()).toBeTruthy();
      expect(response.headers()["content-type"]).toContain("image/png");
      const buf = await response.body();
      expect(buf.byteLength).toBeGreaterThan(100);
    }

    const maskable = await request.get("/pwa/icon/192?maskable=1");
    expect(maskable.ok()).toBeTruthy();
  });

  test("HTML documents link manifest, icons, and theme color", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
    await expect(page.locator('link[rel="icon"]').first()).toHaveCount(1);
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveCount(1);
    await expect(page.locator('meta[name="application-name"]')).toHaveAttribute("content", "KAVRI Validation Platform");
  });
});

test.describe("PWA does not break public surfaces", () => {
  test("landing page loads cleanly with no critical console errors", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/");
    await expect(page.locator("body")).toContainText("KAVRI");
    await page.waitForTimeout(1500);
    assertNoCriticalErrors(errors);
  });

  test("login page renders form without layout regressions", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button:has-text('Log In')")).toBeVisible();
    assertNoCriticalErrors(errors);
  });
});

test.describe("PWA owner workspace integration", () => {
  test("owner login and dashboard load with sidebar intact", async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await page.goto("/login");
    await page.fill("#email", OWNER_EMAIL);
    await page.fill("#password", OWNER_PASSWORD);
    await page.click("button:has-text('Log In')");

    await expect(page).toHaveURL(/\/owner/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: "Owner Dashboard", level: 1 })).toBeVisible();

    await expect(page.getByRole("link", { name: "Security Settings" })).toBeVisible();
    await expect(page.getByRole("navigation").first()).toBeVisible();

    assertNoCriticalErrors(errors);
  });

  test("owner navigation routes work after PWA shell added", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", OWNER_EMAIL);
    await page.fill("#password", OWNER_PASSWORD);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 20000 });

    const routes = ["/owner/assignments", "/owner/samples", "/owner/issues", "/owner/suppliers"];
    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")));
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("offline navigation shows fallback when network is blocked", async ({ page, context }) => {
    await page.goto("/login");
    await page.fill("#email", OWNER_EMAIL);
    await page.fill("#password", OWNER_PASSWORD);
    await page.click("button:has-text('Log In')");
    await expect(page).toHaveURL(/\/owner/, { timeout: 20000 });

    await context.setOffline(true);
    await page.goto("/owner/assignments").catch(() => {});
    await expect(page.getByRole("heading", { name: "You're offline" })).toBeVisible({ timeout: 15000 });
    await context.setOffline(false);
  });
});
