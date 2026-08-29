import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

test.describe("Hero glass card browser QA", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("kavri-boot-seen", "1");
      document.documentElement.classList.remove("lp-boot-active");
    });
  });

  for (const vp of VIEWPORTS) {
    test(`renders cleanly at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120000 });
      await expect(page.locator("[data-hero-panel]")).toBeVisible({ timeout: 20000 });

      const audit = await page.evaluate(() => {
        const panel = document.querySelector("[data-hero-panel]") as HTMLElement | null;
        const issues: string[] = [];
        if (!panel) return { issues: ["missing panel"], overflow: true, panelCenterOffset: 999 };

        const panelRect = panel.getBoundingClientRect();
        const docWidth = document.documentElement.clientWidth;
        if (panelRect.width > docWidth) issues.push("panel overflows viewport");
        if (panelRect.right > docWidth + 2) issues.push("panel clipped right");

        return {
          issues,
          overflow: issues.length > 0,
          panelCenterOffset: Math.round(panelRect.left + panelRect.width / 2 - docWidth / 2),
        };
      });

      expect(audit.issues, audit.issues.join("; ")).toHaveLength(0);
      if (vp.width >= 1024) {
        expect(Math.abs(audit.panelCenterOffset)).toBeLessThan(48);
      }
    });
  }

  test("hero CTAs are visible and keyboard reachable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const join = page.locator("[data-hero-cta-group]").getByRole("link", { name: /Join the Build/i });
    const watch = page.locator("[data-hero-cta-group]").getByRole("link", { name: /Watch How It Works/i });
    await expect(join).toBeVisible();
    await expect(watch).toBeVisible();
    await join.focus();
    await expect(join).toBeFocused();
  });
});
