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

export async function createPublicUpdate(
  data: {
    title: string;
    summary: string;
    statusLabel: string;
    developmentStage?: string;
    productId?: string;
    revisionId?: string;
    publishedState: "draft" | "published" | "archived";
    sortOrder?: number;
  },
  userId: string
) {
  const [newUpdate] = await db
    .insert(schema.publicUpdates)
    .values({
      title: data.title,
      summary: data.summary,
      statusLabel: data.statusLabel,
      developmentStage: data.developmentStage || null,
      productId: data.productId || null,
      revisionId: data.revisionId || null,
      publishedState: data.publishedState,
      sortOrder: data.sortOrder ?? 0,
      publishedAt: data.publishedState === "published" ? new Date() : null,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  await logActivity(userId, "update.created", "public_update", newUpdate.id, {
    title: data.title,
    publishedState: data.publishedState,
  });

  return newUpdate;
}

export async function updatePublicUpdate(
  id: string,
  data: {
    title: string;
    summary: string;
    statusLabel: string;
    developmentStage?: string;
    productId?: string;
    revisionId?: string;
    publishedState: "draft" | "published" | "archived";
    sortOrder?: number;
  },
  userId: string
) {
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
      publishedState: data.publishedState,
      sortOrder: data.sortOrder ?? 0,
      publishedAt: data.publishedState === "published" ? new Date() : null,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.publicUpdates.id, id))
    .returning();

  await logActivity(userId, "update.updated", "public_update", id, {
    title: data.title,
    publishedState: data.publishedState,
  });

  return updated;
}

export async function publishPublicUpdate(id: string, userId: string) {
  await getPublicUpdateById(id);

  const [updated] = await db
    .update(schema.publicUpdates)
    .set({
      publishedState: "published",
      publishedAt: new Date(),
      unpublishedAt: null,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.publicUpdates.id, id))
    .returning();

  await logActivity(userId, "update.published", "public_update", id);

  return updated;
}

export async function archivePublicUpdate(id: string, userId: string) {
  await getPublicUpdateById(id);

  const [updated] = await db
    .update(schema.publicUpdates)
    .set({
      publishedState: "archived",
      unpublishedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.publicUpdates.id, id))
    .returning();

  await logActivity(userId, "update.archived", "public_update", id);

  return updated;
}
