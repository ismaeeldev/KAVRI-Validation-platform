import "server-only";
import { eq, and, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getAssignments, summarizeAssignmentProgress } from "./assignment-service";

// Owner Dashboard "Needs Attention" + "Active Work" data (Step 10 audit Section 6). Extracted
// into its own service function (rather than inlined in the page) so each query's fixture
// behavior is independently unit-testable.
export async function getDashboardSummary() {
  const samplesAwaitingInspection = await db.query.physicalSamples.findMany({
    where: inArray(schema.physicalSamples.status, ["received", "under_review"]),
  });

  const approvedTesters = await db.query.testerProfiles.findMany({
    where: eq(schema.testerProfiles.approvalStatus, "approved"),
  });
  const invitedTesterIds = new Set(
    (await db.selectDistinct({ testerProfileId: schema.testerInvitations.testerProfileId }).from(schema.testerInvitations)).map(
      (r) => r.testerProfileId
    )
  );
  const testersNeedingInvitation = approvedTesters.filter((t) => !invitedTesterIds.has(t.id));

  const allAssignments = await getAssignments();
  const overdueAssignments = allAssignments.filter((asg) => summarizeAssignmentProgress(asg).overdue);
  const activeComputedAssignments = allAssignments.filter((asg) => summarizeAssignmentProgress(asg).label === "active");

  const criticalOpenIssues = await db.query.issueReports.findMany({
    where: and(
      eq(schema.issueReports.resolutionStatus, "open"),
      or(eq(schema.issueReports.severity, "high"), eq(schema.issueReports.severity, "stop_use"))
    ),
  });

  const roundsNeedingCloseout = await db.query.testRounds.findMany({
    where: eq(schema.testRounds.status, "review"),
  });

  const activeRounds = await db.query.testRounds.findMany({
    where: eq(schema.testRounds.status, "active"),
  });

  // TODO(Step 13): public updates gain a review-pending state in Step 13's workflow expansion;
  // until then, "awaiting review" is approximated as draft updates.
  const draftUpdates = await db.query.publicUpdates.findMany({
    where: eq(schema.publicUpdates.publishedState, "draft"),
  });

  const draftEvaluations = await db.query.evaluations.findMany({
    where: eq(schema.evaluations.status, "draft"),
  });

  return {
    needsAttention: {
      samplesAwaitingInspectionCount: samplesAwaitingInspection.length,
      testersNeedingInvitationCount: testersNeedingInvitation.length,
      overdueAssignmentsCount: overdueAssignments.length,
      criticalOpenIssuesCount: criticalOpenIssues.length,
      roundsNeedingCloseoutCount: roundsNeedingCloseout.length,
    },
    activeWork: {
      activeRoundsCount: activeRounds.length,
      activeAssignmentsCount: activeComputedAssignments.length,
      draftEvaluationsCount: draftEvaluations.length,
      draftUpdatesCount: draftUpdates.length,
    },
  };
}
