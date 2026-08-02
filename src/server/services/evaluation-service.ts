import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

// Ownership-scoping pattern proven correct in tester-portal-service.ts's
// getTesterAssignmentById - every write here goes through this guard first, so a tester can
// never act on an assignment (or an evaluation/play session hung off one) that isn't theirs.
async function getOwnedAssignment(assignmentId: string, testerUserId: string) {
  const profile = await db.query.testerProfiles.findFirst({
    where: eq(schema.testerProfiles.userId, testerUserId),
  });
  if (!profile || profile.approvalStatus !== "approved") {
    throw AppError.forbidden("Tester profile is deactivated or pending approval.");
  }

  const assignment = await db.query.testingAssignments.findFirst({
    where: and(
      eq(schema.testingAssignments.id, assignmentId),
      eq(schema.testingAssignments.testerProfileId, profile.id)
    ),
  });
  if (!assignment) {
    throw AppError.notFound("The requested assignment was not found.");
  }

  return assignment;
}

interface PlaySessionInput {
  sessionDate: string;
  durationMinutes?: number;
  conditions?: string;
  referencePaddle?: string;
  notes?: string;
}

export async function createPlaySession(assignmentId: string, data: PlaySessionInput, testerUserId: string) {
  const assignment = await getOwnedAssignment(assignmentId, testerUserId);

  const [session] = await db
    .insert(schema.playSessions)
    .values({
      assignmentId: assignment.id,
      sessionDate: data.sessionDate,
      durationMinutes: data.durationMinutes ?? null,
      conditions: data.conditions || null,
      referencePaddle: data.referencePaddle || null,
      notes: data.notes || null,
      createdBy: testerUserId,
    })
    .returning();

  await logActivity(testerUserId, "play_session.logged", "testing_assignment", assignmentId, {
    sessionDate: data.sessionDate,
  });

  return session;
}

// Progress summary driving the tester UI's entry points (Log Session / First Impression /
// Follow-Up) without exposing anything beyond what the tester already owns.
export async function getEvaluationProgress(assignmentId: string, testerUserId: string) {
  const assignment = await getOwnedAssignment(assignmentId, testerUserId);

  const sessions = await db.query.playSessions.findMany({
    where: eq(schema.playSessions.assignmentId, assignment.id),
    orderBy: (s, { desc }) => [desc(s.sessionDate)],
  });

  const evaluations = await db.query.evaluations.findMany({
    where: eq(schema.evaluations.assignmentId, assignment.id),
  });

  const firstImpression = evaluations.find((e) => e.evaluationType === "first_impression");
  const followUp = evaluations.find((e) => e.evaluationType === "follow_up");

  const sessionCount = sessions.length;
  const firstImpressionSubmitted = !!firstImpression && firstImpression.status !== "draft";
  const followUpUnlocked = firstImpressionSubmitted && sessionCount >= assignment.requiredSessionCount;

  let roundClosed = false;
  if (assignment.roundId) {
    const round = await db.query.testRounds.findFirst({
      where: eq(schema.testRounds.id, assignment.roundId),
    });
    roundClosed = round?.status === "closed";
  }

  return {
    sessions,
    requiredSessionCount: assignment.requiredSessionCount,
    sessionCount,
    firstImpression: firstImpression || null,
    followUp: followUp || null,
    followUpUnlocked,
    roundClosed,
  };
}

export async function getEvaluationById(evaluationId: string, testerUserId: string) {
  const evaluation = await db.query.evaluations.findFirst({
    where: eq(schema.evaluations.id, evaluationId),
  });
  if (!evaluation) {
    throw AppError.notFound("The requested evaluation was not found.");
  }
  // IDOR guard: throws not-found (not forbidden) if the assignment isn't the caller's, matching
  // the safe not-found pattern used across tester-portal-service.ts.
  await getOwnedAssignment(evaluation.assignmentId, testerUserId);
  return evaluation;
}

interface EvaluationDraftInput {
  evaluationType: "first_impression" | "follow_up";
  playTimeMinutes?: number;
  conditions?: string;
  comparisonReference?: string;
  scoreControl?: number;
  scoreStability?: number;
  scoreFeel?: number;
  scoreComfort?: number;
  scoreConsistency?: number;
  scoreOverallPreference?: number;
  scorePower?: number;
  scoreSpin?: number;
  scoreForgiveness?: number;
  scoreManeuverability?: number;
  scoreSound?: number;
  scoreFatigue?: number;
  scoreBuildQuality?: number;
  strengths?: string;
  weaknesses?: string;
  preference?: string;
  confidence?: string;
  issueTriggered?: boolean;
}

