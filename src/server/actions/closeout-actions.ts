"use server";

import { requireOwner } from "@/lib/permissions";
import { createCloseoutDecision } from "../services/closeout-service";
import { createCloseoutDecisionSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createCloseoutDecisionAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createCloseoutDecisionSchema.parse(formData);
  const result = await createCloseoutDecision(parsed, session.user.id);

  if (parsed.scope === "round") {
    revalidatePath(`/owner/rounds/${parsed.scopeId}`);
    revalidatePath(`/owner/rounds/${parsed.scopeId}/closeout`);
    revalidatePath("/owner/rounds");
  }

  return result;
}
