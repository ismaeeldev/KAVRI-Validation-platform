import "server-only";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getAllIssues() {
  return await db.query.issueReports.findMany({
    with: {
      sample: true,
      revision: { with: { product: true } },
    },
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });
}

export async function getIssueById(issueId: string) {
  const issue = await db.query.issueReports.findFirst({
    where: eq(schema.issueReports.id, issueId),
    with: {
      sample: true,
      revision: { with: { product: true } },
      assignment: { with: { testerProfile: true } },
    },
  });
  if (!issue) {
    throw AppError.notFound("Issue report not found.");
  }
  return issue;
}

export async function getIssuesBySample(sampleId: string) {
  return await db.query.issueReports.findMany({
    where: eq(schema.issueReports.sampleId, sampleId),
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });
}

// "Recurrence" panel data - issues on OTHER samples that share this revision (same build
// defect surfacing on multiple physical units), optionally widened to any sample sharing the
// same category (a systemic pattern across builds).
export async function getRelatedIssues(sampleId: string, revisionId: string, category?: string) {
  const byRevision = await db.query.issueReports.findMany({
    where: and(eq(schema.issueReports.revisionId, revisionId), ne(schema.issueReports.sampleId, sampleId)),
    with: { sample: true },
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });

  if (!category) {
    return byRevision;
  }

  const byCategory = await db.query.issueReports.findMany({
    where: and(eq(schema.issueReports.category, category), ne(schema.issueReports.sampleId, sampleId)),
    with: { sample: true },
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });

  const merged = new Map(byRevision.map((i) => [i.id, i]));
  for (const i of byCategory) merged.set(i.id, i);
  return Array.from(merged.values());
}

interface CreateIssueInput {
  sampleId: string;
  assignmentId?: string;
  category: string;
  issueType: string;
  severity: string;
  firstObservedAt: string;
  description: string;
  stillPlayable?: string;
}

export async function createIssueReport(
  data: CreateIssueInput,
  userId: string,
  role: "owner" | "tester"
) {
  const sample = await db.query.physicalSamples.findFirst({
    where: eq(schema.physicalSamples.id, data.sampleId),
  });
  if (!sample) {
    throw AppError.notFound("Physical sample not found.");
  }

  if (role === "tester") {
    // A tester may only log an issue against a sample they currently hold via an assignment -
    // mirrors attachment-service.ts's authorizePhotoAttachment ownership check.
    const assignment = await db.query.testingAssignments.findFirst({
      where: and(
        eq(schema.testingAssignments.sampleId, data.sampleId),
        eq(schema.testingAssignments.testerUserId, userId)
      ),
    });
    if (!assignment) {
      throw AppError.forbidden("You do not have an active assignment for this sample.");
    }
  }

  if (data.issueType === "functional" && !data.stillPlayable) {
    throw AppError.validationError("Still-playable is required for functional issues.");
  }

  const [issue] = await db
    .insert(schema.issueReports)
    .values({
      sampleId: data.sampleId,
      revisionId: sample.revisionId,
      assignmentId: data.assignmentId || null,
      category: data.category,
      issueType: data.issueType,
      severity: data.severity,
      firstObservedAt: data.firstObservedAt,
      description: data.description,
      stillPlayable: data.issueType === "functional" ? data.stillPlayable || null : null,
      resolutionStatus: "open",
      reportedBy: userId,
    })
    .returning();

  await logActivity(userId, "issue.reported", "issue_report", issue.id, {
    sampleCode: sample.sampleCode,
    category: data.category,
    severity: data.severity,
  });

  return issue;
}

interface UpdateResolutionInput {
  immediateAction?: string;
  resolutionStatus: string;
  resolutionNotes?: string;
}

export async function updateIssueResolution(
  issueId: string,
  data: UpdateResolutionInput,
  userId: string,
  role: "owner" | "tester"
) {
  if (role !== "owner") {
    throw AppError.forbidden("Only the owner may set the resolution for an issue report.");
  }

  const issue = await getIssueById(issueId);

  const isClosing = data.resolutionStatus === "closed" || data.resolutionStatus === "resolved";

  const [updated] = await db
    .update(schema.issueReports)
    .set({
      immediateAction: data.immediateAction || null,
      resolutionStatus: data.resolutionStatus,
      resolutionNotes: data.resolutionNotes || null,
      closedAt: isClosing ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.issueReports.id, issueId))
    .returning();

  await logActivity(userId, "issue.resolution_updated", "issue_report", issueId, {
    from: issue.resolutionStatus,
    to: data.resolutionStatus,
  });

  return updated;
}
