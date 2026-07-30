import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";
import { PHOTO_ENTITY_TYPE } from "@/lib/constants";

export async function getAttachments(entityType: string, entityId: string) {
  return await db.query.photoAttachments.findMany({
    where: and(eq(schema.photoAttachments.entityType, entityType), eq(schema.photoAttachments.entityId, entityId)),
    orderBy: (a, { desc }) => [desc(a.uploadedAt)],
  });
}

// Owner may attach a photo to any sample/issue. A tester may only attach to a sample that is
// currently on one of their own testing assignments - never a sample they have no relationship
// to. Issue Reports (Step 8) will extend this the same way once assignmentId exists on issues.
export async function authorizePhotoAttachment(
  entityType: string,
  entityId: string,
  userId: string,
  role: "owner" | "tester"
) {
  if (role === "owner") return;

  if (entityType === PHOTO_ENTITY_TYPE.SAMPLE) {
    const assignment = await db.query.testingAssignments.findFirst({
      where: and(eq(schema.testingAssignments.sampleId, entityId), eq(schema.testingAssignments.testerUserId, userId)),
    });
    if (!assignment) {
      throw AppError.forbidden("You do not have an active assignment for this sample.");
    }
    return;
  }

  // Unknown entity type for a tester (e.g. future issue_report support) - deny by default.
  throw AppError.forbidden("You are not authorized to attach photos to this record.");
}

export async function recordAttachment(
  entityType: string,
  entityId: string,
  storageUrl: string,
  userId: string,
  caption?: string
) {
  const [attachment] = await db
    .insert(schema.photoAttachments)
    .values({
      entityType,
      entityId,
      storageUrl,
      uploadedBy: userId,
      caption: caption || null,
    })
    .returning();

  await logActivity(userId, "attachment.uploaded", entityType, entityId, { attachmentId: attachment.id });

  return attachment;
}
