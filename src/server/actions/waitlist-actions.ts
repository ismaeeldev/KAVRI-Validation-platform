"use server";

import { addToWaitlist } from "../services/waitlist-service";
import { waitlistSignupSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function waitlistSignupAction(formData: unknown) {
  const parsed = waitlistSignupSchema.parse(formData);
  const result = await addToWaitlist(parsed);
  revalidatePath("/owner/waitlist");
  return result;
}
