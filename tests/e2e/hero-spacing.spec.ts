import { expect, test } from "@playwright/test";

test.describe("Hero headline spacing", () => {
  test("glass hero headline words are spaced — not collapsed", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("kavri-boot-seen", "1");
      document.documentElement.classList.remove("lp-boot-active");
    });

    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120000 });
    const panel = page.locator("[data-hero-panel]");
    await expect(panel).toBeVisible({ timeout: 15000 });

    const h1 = panel.locator("h1");
    const panelText = (await panel.innerText()).replace(/\s+/g, " ").trim();
    const h1Text = (await h1.innerText()).replace(/\s+/g, " ").trim();

    expect(panelText).not.toMatch(/WeShow/i);
    expect(h1Text).toMatch(/We Show Testing/);
    expect(h1Text).not.toContain("WeShow");
  });
});
