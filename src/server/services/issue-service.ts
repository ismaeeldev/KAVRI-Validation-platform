import "server-only";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";
import { sendStopUseAlertEmail } from "@/lib/email";

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

  let emailSent: boolean | null = null;
  let emailError: string | null = null;

  // Step 3 (Notification Event Matrix row "Stop Use issue"): immediate email + dashboard alert
  // to the owner, gated strictly on severity === 'stop_use' (the dashboard's own
  // CRITICAL_ISSUE_SEVERITIES set on /owner/samples already surfaces both 'high' and 'stop_use'
  // without email, per notification restraint - only Stop Use additionally gets an immediate
  // email). The issue record above always completes or throws on its own; the email send is
  // caught separately so a Resend failure never blocks the issue report itself, and so it never
  // silently drops - it is logged and returned as a real emailSent/emailError state.
  if (data.severity === "stop_use") {
    const owners = await db.query.userProfiles.findMany({
      where: and(eq(schema.userProfiles.role, "owner"), eq(schema.userProfiles.accountStatus, "active")),
    });

    if (owners.length === 0) {
      emailSent = false;
      emailError = "No active owner account found to notify.";
      console.error(`[issue-service] Stop Use issue ${issue.id} reported but no active owner account exists to notify.`);
    } else {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const issueUrl = `${appUrl}/owner/issues/${issue.id}`;

      try {
        await Promise.all(
          owners.map((owner) =>
            sendStopUseAlertEmail(owner.emailNormalized, {
              sampleCode: sample.sampleCode,
              category: data.category,
              description: data.description,
              issueUrl,
            })
          )
        );
        emailSent = true;
      } catch (error: unknown) {
        const err = error as Error;
        console.error(`[issue-service] Failed to send Stop Use alert for issue ${issue.id}:`, err);
        emailSent = false;
        emailError = err.message || "Failed to send Stop Use alert email.";
      }
    }
  }

  return { ...issue, emailSent, emailError };
}

interface UpdateResolutionInput {
  immediateAction?: string;
  resolutionStatus: string;
  resolutionNotes?: string;
}

// FUNC-08: explicit state-machine guard on resolutionStatus transitions, mirroring the
// VALID_TRANSITIONS pattern in sample-service.ts / public-update-service.ts. Intended flow is
// open -> monitoring -> resolved -> closed; reopening from a later state back to an earlier one
// is allowed (the issue recurred or wasn't actually fixed), but skipping straight to a
// terminal/near-terminal state (e.g. open or monitoring -> closed) is prohibited.
const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ["monitoring", "resolved"],
  monitoring: ["resolved", "open"],
  resolved: ["closed", "monitoring"],
  closed: ["open", "monitoring"],
};

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

  const currentStatus = issue.resolutionStatus;
  if (currentStatus !== data.resolutionStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(data.resolutionStatus)) {
      throw AppError.invalidState(
        `Transition from '${currentStatus}' to '${data.resolutionStatus}' is prohibited.`
      );
    }
  }

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
