import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getPublicUpdates() {
  return await db.query.publicUpdates.findMany({
    with: {
      product: true,
      revision: true,
    },
    orderBy: (updates, { asc, desc }) => [asc(updates.sortOrder), desc(updates.createdAt)],
  });
}

export async function getPublicUpdateById(id: string) {
  const update = await db.query.publicUpdates.findFirst({
    where: eq(schema.publicUpdates.id, id),
    with: {
      product: true,
      revision: true,
    },
  });

  if (!update) {
    throw AppError.notFound("Public update not found.");
  }

  return update;
}

export async function getPublicUpdateByPreviewToken(token: string) {
  const update = await db.query.publicUpdates.findFirst({
    where: eq(schema.publicUpdates.previewToken, token),
    with: {
      product: true,
      revision: true,
    },
  });

  if (!update) {
    throw AppError.notFound("Preview link is invalid or has expired.");
  }

  return update;
}

interface UpdateContentInput {
  title: string;
  summary: string;
  statusLabel: string;
  developmentStage?: string;
  productId?: string;
  revisionId?: string;
  sortOrder?: number;
  observation?: string;
  evidenceLevel?: string;
  limitation?: string;
  nextAction?: string;
}

export async function createPublicUpdate(data: UpdateContentInput, userId: string) {
  const [newUpdate] = await db
    .insert(schema.publicUpdates)
    .values({
      title: data.title,
      summary: data.summary,
      statusLabel: data.statusLabel,
      developmentStage: data.developmentStage || null,
      productId: data.productId || null,
      revisionId: data.revisionId || null,
      observation: data.observation || null,
      evidenceLevel: data.evidenceLevel || null,
      limitation: data.limitation || null,
      nextAction: data.nextAction || null,
      publishedState: "draft",
      sortOrder: data.sortOrder ?? 0,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  await logActivity(userId, "update.created", "public_update", newUpdate.id, {
    title: data.title,
  });

  return newUpdate;
}

export async function updatePublicUpdate(id: string, data: UpdateContentInput, userId: string) {
  await getPublicUpdateById(id);

  const [updated] = await db
    .update(schema.publicUpdates)
    .set({
      title: data.title,
      summary: data.summary,
      statusLabel: data.statusLabel,
      developmentStage: data.developmentStage || null,
      productId: data.productId || null,
      revisionId: data.revisionId || null,
      observation: data.observation || null,
      evidenceLevel: data.evidenceLevel || null,
      limitation: data.limitation || null,
      nextAction: data.nextAction || null,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.publicUpdates.id, id))
    .returning();

  await logActivity(userId, "update.updated", "public_update", id, {
    title: data.title,
  });

  return updated;
}

// draft -> internal_review -> approved -> {scheduled|published} -> archived, with
// internal_review->draft and approved->draft as explicit "send back" transitions.
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["internal_review"],
  internal_review: ["approved", "draft"],
  approved: ["scheduled", "published", "draft"],
  scheduled: ["published"],
  published: ["archived"],
  archived: [],
};

export async function transitionPublicUpdate(
  id: string,
  targetStatus: string,
  userId: string,
  scheduledFor?: string
) {
  const update = await getPublicUpdateById(id);
  const currentStatus = update.publishedState;

  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw AppError.invalidState(`Transition from '${currentStatus}' to '${targetStatus}' is prohibited.`);
  }

  if (targetStatus === "scheduled" && !scheduledFor) {
    throw AppError.validationError("A scheduled publish date/time is required.");
  }

  const setValues: Partial<typeof schema.publicUpdates.$inferInsert> = {
    publishedState: targetStatus,
    updatedBy: userId,
    updatedAt: new Date(),
  };

  if (targetStatus === "approved") {
    setValues.approvedBy = userId;
    setValues.approvedAt = new Date();
  }
  if (targetStatus === "scheduled" && scheduledFor) {
    setValues.scheduledFor = new Date(scheduledFor);
  }
  if (targetStatus === "published") {
    setValues.publishedAt = new Date();
    setValues.unpublishedAt = null;
  }
  if (targetStatus === "archived") {
    setValues.unpublishedAt = new Date();
  }
  if (targetStatus === "draft") {
    // Sent back - clear the approval/schedule state so it doesn't carry stale context forward.
    setValues.approvedBy = null;
    setValues.approvedAt = null;
    setValues.scheduledFor = null;
  }

  const [updated] = await db
    .update(schema.publicUpdates)
    .set(setValues)
    .where(eq(schema.publicUpdates.id, id))
    .returning();

  await logActivity(userId, "update.status_transitioned", "public_update", id, {
    from: currentStatus,
    to: targetStatus,
  });

  return updated;
}

// Called by the Vercel Cron route - system-actor transition, no owner userId available.
export async function publishDueScheduledUpdates() {
  const dueUpdates = await db.query.publicUpdates.findMany({
    where: eq(schema.publicUpdates.publishedState, "scheduled"),
  });

  const now = new Date();
  const publishedIds: string[] = [];

  for (const upd of dueUpdates) {
    if (upd.scheduledFor && upd.scheduledFor <= now) {
      await db
        .update(schema.publicUpdates)
        .set({
          publishedState: "published",
          publishedAt: new Date(),
          unpublishedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.publicUpdates.id, upd.id));

      await logActivity(null, "update.status_transitioned", "public_update", upd.id, {
        from: "scheduled",
        to: "published",
        trigger: "cron",
      });

      publishedIds.push(upd.id);
    }
  }

  return publishedIds;
}

export async function generatePreviewLink(id: string, userId: string) {
  await getPublicUpdateById(id);
  const token = crypto.randomUUID();

  const [updated] = await db
    .update(schema.publicUpdates)
    .set({ previewToken: token, updatedAt: new Date() })
    .where(eq(schema.publicUpdates.id, id))
    .returning();

  await logActivity(userId, "update.preview_link_generated", "public_update", id, {});

  return updated;
}