function scoreFieldValues(data: EvaluationDraftInput) {
  return {
    playTimeMinutes: data.playTimeMinutes ?? null,
    conditions: data.conditions || null,
    comparisonReference: data.comparisonReference || null,
    scoreControl: data.scoreControl ?? null,
    scoreStability: data.scoreStability ?? null,
    scoreFeel: data.scoreFeel ?? null,
    scoreComfort: data.scoreComfort ?? null,
    scoreConsistency: data.scoreConsistency ?? null,
    scoreOverallPreference: data.scoreOverallPreference ?? null,
    scorePower: data.scorePower ?? null,
    scoreSpin: data.scoreSpin ?? null,
    scoreForgiveness: data.scoreForgiveness ?? null,
    scoreManeuverability: data.scoreManeuverability ?? null,
    scoreSound: data.scoreSound ?? null,
    scoreFatigue: data.scoreFatigue ?? null,
    scoreBuildQuality: data.scoreBuildQuality ?? null,
    strengths: data.strengths || null,
    weaknesses: data.weaknesses || null,
    preference: data.preference || null,
    confidence: data.confidence || null,
    issueTriggered: data.issueTriggered ?? false,
  };
}

// Upsert while status='draft' - autosave support. Never touches a submitted/updated row (those
// are locked; see editSubmittedEvaluation below for the only path that can change them).
export async function createOrUpdateDraftEvaluation(
  assignmentId: string,
  data: EvaluationDraftInput,
  testerUserId: string
) {
  const assignment = await getOwnedAssignment(assignmentId, testerUserId);

  if (data.evaluationType === "follow_up") {
    const progress = await getEvaluationProgress(assignmentId, testerUserId);
    if (!progress.followUpUnlocked) {
      throw AppError.invalidState(
        `Follow-Up evaluation is locked until the First Impression is submitted and at least ${assignment.requiredSessionCount} play session(s) are logged.`
      );
    }
  }

  const existingDraft = await db.query.evaluations.findFirst({
    where: and(
      eq(schema.evaluations.assignmentId, assignment.id),
      eq(schema.evaluations.evaluationType, data.evaluationType),
      eq(schema.evaluations.status, "draft")
    ),
  });

  if (existingDraft) {
    const [updated] = await db
      .update(schema.evaluations)
      .set({
        ...scoreFieldValues(data),
        lastSavedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.evaluations.id, existingDraft.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(schema.evaluations)
    .values({
      assignmentId: assignment.id,
      sampleId: assignment.sampleId,
      revisionId: assignment.revisionId,
      roundId: assignment.roundId,
      evaluationType: data.evaluationType,
      ...scoreFieldValues(data),
      status: "draft",
      lastSavedAt: new Date(),
      createdBy: testerUserId,
    })
    .returning();

  return created;
}

export async function submitEvaluation(evaluationId: string, testerUserId: string) {
  const evaluation = await getEvaluationById(evaluationId, testerUserId);

  if (evaluation.status !== "draft") {
    throw AppError.invalidState("This evaluation has already been submitted.");
  }

  const [updated] = await db
    .update(schema.evaluations)
    .set({
      status: "submitted",
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.evaluations.id, evaluationId))
    .returning();

  await logActivity(testerUserId, "evaluation.submitted", "evaluation", evaluationId, {
    evaluationType: evaluation.evaluationType,
    issueTriggered: evaluation.issueTriggered,
  });

  return updated;
}

// The only path that can change a submitted evaluation. assignmentId/sampleId/revisionId are
// never part of this update - they are immutable once the row exists. Only works while the
// parent round is not 'closed'.
export async function editSubmittedEvaluation(
  evaluationId: string,
  data: EvaluationDraftInput,
  testerUserId: string
) {
  const evaluation = await getEvaluationById(evaluationId, testerUserId);

  if (evaluation.status === "draft") {
    throw AppError.invalidState("Use the draft autosave path for an evaluation that has not been submitted yet.");
  }

  if (evaluation.roundId) {
    const round = await db.query.testRounds.findFirst({
      where: eq(schema.testRounds.id, evaluation.roundId),
    });
    if (round && round.status === "closed") {
      throw AppError.invalidState("This round is closed; the evaluation can no longer be edited.");
    }
  }

  const [updated] = await db
    .update(schema.evaluations)
    .set({
      ...scoreFieldValues(data),
      status: "updated",
      updatedAt: new Date(),
    })
    .where(eq(schema.evaluations.id, evaluationId))
    .returning();

  await logActivity(testerUserId, "evaluation.corrected", "evaluation", evaluationId, {
    evaluationType: evaluation.evaluationType,
  });

  return updated;
}

// Owner-side review, scoped by round.
export async function getEvaluationsByRound(roundId: string) {
  return await db.query.evaluations.findMany({
    where: eq(schema.evaluations.roundId, roundId),
    with: {
      sample: true,
      assignment: { with: { testerProfile: true } },
    },
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  });
}

export async function getEvaluationDetailForOwner(evaluationId: string) {
  const evaluation = await db.query.evaluations.findFirst({
    where: eq(schema.evaluations.id, evaluationId),
    with: {
      sample: true,
      revision: { with: { product: true } },
      assignment: { with: { testerProfile: true } },
    },
  });
  if (!evaluation) {
    throw AppError.notFound("Evaluation not found.");
  }
  return evaluation;
}
