"use server";

import { requireOwner } from "@/lib/permissions";
import {
  createSample,
  transitionSampleStatus,
  updateSampleMeasurements,
  updateSampleInspection,
} from "../services/sample-service";
import {
  createSampleSchema,
  transitionStatusSchema,
  updateSampleMeasurementsSchema,
  updateSampleInspectionSchema,
} from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createSampleAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createSampleSchema.parse(formData);
  const result = await createSample(parsed, session.user.id);
  revalidatePath("/owner/samples");
  return result;
}

export async function updateSampleMeasurementsAction(sampleId: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = updateSampleMeasurementsSchema.parse(formData);
  const result = await updateSampleMeasurements(sampleId, parsed, session.user.id);
  revalidatePath(`/owner/samples/${sampleId}`);
  return result;
}

export async function updateSampleInspectionAction(sampleId: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = updateSampleInspectionSchema.parse(formData);
  const result = await updateSampleInspection(sampleId, parsed, session.user.id);
  revalidatePath(`/owner/samples/${sampleId}`);
  return result;
}

export async function transitionSampleStatusAction(
  sampleId: string,
  status: string,
  readinessNote: string,
  returnDetails?: unknown
) {
  const { session } = await requireOwner();
  const parsed = transitionStatusSchema.parse({
    status,
    readinessNote,
    ...(returnDetails && typeof returnDetails === "object" ? returnDetails : {}),
  });
  const result = await transitionSampleStatus(sampleId, parsed.status, parsed.readinessNote, session.user.id, {
    returnedAt: parsed.returnedAt,
    returnReceivedBy: parsed.returnReceivedBy,
    returnInspectionPackagingOk: parsed.returnInspectionPackagingOk,
    returnInspectionPackagingNotes: parsed.returnInspectionPackagingNotes,
    returnInspectionCosmeticOk: parsed.returnInspectionCosmeticOk,
    returnInspectionCosmeticNotes: parsed.returnInspectionCosmeticNotes,
    returnInspectionConstructionOk: parsed.returnInspectionConstructionOk,
    returnInspectionConstructionNotes: parsed.returnInspectionConstructionNotes,
    returnInspectionSoundOk: parsed.returnInspectionSoundOk,
    returnInspectionSoundNotes: parsed.returnInspectionSoundNotes,
  });
  revalidatePath(`/owner/samples/${sampleId}`);
  revalidatePath("/owner/samples");
  return result;
}
