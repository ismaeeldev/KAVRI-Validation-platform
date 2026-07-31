"use server";

import { addToWaitlist, applyToTest, exportWaitlistToCsv } from "../services/waitlist-service";
import { waitlistSignupSchema, testerApplicationSchema } from "@/lib/validation/schemas";
import { requireOwner } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function waitlistSignupAction(formData: unknown) {
  const parsed = waitlistSignupSchema.parse(formData);
  const result = await addToWaitlist(parsed);
  revalidatePath("/owner/waitlist");
  return result;
}

export async function testerApplicationAction(formData: unknown) {
  const parsed = testerApplicationSchema.parse(formData);
  const result = await applyToTest(parsed);
  revalidatePath("/owner/waitlist");
  return result;
}

export async function exportWaitlistCsvAction() {
  await requireOwner();
  return await exportWaitlistToCsv();
}
