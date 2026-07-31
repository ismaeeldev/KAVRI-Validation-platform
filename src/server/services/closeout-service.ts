import "server-only";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";
import { LIMITATIONS_REQUIRED_EVIDENCE_STRENGTHS } from "@/lib/constants";

interface EvidenceLinkInput {
  evidenceType: string;
  evidenceId: string;
}

interface CreateCloseoutInput {
  scope: string;
  scopeId: string;
  decision: string;
  evidenceStrength?: string;
  decisionSummary: string;
  limitations?: string;
  openQuestions?: string;
  nextAction: string;
  publicVersion?: string;
  evidenceLinks?: EvidenceLinkInput[];
}

export async function createCloseoutDecision(data: CreateCloseoutInput, userId: string) {
  // Defense-in-depth: re-check the limitations requirement at the service layer, same pattern
  // used for Step 8's still-playable guard, in case a caller bypasses the zod schema.
  const limitationsRequired =
    data.decision === "gather_more_evidence" ||
    (!!data.evidenceStrength && LIMITATIONS_REQUIRED_EVIDENCE_STRENGTHS.has(data.evidenceStrength));
  if (limitationsRequired && !data.limitations) {
    throw AppError.validationError(
      "Limitations are required when evidence is directional/incomplete or the decision is 'gather more evidence'."
    );
  }

  let round: Awaited<ReturnType<typeof db.query.testRounds.findFirst>> | undefined;
  if (data.scope === "round") {
    round = await db.query.testRounds.findFirst({ where: eq(schema.testRounds.id, data.scopeId) });
    if (!round) {
      throw AppError.notFound("Test round not found.");
    }
    if (round.status !== "review") {
      throw AppError.invalidState("A round can only be closed with a decision while it is in 'review' status.");
    }
  } else if (data.scope === "revision") {
    const revision = await db.query.productRevisions.findFirst({ where: eq(schema.productRevisions.id, data.scopeId) });
    if (!revision) {
      throw AppError.notFound("Product revision not found.");
    }
  } else if (data.scope === "product") {
    const product = await db.query.products.findFirst({ where: eq(schema.products.id, data.scopeId) });
    if (!product) {
      throw AppError.notFound("Product not found.");
    }
  }

  return await db.transaction(async (tx) => {
    const [decisionRow] = await tx
      .insert(schema.closeoutDecisions)
      .values({
        scope: data.scope,
        scopeId: data.scopeId,
        decision: data.decision,
        evidenceStrength: data.evidenceStrength || null,
        decisionSummary: data.decisionSummary,
        limitations: data.limitations || null,
        openQuestions: data.openQuestions || null,
        nextAction: data.nextAction,
        publicVersion: data.publicVersion || null,
        decisionOwner: userId,
      })
      .returning();

    for (const link of data.evidenceLinks || []) {
      await tx.insert(schema.closeoutEvidenceLinks).values({
        closeoutDecisionId: decisionRow.id,
        evidenceType: link.evidenceType,
        evidenceId: link.evidenceId,
      });
    }

    // Set closeoutDecisionId and transition the round to 'closed' in the SAME transaction as
    // the decision insert - no partial state is possible even if this second write fails, since
    // the whole block rolls back together (audit requirement: a round must never be left in
    // 'review' with an orphaned decision, or 'closed' without one).
    if (data.scope === "round") {
      await tx
        .update(schema.testRounds)
        .set({
          closeoutDecisionId: decisionRow.id,
          status: "closed",
          updatedAt: new Date(),
        })
        .where(eq(schema.testRounds.id, data.scopeId));
    }

    await logActivity(userId, "closeout.decided", "closeout_decision", decisionRow.id, {
      scope: data.scope,
      scopeId: data.scopeId,
      decision: data.decision,
    });

    return decisionRow;
  });
}

export async function getEvidenceSummaryForRound(roundId: string) {
  const round = await db.query.testRounds.findFirst({ where: eq(schema.testRounds.id, roundId) });
  if (!round) {
    throw AppError.notFound("Test round not found.");
  }

  const evaluations = await db.query.evaluations.findMany({
    where: eq(schema.evaluations.roundId, roundId),
    with: { sample: true, assignment: { with: { testerProfile: true } } },
  });
  const submittedEvaluations = evaluations.filter((e) => e.status !== "draft");

  const assignments = await db.query.testingAssignments.findMany({
    where: eq(schema.testingAssignments.roundId, roundId),
  });
  const sampleIds = Array.from(new Set(assignments.map((a) => a.sampleId)));

  const issues =
    sampleIds.length > 0
      ? await db.query.issueReports.findMany({
          where: inArray(schema.issueReports.sampleId, sampleIds),
          with: { sample: true },
        })
      : [];

  const issuesBySeverity: Record<string, number> = {};
  for (const issue of issues) {
    issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
  }

  return {
    evaluationsSubmittedCount: submittedEvaluations.length,
    evaluations: submittedEvaluations,
    issuesCount: issues.length,
    issuesBySeverity,
    issues,
    samplesInspectedCount: sampleIds.length,
  };
}

export async function getCloseoutDecisionByScope(scope: string, scopeId: string) {
  return await db.query.closeoutDecisions.findFirst({
    where: and(eq(schema.closeoutDecisions.scope, scope), eq(schema.closeoutDecisions.scopeId, scopeId)),
    with: { evidenceLinks: true },
  });
}
