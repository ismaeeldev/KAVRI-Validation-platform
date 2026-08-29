"use server";

import { requireActiveTester } from "@/lib/permissions";
import { acknowledgeAssignment, confirmAssignmentSample } from "../services/tester-portal-service";
import { confirmAssignmentSampleSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function acknowledgeAssignmentAction(assignmentId: string) {
  const { session } = await requireActiveTester();
  const result = await acknowledgeAssignment(assignmentId, session.user.id);
  revalidatePath(`/tester/assignments/${assignmentId}`);
  revalidatePath("/tester");
  return result;
}

export async function confirmAssignmentSampleAction(assignmentId: string, formData: unknown) {
  const { session } = await requireActiveTester();
  const parsed = confirmAssignmentSampleSchema.parse(formData);
  const result = await confirmAssignmentSample(assignmentId, session.user.id, parsed.shortCode);
  revalidatePath(`/tester/assignments/${assignmentId}`);
  return result;
}
