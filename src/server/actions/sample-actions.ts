"use server";

import { requireOwner } from "@/lib/permissions";
import { createSample, transitionSampleStatus } from "../services/sample-service";
import { createSampleSchema, transitionStatusSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createSampleAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createSampleSchema.parse(formData);
  const result = await createSample(parsed, session.user.id);
  revalidatePath("/owner/samples");
  return result;
}

export async function transitionSampleStatusAction(
  sampleId: string,
  status: string,
  readinessNote: string
) {
  const { session } = await requireOwner();
  const parsed = transitionStatusSchema.parse({ status, readinessNote });
  const result = await transitionSampleStatus(sampleId, parsed.status, parsed.readinessNote, session.user.id);
  revalidatePath(`/owner/samples/${sampleId}`);
  revalidatePath("/owner/samples");
  return result;
}
