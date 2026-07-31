import "server-only";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";
import { transitionSampleStatus } from "./sample-service";

export async function getAssignments() {
  return await db.query.testingAssignments.findMany({
    with: {
      testerProfile: true,
      product: true,
      revision: true,
      sample: true,
      round: true,
      playSessions: true,
      evaluations: true,
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
      round: true,
      playSessions: true,
      evaluations: true,
    },
  });

  if (!assignment) {
    throw AppError.notFound("Testing assignment not found.");
  }

  return assignment;
}

// Computed (display-only, never stored) progress status - layers on top of the stored
// 'acknowledged' state only. draft/invited/revoked/expired are shown as their stored value
// as-is. Matches the audit's exact Complete criterion: "Required evaluations submitted; sample
// disposition recorded" - both evaluations done is NOT enough on its own.
export function getAssignmentComputedStatus(input: {
  status: string;
  requiredSessionCount: number;
  sessionCount: number;
  firstImpressionSubmitted: boolean;
  followUpSubmitted: boolean;
  sampleStatus: string;
}): { label: string; subLabel?: string } {
  if (input.status !== "acknowledged") {
    return { label: input.status };
  }

  if (!input.firstImpressionSubmitted) {
    return { label: "first_impression_due" };
  }

  if (input.sessionCount < input.requiredSessionCount) {
    return { label: "active" };
  }

  if (!input.followUpSubmitted) {
    return { label: "follow_up_due" };
  }

  if (input.sampleStatus === "returned" || input.sampleStatus === "retired") {
    return { label: "complete" };
  }

  // Both evaluations are in, but disposition hasn't been recorded yet.
  return { label: "follow_up_due", subLabel: "awaiting_sample_return" };
}

// Displayed ALONGSIDE the lifecycle/computed status (per audit rule), never replacing it.
export function isAssignmentOverdue(input: { dueAt: Date; status: string; computedLabel: string }): boolean {
  return (
    input.dueAt.getTime() < Date.now() &&
    input.status !== "revoked" &&
    input.status !== "expired" &&
    input.computedLabel !== "complete"
  );
}

export function summarizeAssignmentProgress(assignment: {
  status: string;
  requiredSessionCount: number;
  dueAt: Date;
  sample: { status: string };
  playSessions: { id: string }[];
  evaluations: { evaluationType: string; status: string }[];
}) {
  const firstImpression = assignment.evaluations.find((e) => e.evaluationType === "first_impression");
  const followUp = assignment.evaluations.find((e) => e.evaluationType === "follow_up");
  const firstImpressionSubmitted = !!firstImpression && firstImpression.status !== "draft";
  const followUpSubmitted = !!followUp && followUp.status !== "draft";

  const computed = getAssignmentComputedStatus({
    status: assignment.status,
    requiredSessionCount: assignment.requiredSessionCount,
    sessionCount: assignment.playSessions.length,
    firstImpressionSubmitted,
    followUpSubmitted,
    sampleStatus: assignment.sample.status,
  });

  const overdue = isAssignmentOverdue({
    dueAt: assignment.dueAt,
    status: assignment.status,
    computedLabel: computed.label,
  });

  return {
    ...computed,
    overdue,
    sessionCount: assignment.playSessions.length,
    firstImpressionSubmitted,
    followUpSubmitted,
  };
}

// Warns rather than blocks (per audit). `queryable` defaults to `db` for the standalone
// pre-submit check action; createAssignment passes the active transaction so the check reads
// consistently with the insert that follows it.
export async function checkAssignmentConflicts(
  testerProfileId: string,
  sampleId: string,
  roundId: string,
  queryable: typeof db = db
) {
  const warnings: string[] = [];

  const sampleConflict = await queryable.query.testingAssignments.findFirst({
    where: and(
      eq(schema.testingAssignments.sampleId, sampleId),
      inArray(schema.testingAssignments.status, ["draft", "invited", "acknowledged"])
    ),
  });
  if (sampleConflict) {
    warnings.push("This sample already has a non-terminal assignment (draft, invited, or acknowledged).");
  }

  const round = await queryable.query.testRounds.findFirst({ where: eq(schema.testRounds.id, roundId) });
  if (round?.startAt && round?.endAt) {
    const testerAssignments = await queryable.query.testingAssignments.findMany({
      where: and(
        eq(schema.testingAssignments.testerProfileId, testerProfileId),
        inArray(schema.testingAssignments.status, ["invited", "acknowledged"])
      ),
      with: { round: true },
    });
    const overlap = testerAssignments.find((a) => {
      if (!a.round?.startAt || !a.round?.endAt) return false;
      return a.round.startAt <= round.endAt! && a.round.endAt >= round.startAt!;
    });
    if (overlap) {
      warnings.push(`This tester already has an overlapping assignment in round '${overlap.round!.roundCode}'.`);
    }
  }

  return warnings;
}

