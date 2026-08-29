"use server";

import { requireActiveTester, requireOwner } from "@/lib/permissions";
import {
  createPlaySession,
  createOrUpdateDraftEvaluation,
  submitEvaluation,
  editSubmittedEvaluation,
  reopenEvaluation,
  getEvaluationProgress,
} from "../services/evaluation-service";
import { createPlaySessionSchema, evaluationDraftSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createPlaySessionAction(assignmentId: string, formData: unknown) {
  const { session } = await requireActiveTester();
  const parsed = createPlaySessionSchema.parse(formData);
  const result = await createPlaySession(assignmentId, parsed, session.user.id);
  revalidatePath(`/tester/assignments/${assignmentId}`);
  return result;
}

export async function saveDraftEvaluationAction(assignmentId: string, formData: unknown) {
  const { session } = await requireActiveTester();
  const parsed = evaluationDraftSchema.parse(formData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await createOrUpdateDraftEvaluation(assignmentId, parsed as any, session.user.id);
  return result;
}

export async function submitEvaluationAction(evaluationId: string, assignmentId: string) {
  const { session } = await requireActiveTester();
  const result = await submitEvaluation(evaluationId, session.user.id);
  revalidatePath(`/tester/assignments/${assignmentId}`);
  return result;
}

export async function editSubmittedEvaluationAction(evaluationId: string, assignmentId: string, formData: unknown) {
  const { session } = await requireActiveTester();
  const parsed = evaluationDraftSchema.parse(formData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await editSubmittedEvaluation(evaluationId, parsed as any, session.user.id);
  revalidatePath(`/tester/assignments/${assignmentId}`);
  return result;
}

// Decision 1: OWNER-ONLY. requireOwner() throws before any state changes, so a tester (or any
// unauthenticated caller) invoking this action directly is rejected - the reopen decision is the
// owner's alone. The tester's own submitted evaluations stay locked until this runs.
export async function reopenEvaluationAction(
  evaluationId: string,
  roundId: string,
  reason?: string
) {
  const { session } = await requireOwner();
  const result = await reopenEvaluation(evaluationId, session.user.id, reason);
  revalidatePath(`/owner/rounds/${roundId}/evaluations/${evaluationId}`);
  revalidatePath(`/owner/rounds/${roundId}/evaluations`);
  return result;
}

export async function getEvaluationProgressAction(assignmentId: string) {
  const { session } = await requireActiveTester();
  return await getEvaluationProgress(assignmentId, session.user.id);
}
