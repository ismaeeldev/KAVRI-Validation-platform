"use server";

import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/permissions";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { authorizePhotoAttachment, recordAttachment, getAttachments } from "../services/attachment-service";
import { revalidatePath } from "next/cache";

// Uploads a photo for a sample (Step 4) or issue report (Step 8). Requires
// BLOB_READ_WRITE_TOKEN to be configured (Vercel Blob) - fails loudly, never silently
// no-ops, if the storage service hasn't been provisioned yet (see sprint1_rev.md M3).
export async function uploadPhotoAction(entityType: string, entityId: string, formData: FormData) {
  const session = await requireSession();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, session.user.id),
  });
  if (!profile || profile.accountStatus !== "active") {
    throw AppError.forbidden();
  }

  await authorizePhotoAttachment(entityType, entityId, session.user.id, profile.role as "owner" | "tester");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw AppError.invalidState("No file was provided.");
  }
  if (!file.type.startsWith("image/")) {
    throw AppError.invalidState("Only image files may be uploaded.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw AppError.invalidState(
      "Photo storage is not yet configured on this deployment (BLOB_READ_WRITE_TOKEN missing). Contact the developer to finish provisioning file storage."
    );
  }

  // access: "private" so the blob is not reachable via a guessable public URL - it can only be
  // read back through the authenticated proxy route at /api/attachments/[id], which re-runs the
  // same authorizePhotoAttachment check performed here.
  const { put } = await import("@vercel/blob");
  const blob = await put(`${entityType}/${entityId}/${Date.now()}-${file.name}`, file, {
    access: "private",
    addRandomSuffix: true,
  });

  const attachment = await recordAttachment(entityType, entityId, blob.url, session.user.id);

  if (entityType === "sample") {
    revalidatePath(`/owner/samples/${entityId}`);
  }
  if (entityType === "issue_report") {
    revalidatePath(`/owner/issues/${entityId}`);
  }

  return attachment;
}

export async function getAttachmentsAction(entityType: string, entityId: string) {
  const session = await requireSession();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, session.user.id),
  });
  if (!profile || profile.accountStatus !== "active") {
    throw AppError.forbidden();
  }

  // Same ownership check as upload - a tester must not be able to list another tester's
  // sample/issue attachments just by knowing or guessing the entityId.
  await authorizePhotoAttachment(entityType, entityId, session.user.id, profile.role as "owner" | "tester");

  return await getAttachments(entityType, entityId);
}