export async function createAssignment(
  data: {
    roundId: string;
    testerProfileId: string;
    sampleId: string;
    instructions: string;
    dueAt: string;
    requiredSessionCount: number;
    forceAssign?: boolean;
  },
  userId: string
) {
  return await db.transaction(async (tx) => {
    const tester = await tx.query.testerProfiles.findFirst({
      where: eq(schema.testerProfiles.id, data.testerProfileId),
    });
    if (!tester) {
      throw AppError.notFound("Tester profile not found.");
    }
    if (tester.approvalStatus !== "approved") {
      throw AppError.invalidState("Assignments can only be drafted for approved testers.");
    }

    const sample = await tx.query.physicalSamples.findFirst({
      where: eq(schema.physicalSamples.id, data.sampleId),
    });
    if (!sample) {
      throw AppError.notFound("Physical sample not found.");
    }
    if (sample.status !== "ready_for_testing") {
      throw AppError.invalidState("Assignments can only link samples marked ready_for_testing.");
    }

    const round = await tx.query.testRounds.findFirst({ where: eq(schema.testRounds.id, data.roundId) });
    if (!round) {
      throw AppError.notFound("Test round not found.");
    }

    const revisionLink = await tx.query.testRoundRevisions.findFirst({
      where: and(
        eq(schema.testRoundRevisions.roundId, data.roundId),
        eq(schema.testRoundRevisions.revisionId, sample.revisionId)
      ),
    });
    if (!revisionLink) {
      throw AppError.invalidState(
        "The selected sample's revision is not linked to the chosen round. Link it from the round detail page first."
      );
    }

    if (!data.forceAssign) {
      const warnings = await checkAssignmentConflicts(data.testerProfileId, data.sampleId, data.roundId, tx as unknown as typeof db);
      if (warnings.length > 0) {
        throw AppError.conflict(warnings.join(" "));
      }
    }

    const [newAssignment] = await tx
      .insert(schema.testingAssignments)
      .values({
        roundId: data.roundId,
        testerProfileId: data.testerProfileId,
        testerUserId: tester.userId || null, // Might be null if invite not accepted yet
        productId: sample.productId,
        revisionId: sample.revisionId,
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
      roundCode: round.roundCode,
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
        status: "invited",
        testerUserId: tester.userId, // Ensure sync
        activatedAt: new Date(),
        activatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(schema.testingAssignments.id, id))
      .returning();

    await logActivity(userId, "assignment.invited", "testing_assignment", id);

    return updated;
  }).then(async (updated) => {
    // Sample transitions to 'assigned' now that it's actually out for testing - the trigger
    // point Step 4 deferred to this step. Runs outside the assignment transaction since
    // transitionSampleStatus manages its own write and activity log.
    await transitionSampleStatus(updated.sampleId, "assigned", "Assignment invited; sample dispatched to tester.", userId);
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

// Terminal state for assignments past due with no meaningful activity. Only reachable from
// draft/invited - once a tester has acknowledged (or the assignment is complete), it can no
// longer be marked expired.
export async function expireAssignment(id: string, userId: string) {
  const assignment = await getAssignmentById(id);

  if (assignment.status !== "draft" && assignment.status !== "invited") {
    throw AppError.invalidState(
      `Assignments in state '${assignment.status}' cannot be marked expired.`
    );
  }

  const [updated] = await db
    .update(schema.testingAssignments)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(eq(schema.testingAssignments.id, id))
    .returning();

  await logActivity(userId, "assignment.expired", "testing_assignment", id);

  return updated;
}

// Logs that a reminder was sent - does NOT send an actual email (deferred, requires the email
// service from M4; see Section 6 / P3-03 of the audit). The UI label makes this explicit
// ("Log Reminder") to avoid implying an email went out.
export async function logAssignmentReminder(id: string, userId: string) {
  await getAssignmentById(id); // validates existence, throws AppError.notFound otherwise

  const [updated] = await db
    .update(schema.testingAssignments)
    .set({
      lastReminderAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.testingAssignments.id, id))
    .returning();

  await logActivity(userId, "assignment.reminder_sent", "testing_assignment", id);

  return updated;
}
