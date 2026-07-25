"use server";

import { requireOwner } from "@/lib/permissions";
import { createAssignment, activateAssignment, revokeAssignment } from "../services/assignment-service";
import { createAssignmentSchema, revokeAssignmentSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createAssignmentAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createAssignmentSchema.parse(formData);
  const result = await createAssignment(parsed, session.user.id);
  revalidatePath("/owner/assignments");
  return result;
}

export async function activateAssignmentAction(id: string) {
  const { session } = await requireOwner();
  const result = await activateAssignment(id, session.user.id);
  revalidatePath(`/owner/assignments/${id}`);
  revalidatePath("/owner/assignments");
  return result;
}

export async function revokeAssignmentAction(id: string, reason: string) {
  const { session } = await requireOwner();
  const parsed = revokeAssignmentSchema.parse({ reason });
  const result = await revokeAssignment(id, parsed.reason, session.user.id);
  revalidatePath(`/owner/assignments/${id}`);
  revalidatePath("/owner/assignments");
  return result;
}
