import { Page, expect } from "@playwright/test";

export interface CreatedRound {
  /** Exact `#roundId` <option> label text ("{roundName} ({roundCode})", see round-create-form.tsx). */
  optionLabel: string;
  roundName: string;
  roundCode: string;
}

/**
 * Creates a Test Round, links every currently available revision to it (so whichever revision
 * a just-created sample uses is guaranteed to be covered), and advances it to 'recruiting' so
 * it's selectable on the create-assignment form.
 *
 * Assumes the caller is already logged in as the owner.
 */
export async function createRecruitingRound(page: Page, namePrefix: string): Promise<CreatedRound> {
  const stamp = Date.now().toString().slice(-6);
  const roundCode = `${namePrefix}${stamp}`;
  const roundName = `${namePrefix} Round ${stamp}`;

  await page.goto("/owner/rounds/new");
  await page.fill("#roundName", roundName);
  await page.fill("#roundCode", roundCode);
  await page.fill("#purpose", "Support an E2E test flow.");
  await page.fill("#instructions", "Standard validation instructions.");
  await page.fill("#requiredSessionCount", "1");

  const revisionCheckboxes = page.locator(".max-h-56 input[type='checkbox']");
  const revisionCount = await revisionCheckboxes.count();
  for (let i = 0; i < revisionCount; i++) {
    await revisionCheckboxes.nth(i).check();
  }

  await page.click("button:has-text('Create Round')");
  await expect(page).toHaveURL(/\/owner\/rounds$/, { timeout: 15000 });
  await page.click(`tr:has-text('${roundName}') a:has-text('Manage')`);
  await page.click("button:has-text('Begin Recruiting')");

  return { optionLabel: `${roundName} (${roundCode})`, roundName, roundCode };
}
