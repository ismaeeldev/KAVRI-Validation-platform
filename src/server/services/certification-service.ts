import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";
import { GOVERNING_BODY } from "@/lib/constants";

export async function getCertificationsByRevision(revisionId: string) {
  return await db.query.productCertifications.findMany({
    where: eq(schema.productCertifications.revisionId, revisionId),
  });
}

// Dual indicator is computed, never stored: true only when both USAP and UPA-A rows exist
// with status='approved'.
export async function getDualCertificationStatus(revisionId: string): Promise<boolean> {
  const certifications = await getCertificationsByRevision(revisionId);
  const usap = certifications.find((c) => c.governingBody === GOVERNING_BODY.USAP);
  const upaA = certifications.find((c) => c.governingBody === GOVERNING_BODY.UPA_A);
  return usap?.status === "approved" && upaA?.status === "approved";
}

interface CertificationInput {
  revisionId: string;
  governingBody: string;
  status: string;
  submissionDate?: string;
  approvalDate?: string;
  expirationDate?: string;
  approvedModelName?: string;
  referenceOrListing?: string;
}

export async function createCertification(data: CertificationInput, userId: string) {
  const revision = await db.query.productRevisions.findFirst({
    where: eq(schema.productRevisions.id, data.revisionId),
  });
  if (!revision) {
    throw AppError.notFound("Product revision not found.");
  }

  const existing = await db.query.productCertifications.findFirst({
    where: and(
      eq(schema.productCertifications.revisionId, data.revisionId),
      eq(schema.productCertifications.governingBody, data.governingBody)
    ),
  });
  if (existing) {
    throw AppError.conflict(`A ${data.governingBody.toUpperCase()} certification record already exists for this revision.`);
  }

  const [created] = await db
    .insert(schema.productCertifications)
    .values({
      revisionId: data.revisionId,
      governingBody: data.governingBody,
      status: data.status,
      submissionDate: data.submissionDate || null,
      approvalDate: data.approvalDate || null,
      expirationDate: data.expirationDate || null,
      approvedModelName: data.approvedModelName || null,
      referenceOrListing: data.referenceOrListing || null,
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "certification.created", "product_certification", created.id, {
    revisionId: data.revisionId,
    governingBody: data.governingBody,
  });

  return created;
}

interface CertificationStatusInput {
  status: string;
  submissionDate?: string;
  approvalDate?: string;
  expirationDate?: string;
  approvedModelName?: string;
  referenceOrListing?: string;
}

export async function updateCertificationStatus(id: string, data: CertificationStatusInput, userId: string) {
  const certification = await db.query.productCertifications.findFirst({
    where: eq(schema.productCertifications.id, id),
  });
  if (!certification) {
    throw AppError.notFound("Certification record not found.");
  }

  if (data.status === "approved" && !data.approvalDate) {
    throw AppError.invalidState("Approval Date is required when marking a certification Approved.");
  }

  const [updated] = await db
    .update(schema.productCertifications)
    .set({
      status: data.status,
      submissionDate: data.submissionDate || null,
      approvalDate: data.approvalDate || null,
      expirationDate: data.expirationDate || null,
      approvedModelName: data.approvedModelName || null,
      referenceOrListing: data.referenceOrListing || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.productCertifications.id, id))
    .returning();

  await logActivity(userId, "certification.status_updated", "product_certification", id, {
    status: data.status,
  });

  return updated;
}
