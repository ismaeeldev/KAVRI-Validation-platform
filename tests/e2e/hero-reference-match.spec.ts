import { expect, test } from "@playwright/test";

test.describe("Hero reference layout match", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("kavri-boot-seen", "1");
      document.documentElement.classList.remove("lp-boot-active");
    });
  });

  test("matches reference glass hero structure", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const panel = page.locator("[data-hero-panel]");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/lp-hero-glass/);

    const text = (await panel.innerText()).replace(/\s+/g, " ").trim();
    expect(text).toMatch(/premium hardware/i);
    expect(text).toMatch(/live · field test/i);
    expect(text).toContain("VAL-L06-001");
    expect(text).toMatch(/active narrative/i);
    expect(text).toMatch(/We Show Testing/);
    expect(text).not.toMatch(/rejected narrative/i);
    expect(text).not.toMatch(/deprecated/i);
    expect(text).not.toMatch(/Don'tShow|WeShow/i);

    await expect(page.locator("[data-hero-reject]")).toHaveCount(0);
    await expect(page.locator(".lp-hero-scan")).toHaveCount(0);

    await expect(panel.getByText("Measured. Not guessed.")).toBeVisible();
    await expect(panel.getByText("Tested across real conditions.")).toBeVisible();
    await expect(panel.getByText("Feedback drives every step.")).toBeVisible();
  });

  test("glass card has blur and high border radius", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const styles = await page.locator(".lp-hero-glass").evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        radius: s.borderRadius,
        blur: s.backdropFilter || (s as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter,
      };
    });
    expect(parseFloat(styles.radius)).toBeGreaterThanOrEqual(24);
    expect(styles.blur).toContain("blur");
  });

  test("fits in one laptop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const fit = await page.evaluate(() => {
      const trust = document.querySelector("[data-hero-trust]") as HTMLElement | null;
      if (!trust) return false;
      return trust.getBoundingClientRect().bottom <= window.innerHeight + 4;
    });
    expect(fit).toBe(true);
  });
});
