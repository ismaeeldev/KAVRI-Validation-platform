import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Runs accessibility checks on a Playwright page using axe-core.
 * It will verify that there are no violations with impact 'serious' or 'critical'.
 */
export async function assertPageAccessibility(page: Page) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["html-has-lang"])
    .analyze();

  const seriousOrCriticalViolations = accessibilityScanResults.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical"
  );

  if (seriousOrCriticalViolations.length > 0) {
    console.error("Accessibility Violations Found:", JSON.stringify(seriousOrCriticalViolations, null, 2));
  }

  expect(seriousOrCriticalViolations.length).toBe(0);
}
