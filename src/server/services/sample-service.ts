import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getSamples() {
  return await db.query.physicalSamples.findMany({
    with: {
      supplier: true,
      product: true,
      revision: true,
    },
    orderBy: (samples, { desc }) => [desc(samples.createdAt)],
  });
}

export async function getSampleById(id: string) {
  const sample = await db.query.physicalSamples.findFirst({
    where: eq(schema.physicalSamples.id, id),
    with: {
      supplier: true,
      product: true,
      revision: true,
    },
  });

  if (!sample) {
    throw AppError.notFound("Physical sample not found.");
  }

  return sample;
}

export async function createSample(
  data: {
    sampleCode: string;
    supplierId: string;
    productId: string;
    revisionId: string;
    receivedAt: string;
    receivingObservations: string;
    identifyingNotes?: string;
  },
  userId: string
) {
  // 1. Validate supplier existence and active state
  const supplier = await db.query.suppliers.findFirst({
    where: eq(schema.suppliers.id, data.supplierId),
  });
  if (!supplier || supplier.status === "archived") {
    throw AppError.notFound("Supplier not found or has been archived.");
  }

  // 2. Validate product existence and active state
  const product = await db.query.products.findFirst({
    where: eq(schema.products.id, data.productId),
  });
  if (!product || product.status === "archived") {
    throw AppError.notFound("Product not found or has been archived.");
  }

  // 3. Verify product belongs to selected supplier
  if (product.supplierId !== data.supplierId) {
    throw AppError.invalidState("Product supplier relationship mismatch.");
  }

  // 4. Verify revision belongs to product
  const revision = await db.query.productRevisions.findFirst({
    where: and(
      eq(schema.productRevisions.id, data.revisionId),
      eq(schema.productRevisions.productId, data.productId)
    ),
  });
  if (!revision) {
    throw AppError.notFound("Revision not found or does not match selected product.");
  }

  // 5. Enforce unique sample code constraint
  const existingCode = await db.query.physicalSamples.findFirst({
    where: eq(schema.physicalSamples.sampleCode, data.sampleCode),
  });
  if (existingCode) {
    throw AppError.conflict(`Sample code '${data.sampleCode}' is already allocated.`);
  }

  const [newSample] = await db
    .insert(schema.physicalSamples)
    .values({
      sampleCode: data.sampleCode,
      supplierId: data.supplierId,
      productId: data.productId,
      revisionId: data.revisionId,
      status: "received",
      receivedAt: new Date(data.receivedAt),
      receivingObservations: data.receivingObservations,
      identifyingNotes: data.identifyingNotes || "",
      readinessNote: "Logged incoming batch.",
      statusChangedBy: userId,
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "sample.created", "physical_sample", newSample.id, {
    sampleCode: data.sampleCode,
    status: "received",
  });

  return newSample;
}

// State Machine transitions definitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  received: ["under_review", "blocked", "rejected"],
  under_review: ["ready_for_testing", "blocked", "rejected"],
  blocked: ["under_review"],
  ready_for_testing: ["blocked", "rejected"],
  rejected: [], // Prohibited from transition in Sprint 1
};

export async function transitionSampleStatus(
  sampleId: string,
  targetStatus: string,
  readinessNote: string,
  userId: string
) {
  const sample = await getSampleById(sampleId);
  const currentStatus = sample.status;

  // 1. Centralized transition validation
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw AppError.invalidState(
      `Transition from '${currentStatus}' to '${targetStatus}' is prohibited.`
    );
  }

  const [updatedSample] = await db
    .update(schema.physicalSamples)
    .set({
      status: targetStatus,
      readinessNote: readinessNote,
      statusChangedAt: new Date(),
      statusChangedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.physicalSamples.id, sampleId))
    .returning();

  await logActivity(userId, "sample.status_transitioned", "physical_sample", sampleId, {
    from: currentStatus,
    to: targetStatus,
    readinessNote,
  });

  return updatedSample;
}

// Helper guard for testing assignments compatibility
export async function requireSampleReady(sampleId: string) {
  const sample = await getSampleById(sampleId);
  if (sample.status !== "ready_for_testing") {
    throw AppError.invalidState(
      `Sample '${sample.sampleCode}' is not ready for testing (current state: ${sample.status}).`
    );
  }
  return sample;
}
