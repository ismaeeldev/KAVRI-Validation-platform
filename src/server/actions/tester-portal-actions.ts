"use server";

import { requireActiveTester } from "@/lib/permissions";
import { acknowledgeAssignment } from "../services/tester-portal-service";
import { revalidatePath } from "next/cache";

export async function acknowledgeAssignmentAction(assignmentId: string) {
  const { session } = await requireActiveTester();
  const result = await acknowledgeAssignment(assignmentId, session.user.id);
  revalidatePath(`/tester/assignments/${assignmentId}`);
  revalidatePath("/tester");
  return result;
}
