"use server";

import { requireOwner } from "@/lib/permissions";
import {
  createRound,
  updateRound,
  transitionRoundStatus,
  addRevisionToRound,
  removeRevisionFromRound,
} from "../services/test-round-service";
import {
  createRoundSchema,
  updateRoundSchema,
  transitionRoundStatusSchema,
} from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createRoundAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createRoundSchema.parse(formData);
  const result = await createRound(parsed, session.user.id);
  revalidatePath("/owner/rounds");
  return result;
}

export async function updateRoundAction(roundId: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = updateRoundSchema.parse(formData);
  const result = await updateRound(roundId, parsed, session.user.id);
  revalidatePath(`/owner/rounds/${roundId}`);
  revalidatePath("/owner/rounds");
  return result;
}

export async function transitionRoundStatusAction(roundId: string, status: string) {
  const { session } = await requireOwner();
  const parsed = transitionRoundStatusSchema.parse({ status });
  const result = await transitionRoundStatus(roundId, parsed.status, session.user.id);
  revalidatePath(`/owner/rounds/${roundId}`);
  revalidatePath("/owner/rounds");
  return result;
}

export async function addRevisionToRoundAction(roundId: string, revisionId: string) {
  const { session } = await requireOwner();
  const result = await addRevisionToRound(roundId, revisionId, session.user.id);
  revalidatePath(`/owner/rounds/${roundId}`);
  return result;
}

export async function removeRevisionFromRoundAction(roundId: string, revisionId: string) {
  const { session } = await requireOwner();
  await removeRevisionFromRound(roundId, revisionId, session.user.id);
  revalidatePath(`/owner/rounds/${roundId}`);
}
