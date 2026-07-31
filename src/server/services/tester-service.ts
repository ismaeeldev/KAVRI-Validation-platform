import "server-only";
import { eq, and, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getTesters() {
  const testers = await db.query.testerProfiles.findMany({
    orderBy: (testers, { desc }) => [desc(testers.createdAt)],
  });

  if (testers.length === 0) return [];
  const testerProfileIds = testers.map((t) => t.id);

  // Active assignment counts (draft/invited/acknowledged = not yet concluded).
  const assignmentCounts = await db
    .select({
      testerProfileId: schema.testingAssignments.testerProfileId,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(schema.testingAssignments)
    .where(
      and(
        inArray(schema.testingAssignments.testerProfileId, testerProfileIds),
        inArray(schema.testingAssignments.status, ["draft", "invited", "acknowledged"])
      )
    )
    .groupBy(schema.testingAssignments.testerProfileId);
  const countsByTester = new Map(assignmentCounts.map((r) => [r.testerProfileId, r.count]));

  // Most recent activity per tester (human-readable relative time computed client/UI-side).
  const recentActivity = await db
    .select({
      targetId: schema.activityLogs.targetId,
      createdAt: sql<Date>`max(${schema.activityLogs.createdAt})`,
    })
    .from(schema.activityLogs)
    .where(and(eq(schema.activityLogs.targetType, "tester_profile"), inArray(schema.activityLogs.targetId, testerProfileIds)))
    .groupBy(schema.activityLogs.targetId);
  const lastActivityByTester = new Map(recentActivity.map((r) => [r.targetId, r.createdAt]));

  return testers.map((t) => ({
    ...t,
    activeAssignmentCount: countsByTester.get(t.id) ?? 0,
    lastActivityAt: lastActivityByTester.get(t.id) ?? null,
  }));
}

export async function getTesterById(id: string) {
  const tester = await db.query.testerProfiles.findFirst({
    where: eq(schema.testerProfiles.id, id),
    with: {
      invitations: true,
    },
  });

  if (!tester) {
    throw AppError.notFound("Tester profile not found.");
  }

  return tester;
}

interface TesterProfileFields {
  skillLevel?: string;
  playingFrequency?: string;
  currentPaddle?: string;
  playStyle?: string[];
  preferenceControlPower?: string;
  preferencePop?: string;
  preferenceFeel?: string;
  preferenceHandle?: string;
  dominantHand?: string;
  singlesDoublesPreference?: string;
}

function profileFieldValues(data: TesterProfileFields) {
  return {
    skillLevel: data.skillLevel || null,
    playingFrequency: data.playingFrequency || null,
    currentPaddle: data.currentPaddle || null,
    playStyle: data.playStyle && data.playStyle.length > 0 ? data.playStyle.join(",") : null,
    preferenceControlPower: data.preferenceControlPower || null,
    preferencePop: data.preferencePop || null,
    preferenceFeel: data.preferenceFeel || null,
    preferenceHandle: data.preferenceHandle || null,
    dominantHand: data.dominantHand || null,
    singlesDoublesPreference: data.singlesDoublesPreference || null,
  };
}

export async function createPendingTester(
  data: {
    name: string;
    email: string;
  } & TesterProfileFields,
  userId: string
) {
  const emailNormalized = data.email.trim().toLowerCase();

  // Check duplicate tester profile email
  const existing = await db.query.testerProfiles.findFirst({
    where: eq(schema.testerProfiles.emailNormalized, emailNormalized),
  });
  if (existing) {
    throw AppError.conflict(`A tester profile with email '${emailNormalized}' already exists.`);
  }

  const [newTester] = await db
    .insert(schema.testerProfiles)
    .values({
      displayName: data.name,
      emailNormalized,
      approvalStatus: "pending",
      ...profileFieldValues(data),
    })
    .returning();

  await logActivity(userId, "tester.created", "tester_profile", newTester.id, {
    emailNormalized,
    approvalStatus: "pending",
  });

  return newTester;
}

export async function updateTesterProfile(id: string, data: TesterProfileFields, userId: string) {
  await getTesterById(id);

  const [updated] = await db
    .update(schema.testerProfiles)
    .set({
      ...profileFieldValues(data),
      updatedAt: new Date(),
    })
    .where(eq(schema.testerProfiles.id, id))
    .returning();

  await logActivity(userId, "tester.profile_updated", "tester_profile", id, {});

  return updated;
}

export async function updateTesterApproval(
  id: string,
  approvalStatus: "approved" | "deactivated",
  userId: string
) {
  const tester = await getTesterById(id);

  if (approvalStatus === "deactivated" && tester.approvalStatus !== "approved") {
    throw AppError.invalidState("Only an approved tester can be deactivated.");
  }

  const [updatedTester] = await db
    .update(schema.testerProfiles)
    .set({
      approvalStatus,
      approvedAt: approvalStatus === "approved" ? new Date() : tester.approvedAt,
      approvedBy: approvalStatus === "approved" ? userId : tester.approvedBy,
      deactivatedAt: approvalStatus === "deactivated" ? new Date() : tester.deactivatedAt,
      deactivatedBy: approvalStatus === "deactivated" ? userId : tester.deactivatedBy,
      updatedAt: new Date(),
    })
    .where(eq(schema.testerProfiles.id, id))
    .returning();

  await logActivity(userId, `tester.${approvalStatus}`, "tester_profile", id);

  return updatedTester;
}

// Distinct from Deactivate: only available while a tester is still 'pending' (i.e. never
// approved). Deactivate only applies to already-approved testers (see updateTesterApproval's
// guard above).
export async function declineTester(id: string, reason: string, userId: string) {
  const tester = await getTesterById(id);

  if (tester.approvalStatus !== "pending") {
    throw AppError.invalidState("Only a pending tester application can be declined.");
  }

  const [updated] = await db
    .update(schema.testerProfiles)
    .set({
      approvalStatus: "declined",
      declinedAt: new Date(),
      declinedBy: userId,
      declinedReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(schema.testerProfiles.id, id))
    .returning();

  await logActivity(userId, "tester.declined", "tester_profile", id, { reason });

  return updated;
}
