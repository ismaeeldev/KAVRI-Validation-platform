import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getAssignments() {
  return await db.query.testingAssignments.findMany({
    with: {
      testerProfile: true,
      product: true,
      revision: true,
      sample: true,
    },
    orderBy: (assignments, { desc }) => [desc(assignments.createdAt)],
  });
}

export async function getAssignmentById(id: string) {
  const assignment = await db.query.testingAssignments.findFirst({
    where: eq(schema.testingAssignments.id, id),
    with: {
      testerProfile: true,
      product: true,
      revision: true,
      sample: true,
    },
  });

  if (!assignment) {
    throw AppError.notFound("Testing assignment not found.");
  }

  return assignment;
}

export async function createAssignment(
  data: {
    testerProfileId: string;
    sampleId: string;
    instructions: string;
    dueAt: string;
    requiredSessionCount: number;
  },
  userId: string
) {
  return await db.transaction(async (tx) => {
    // 1. Verify tester profile is approved
    const tester = await tx.query.testerProfiles.findFirst({
      where: eq(schema.testerProfiles.id, data.testerProfileId),
    });
    if (!tester) {
      throw AppError.notFound("Tester profile not found.");
    }
    if (tester.approvalStatus !== "approved") {
      throw AppError.invalidState("Assignments can only be drafted for approved testers.");
    }

    // 2. Verify physical sample status is ready_for_testing
    const sample = await tx.query.physicalSamples.findFirst({
      where: eq(schema.physicalSamples.id, data.sampleId),
    });
    if (!sample) {
      throw AppError.notFound("Physical sample not found.");
    }
    if (sample.status !== "ready_for_testing") {
      throw AppError.invalidState("Assignments can only link samples marked ready_for_testing.");
    }

    // 3. Derive product and revision context from sample
    const productId = sample.productId;
    const revisionId = sample.revisionId;

    const [newAssignment] = await tx
      .insert(schema.testingAssignments)
      .values({
        testerProfileId: data.testerProfileId,
        testerUserId: tester.userId || null, // Might be null if invite not accepted yet
        productId,
        revisionId,
        sampleId: data.sampleId,
        instructions: data.instructions,
        dueAt: new Date(data.dueAt),
        requiredSessionCount: data.requiredSessionCount,
        status: "draft",
        createdBy: userId,
      })
      .returning();

    await logActivity(userId, "assignment.drafted", "testing_assignment", newAssignment.id, {
      sampleCode: sample.sampleCode,
      testerName: tester.displayName,
    });

    return newAssignment;
  });
}

export async function activateAssignment(id: string, userId: string) {
  return await db.transaction(async (tx) => {
    const assignment = await getAssignmentById(id);

    if (assignment.status !== "draft") {
      throw AppError.invalidState("Only drafted assignments can be activated.");
    }

    // Re-verify tester approval status and linked account
    const tester = await tx.query.testerProfiles.findFirst({
      where: eq(schema.testerProfiles.id, assignment.testerProfileId),
    });
    if (!tester || tester.approvalStatus !== "approved" || !tester.userId) {
      throw AppError.invalidState(
        "Tester account must be approved and fully onboarded (accepted invite) before activation."
      );
    }

    // Re-verify sample readiness status
    const sample = await tx.query.physicalSamples.findFirst({
      where: eq(schema.physicalSamples.id, assignment.sampleId),
    });
    if (!sample || sample.status !== "ready_for_testing") {
      throw AppError.invalidState("Physical sample must remain ready_for_testing.");
    }

    const [updated] = await tx
      .update(schema.testingAssignments)
      .set({
        status: "active",
        testerUserId: tester.userId, // Ensure sync
        activatedAt: new Date(),
        activatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(schema.testingAssignments.id, id))
      .returning();

    await logActivity(userId, "assignment.activated", "testing_assignment", id);

    return updated;
  });
}

export async function revokeAssignment(id: string, reason: string, userId: string) {
  const assignment = await getAssignmentById(id);

  if (assignment.status === "revoked") {
    return assignment; // Idempotent
  }

  const [updated] = await db
    .update(schema.testingAssignments)
    .set({
      status: "revoked",
      revokedAt: new Date(),
      revokedBy: userId,
      revocationReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(schema.testingAssignments.id, id))
    .returning();

  await logActivity(userId, "assignment.revoked", "testing_assignment", id, {
    reason,
  });

  return updated;
}
