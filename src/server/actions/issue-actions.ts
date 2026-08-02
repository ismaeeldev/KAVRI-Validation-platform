"use server";

import { eq } from "drizzle-orm";
import { requireSession, requireOwner } from "@/lib/permissions";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { createIssueReport, updateIssueResolution } from "../services/issue-service";
import { createIssueReportSchema, updateIssueResolutionSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createIssueReportAction(formData: unknown) {
  const session = await requireSession();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, session.user.id),
  });
  if (!profile || profile.accountStatus !== "active") {
    throw AppError.forbidden();
  }

  const parsed = createIssueReportSchema.parse(formData);
  const result = await createIssueReport(parsed, session.user.id, profile.role as "owner" | "tester");

  revalidatePath(`/owner/samples/${parsed.sampleId}`);
  revalidatePath("/owner/issues");
  if (parsed.assignmentId) {
    revalidatePath(`/tester/assignments/${parsed.assignmentId}`);
  }

  return result;
}

export async function updateIssueResolutionAction(issueId: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = updateIssueResolutionSchema.parse(formData);
  const result = await updateIssueResolution(issueId, parsed, session.user.id, "owner");
  revalidatePath(`/owner/issues/${issueId}`);
  revalidatePath("/owner/issues");
  return result;
}
