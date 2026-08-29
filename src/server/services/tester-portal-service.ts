import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";
import { summarizeAssignmentProgress } from "./assignment-service";

async function getActiveTesterProfile(testerUserId: string) {
  const profile = await db.query.testerProfiles.findFirst({
    where: eq(schema.testerProfiles.userId, testerUserId),
  });

  if (!profile) {
    throw AppError.notFound("Tester profile not found.");
  }

  if (profile.approvalStatus !== "approved") {
    throw AppError.forbidden("Tester profile is deactivated or pending approval.");
  }

  return profile;
}

export async function getTesterAssignments(testerUserId: string) {
  const profile = await getActiveTesterProfile(testerUserId);

  const assignmentsList = await db.query.testingAssignments.findMany({
    where: eq(schema.testingAssignments.testerProfileId, profile.id),
    with: {
      product: true,
      revision: true,
      sample: true,
      playSessions: true,
      evaluations: true,
    },
    orderBy: (asg, { desc }) => [desc(asg.createdAt)],
  });

  // Construct secure DTO to hide all confidential details
  return assignmentsList.map((asg) => ({
    id: asg.id,
    status: asg.status,
    dueAt: asg.dueAt,
    requiredSessionCount: asg.requiredSessionCount,
    instructions: asg.instructions,
    progress: summarizeAssignmentProgress(asg),
    product: {
      publicAlias: asg.product.publicAlias || "Generic Product",
    },
    revision: {
      revisionCode: asg.revision.revisionCode,
    },
    sample: {
      sampleCode: asg.sample.sampleCode,
    },
  }));
}

export async function getTesterAssignmentById(assignmentId: string, testerUserId: string) {
  const profile = await getActiveTesterProfile(testerUserId);

  // Exact IDOR binding query
  const assignment = await db.query.testingAssignments.findFirst({
    where: and(
      eq(schema.testingAssignments.id, assignmentId),
      eq(schema.testingAssignments.testerProfileId, profile.id)
    ),
    with: {
      product: true,
      revision: true,
      sample: true,
      playSessions: true,
      evaluations: true,
    },
  });

  if (!assignment) {
    // Return generic safe not-found error without metadata leakage
    throw AppError.notFound("The requested assignment was not found.");
  }

  return {
    id: assignment.id,
    status: assignment.status,
    dueAt: assignment.dueAt,
    requiredSessionCount: assignment.requiredSessionCount,
    instructions: assignment.instructions,
    sampleConfirmedAt: assignment.sampleConfirmedAt,
    progress: summarizeAssignmentProgress(assignment),
    product: {
      publicAlias: assignment.product.publicAlias || "Generic Product",
    },
    revision: {
      revisionCode: assignment.revision.revisionCode,
    },
    sample: {
      sampleCode: assignment.sample.sampleCode,
    },
  };
}

export async function acknowledgeAssignment(assignmentId: string, testerUserId: string) {
  const profile = await getActiveTesterProfile(testerUserId);

  // Transaction block for safe atomic mutation updates
  return await db.transaction(async (tx) => {
    const assignment = await tx.query.testingAssignments.findFirst({
      where: and(
        eq(schema.testingAssignments.id, assignmentId),
        eq(schema.testingAssignments.testerProfileId, profile.id)
      ),
    });

    if (!assignment) {
      throw AppError.notFound("The requested assignment was not found.");
    }

    if (assignment.status === "acknowledged") {
      return assignment; // Idempotent
    }

    if (assignment.status !== "invited") {
      throw AppError.invalidState(`Assignments in state '${assignment.status}' cannot be acknowledged.`);
    }

    // Check expiration
    if (new Date() > assignment.dueAt) {
      throw AppError.invalidState("Cannot acknowledge an expired assignment.");
    }

    const [updated] = await tx
      .update(schema.testingAssignments)
      .set({
        status: "acknowledged",
        acknowledgedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.testingAssignments.id, assignmentId))
      .returning();

    await logActivity(testerUserId, "assignment.acknowledged", "testing_assignment", assignmentId);

    return updated;
  });
}

// FUNC-06 fix: tester-facing sample confirmation. Distinct from acknowledgeAssignment (which
// acknowledges the brief as a whole) - this verifies the tester actually has the correct
// physical sample in hand by matching the short code printed on its QR label, mirroring the
// normalization used by sample-service's getSampleByShortCode (case-insensitive, trimmed).
export async function confirmAssignmentSample(assignmentId: string, testerUserId: string, enteredShortCode: string) {
  const profile = await getActiveTesterProfile(testerUserId);

  return await db.transaction(async (tx) => {
    const assignment = await tx.query.testingAssignments.findFirst({
      where: and(
        eq(schema.testingAssignments.id, assignmentId),
        eq(schema.testingAssignments.testerProfileId, profile.id)
      ),
      with: { sample: true },
    });

    if (!assignment) {
      throw AppError.notFound("The requested assignment was not found.");
    }

    if (assignment.sampleConfirmedAt) {
      return assignment; // Idempotent
    }

    const normalizedEntered = enteredShortCode.trim().toUpperCase();
    const expectedShortCode = assignment.sample.shortCode?.trim().toUpperCase();

    if (!expectedShortCode || normalizedEntered !== expectedShortCode) {
      throw AppError.invalidState(
        "This code doesn't match the sample on this assignment. Double-check the code printed on your physical sample and try again."
      );
    }

    const [updated] = await tx
      .update(schema.testingAssignments)
      .set({
        sampleConfirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.testingAssignments.id, assignmentId))
      .returning();

    await logActivity(testerUserId, "assignment.sample_confirmed", "testing_assignment", assignmentId);

    return updated;
  });
}
