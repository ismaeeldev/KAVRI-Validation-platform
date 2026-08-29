import { expect, test } from "@playwright/test";

test.describe("Hero headline spacing", () => {
  test("headline words are spaced — not collapsed", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120000 });

    await page
      .waitForFunction(() => !document.documentElement.classList.contains("lp-boot-active"), null, {
        timeout: 30000,
      })
      .catch(() => {});

    const h1 = page.locator("section h1").first();
    await expect(h1).toBeVisible({ timeout: 15000 });

    const text = (await h1.innerText()).replace(/\s+/g, " ").trim();

    expect(text).not.toMatch(/Don'tShow/i);
    expect(text).not.toMatch(/WeShow/i);
    expect(text).toMatch(/We Don't Show/);
    expect(text).toMatch(/We Show Testing/);
    expect(text).toContain("Coming Soon.");

    const line1 = h1.locator("[data-hero-line]").nth(0);
    const line1Text = (await line1.innerText()).replace(/\s+/g, " ").trim();
    expect(line1Text).toBe("We Don't Show");
    expect(line1Text).not.toContain("Don'tShow");

    const line3 = h1.locator("[data-hero-line]").nth(2);
    const line3Text = (await line3.innerText()).replace(/\s+/g, " ").trim();
    expect(line3Text).toBe("We Show Testing.");
    expect(line3Text).not.toContain("WeShow");

    await page.screenshot({ path: "test-results/hero-spacing-check.png", fullPage: false });
  });
});
