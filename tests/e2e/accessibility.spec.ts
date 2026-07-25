import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility audits (Axe)", () => {
  test("landing page should pass basic accessibility audits", async ({ page }) => {
    await page.goto("/");
    
    // Inject and run axe builder
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
      
    expect(results.violations).toEqual([]);
  });

  test("login page should pass basic accessibility audits", async ({ page }) => {
    await page.goto("/login");
    
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
      
    expect(results.violations).toEqual([]);
  });
});
