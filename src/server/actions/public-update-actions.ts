"use server";

import { requireOwner } from "@/lib/permissions";
import {
  createPublicUpdate,
  updatePublicUpdate,
  transitionPublicUpdate,
  generatePreviewLink,
} from "../services/public-update-service";
import { createPublicUpdateSchema, transitionPublicUpdateSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createPublicUpdateAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createPublicUpdateSchema.parse(formData);
  const result = await createPublicUpdate(parsed, session.user.id);
  revalidatePath("/");
  revalidatePath("/owner/updates");
  return result;
}

export async function updatePublicUpdateAction(id: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createPublicUpdateSchema.parse(formData);
  const result = await updatePublicUpdate(id, parsed, session.user.id);
  revalidatePath("/");
  revalidatePath("/owner/updates");
  revalidatePath(`/owner/updates/${id}`);
  return result;
}

export async function transitionPublicUpdateAction(id: string, status: string, scheduledFor?: string) {
  const { session } = await requireOwner();
  const parsed = transitionPublicUpdateSchema.parse({ status, scheduledFor });
  const result = await transitionPublicUpdate(id, parsed.status, session.user.id, parsed.scheduledFor);
  revalidatePath("/");
  revalidatePath("/owner/updates");
  revalidatePath(`/owner/updates/${id}`);
  return result;
}

export async function generatePreviewLinkAction(id: string) {
  const { session } = await requireOwner();
  const result = await generatePreviewLink(id, session.user.id);
  revalidatePath(`/owner/updates/${id}`);
  return result;
}
