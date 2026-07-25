import "server-only";
import { db } from "@/db";
import * as schema from "@/db/schema";

export async function logActivity(
  actorUserId: string | null,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>
) {
  const [log] = await db
    .insert(schema.activityLogs)
    .values({
      actorUserId,
      action,
      targetType,
      targetId,
      metadataJson: metadata ? JSON.stringify(metadata) : null,
    })
    .returning();
  return log;
}
