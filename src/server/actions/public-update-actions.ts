"use server";

import { requireOwner } from "@/lib/permissions";
import {
  createPublicUpdate,
  updatePublicUpdate,
  publishPublicUpdate,
  archivePublicUpdate,
} from "../services/public-update-service";
import { createPublicUpdateSchema } from "@/lib/validation/schemas";
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

export async function publishPublicUpdateAction(id: string) {
  const { session } = await requireOwner();
  const result = await publishPublicUpdate(id, session.user.id);
  revalidatePath("/");
  revalidatePath("/owner/updates");
  revalidatePath(`/owner/updates/${id}`);
  return result;
}

export async function archivePublicUpdateAction(id: string) {
  const { session } = await requireOwner();
  const result = await archivePublicUpdate(id, session.user.id);
  revalidatePath("/");
  revalidatePath("/owner/updates");
  revalidatePath(`/owner/updates/${id}`);
  return result;
}
