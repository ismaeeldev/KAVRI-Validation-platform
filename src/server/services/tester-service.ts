import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getTesters() {
  return await db.query.testerProfiles.findMany({
    orderBy: (testers, { desc }) => [desc(testers.createdAt)],
  });
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

export async function createPendingTester(
  data: {
    name: string;
    email: string;
  },
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
    })
    .returning();

  await logActivity(userId, "tester.created", "tester_profile", newTester.id, {
    emailNormalized,
    approvalStatus: "pending",
  });

  return newTester;
}

export async function updateTesterApproval(
  id: string,
  approvalStatus: "approved" | "deactivated",
  userId: string
) {
  const tester = await getTesterById(id);

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
