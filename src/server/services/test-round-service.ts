import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

interface RequiredForms {
  firstImpression: boolean;
  followUp: boolean;
  issueReport: boolean;
}

function encodeRequiredForms(forms: RequiredForms): string {
  return JSON.stringify(forms);
}

export function decodeRequiredForms(requiredForms: string): RequiredForms {
  try {
    return JSON.parse(requiredForms) as RequiredForms;
  } catch {
    return { firstImpression: true, followUp: true, issueReport: false };
  }
}

export async function getRounds() {
  return await db.query.testRounds.findMany({
    with: {
      roundRevisions: { with: { revision: { with: { product: true } } } },
    },
    orderBy: (rounds, { desc }) => [desc(rounds.createdAt)],
  });
}

export async function getRoundById(id: string) {
  const round = await db.query.testRounds.findFirst({
    where: eq(schema.testRounds.id, id),
    with: {
      roundRevisions: { with: { revision: { with: { product: true } } } },
      assignments: { with: { testerProfile: true, sample: true } },
    },
  });

  if (!round) {
    throw AppError.notFound("Test round not found.");
  }

  return round;
}

interface CreateRoundInput {
  roundName: string;
  roundCode: string;
  purpose: string;
  startAt?: string;
  endAt?: string;
  instructions: string;
  requiredSessionCount: number;
  requiredFormFirstImpression: boolean;
  requiredFormFollowUp: boolean;
  requiredFormIssueReport: boolean;
  publicSummary?: string;
  revisionIds?: string[];
}

export async function createRound(data: CreateRoundInput, userId: string) {
  const existingCode = await db.query.testRounds.findFirst({
    where: eq(schema.testRounds.roundCode, data.roundCode),
  });
  if (existingCode) {
    throw AppError.conflict(`Round code '${data.roundCode}' is already allocated.`);
  }

  return await db.transaction(async (tx) => {
    const [newRound] = await tx
      .insert(schema.testRounds)
      .values({
        roundName: data.roundName,
        roundCode: data.roundCode,
        purpose: data.purpose,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        instructions: data.instructions,
        requiredSessionCount: data.requiredSessionCount,
        requiredForms: encodeRequiredForms({
          firstImpression: data.requiredFormFirstImpression,
          followUp: data.requiredFormFollowUp,
          issueReport: data.requiredFormIssueReport,
        }),
        publicSummary: data.publicSummary || null,
        status: "draft",
        createdBy: userId,
      })
      .returning();

    for (const revisionId of data.revisionIds || []) {
      await tx.insert(schema.testRoundRevisions).values({
        roundId: newRound.id,
        revisionId,
      });
    }

    await logActivity(userId, "round.created", "test_round", newRound.id, {
      roundCode: data.roundCode,
      revisionCount: (data.revisionIds || []).length,
    });

    return newRound;
  });
}

interface UpdateRoundInput {
  roundName: string;
  purpose: string;
  startAt?: string;
  endAt?: string;
  instructions: string;
  requiredSessionCount: number;
  requiredFormFirstImpression: boolean;
  requiredFormFollowUp: boolean;
  requiredFormIssueReport: boolean;
  publicSummary?: string;
}

export async function updateRound(id: string, data: UpdateRoundInput, userId: string) {
  await getRoundById(id);

  const [updated] = await db
    .update(schema.testRounds)
    .set({
      roundName: data.roundName,
      purpose: data.purpose,
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null,
      instructions: data.instructions,
      requiredSessionCount: data.requiredSessionCount,
      requiredForms: encodeRequiredForms({
        firstImpression: data.requiredFormFirstImpression,
        followUp: data.requiredFormFollowUp,
        issueReport: data.requiredFormIssueReport,
      }),
      publicSummary: data.publicSummary || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.testRounds.id, id))
    .returning();

  await logActivity(userId, "round.updated", "test_round", id, {});

  return updated;
}

export async function addRevisionToRound(roundId: string, revisionId: string, userId: string) {
  await getRoundById(roundId);

  const existing = await db.query.testRoundRevisions.findFirst({
    where: and(
      eq(schema.testRoundRevisions.roundId, roundId),
      eq(schema.testRoundRevisions.revisionId, revisionId)
    ),
  });
  if (existing) {
    return existing;
  }

  const [link] = await db
    .insert(schema.testRoundRevisions)
    .values({ roundId, revisionId })
    .returning();

  await logActivity(userId, "round.revision_linked", "test_round", roundId, { revisionId });

  return link;
}

export async function removeRevisionFromRound(roundId: string, revisionId: string, userId: string) {
  await db
    .delete(schema.testRoundRevisions)
    .where(
      and(
        eq(schema.testRoundRevisions.roundId, roundId),
        eq(schema.testRoundRevisions.revisionId, revisionId)
      )
    );

  await logActivity(userId, "round.revision_unlinked", "test_round", roundId, { revisionId });
}

// Centralized state machine, mirroring sample-service.ts's VALID_TRANSITIONS pattern.
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["recruiting"],
  recruiting: ["active"],
  active: ["review"],
  review: ["closed"],
  closed: [], // Terminal state
};

export async function transitionRoundStatus(roundId: string, targetStatus: string, userId: string) {
  const round = await getRoundById(roundId);
  const currentStatus = round.status;

  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw AppError.invalidState(
      `Transition from '${currentStatus}' to '${targetStatus}' is prohibited.`
    );
  }

  // Closeout Decision is required to close a round (audit rule), even though the Closeout
  // Decisions entity itself ships in Step 9. TODO(Step 9): once closeoutDecisions exists,
  // this check remains valid as-is since closeoutDecisionId is already the correct field.
  if (targetStatus === "closed" && !round.closeoutDecisionId) {
    throw AppError.invalidState(
      "Closeout Decision required: this round cannot be closed until a closeout decision has been recorded."
    );
  }

  const [updated] = await db
    .update(schema.testRounds)
    .set({
      status: targetStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.testRounds.id, roundId))
    .returning();

  await logActivity(userId, "round.status_transitioned", "test_round", roundId, {
    from: currentStatus,
    to: targetStatus,
  });

  return updated;
}
