"use server";

import { addToWaitlist, applyToTest } from "../services/waitlist-service";
import { waitlistSignupSchema, testerApplicationSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

// Errors from addToWaitlist are caught here and returned as plain data rather than left to
// throw: Next.js Server Actions strip a thrown error's message in production builds (replacing
// it with a generic "error occurred in Server Components render" digest message, by design, to
// avoid leaking internal details) - which meant a real, meaningful error like "we couldn't
// confirm your subscription" was invisible to the visitor and looked like a crash instead of a
// clear, actionable message. Returning `{ success: false, message }` instead survives the
// client/server boundary intact.
export async function waitlistSignupAction(formData: unknown) {
  const parsed = waitlistSignupSchema.parse(formData);
  try {
    const result = await addToWaitlist(parsed);
    revalidatePath("/owner/waitlist");
    return result;
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, duplicate: false, message: err.message || "Failed to submit subscription." };
  }
}

export async function testerApplicationAction(formData: unknown) {
  const parsed = testerApplicationSchema.parse(formData);
  const result = await applyToTest(parsed);
  revalidatePath("/owner/waitlist");
  return result;
}
