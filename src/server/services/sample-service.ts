import "server-only";
import { eq, and, inArray } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

// Uppercase alphanumeric, no ambiguous characters (0/O, 1/I) - printed on a physical QR label.
const generateShortCode = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

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

  // Generate a unique short code / QR value; retry on the rare collision.
  let shortCode = generateShortCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.query.physicalSamples.findFirst({
      where: eq(schema.physicalSamples.shortCode, shortCode),
    });
    if (!existing) break;
    shortCode = generateShortCode();
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrValue = `${appUrl}/owner/samples/scan/${shortCode}`;

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
      shortCode,
      qrValue,
    })
    .returning();

  await logActivity(userId, "sample.created", "physical_sample", newSample.id, {
    sampleCode: data.sampleCode,
    status: "received",
  });

  return newSample;
}

// State Machine transitions definitions.
// 'assigned' is system-triggered only (wired in Step 10 when an assignment activates against
// this sample) - never exposed as an owner-clickable transition. 'returned'/'retired' are
// owner-triggered disposition actions.
const VALID_TRANSITIONS: Record<string, string[]> = {
  received: ["under_review", "blocked", "rejected"],
  under_review: ["ready_for_testing", "blocked", "rejected"],
  blocked: ["under_review"],
  ready_for_testing: ["blocked", "rejected", "assigned", "retired"],
  rejected: [], // Prohibited from transition in Sprint 1
  assigned: ["returned"],
  returned: ["ready_for_testing", "retired", "blocked"],
  retired: [], // Terminal state
};

// Transitions the owner can trigger by clicking a button. 'assigned' is excluded - it is only
// ever set by system code (Step 10, when an assignment activates against a ready sample).
export const OWNER_TRIGGERABLE_TRANSITIONS: Record<string, string[]> = Object.fromEntries(
  Object.entries(VALID_TRANSITIONS).map(([from, tos]) => [from, tos.filter((to) => to !== "assigned")])
);

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

// Audit's "Current Holder - Tester or KAVRI - Derived from assignments/returns" field.
// Wired in Step 10: while a sample is 'assigned', the holder is the tester on its active
// (invited/acknowledged) assignment; every other status unambiguously means the sample
// physically sits with KAVRI.
export async function getCurrentHolder(sampleId: string): Promise<string> {
  const sample = await getSampleById(sampleId);
  if (sample.status !== "assigned") {
    return "KAVRI";
  }

  const assignment = await db.query.testingAssignments.findFirst({
    where: and(
      eq(schema.testingAssignments.sampleId, sampleId),
      inArray(schema.testingAssignments.status, ["invited", "acknowledged"])
    ),
    with: { testerProfile: true },
  });

  return assignment ? assignment.testerProfile.displayName : "Assigned (holder TBD)";
}

interface SampleMeasurementsInput {
  actualStaticWeightG?: number;
  actualSwingWeight?: number;
  actualSwingWeightMethod?: string;
  actualSwingWeightDate?: string;
  actualTwistWeight?: number;
  actualTwistWeightMethod?: string;
  actualTwistWeightDate?: string;
  actualBalancePointMm?: number;
  actualLengthIn?: number;
  actualWidthIn?: number;
  actualHandleLengthIn?: number;
}

const numToStr = (n: number | undefined | null): string | null => (n === undefined || n === null ? null : String(n));

// Measurements are the sample's own physical properties, not shared configuration - always
// freely editable, unlike productRevisions' spec-field immutability guard (Step 3).
export async function updateSampleMeasurements(sampleId: string, data: SampleMeasurementsInput, userId: string) {
  await getSampleById(sampleId);

  const [updated] = await db
    .update(schema.physicalSamples)
    .set({
      actualStaticWeightG: numToStr(data.actualStaticWeightG),
      actualSwingWeight: numToStr(data.actualSwingWeight),
      actualSwingWeightMethod: data.actualSwingWeightMethod || null,
      actualSwingWeightDate: data.actualSwingWeightDate || null,
      actualTwistWeight: numToStr(data.actualTwistWeight),
      actualTwistWeightMethod: data.actualTwistWeightMethod || null,
      actualTwistWeightDate: data.actualTwistWeightDate || null,
      actualBalancePointMm: numToStr(data.actualBalancePointMm),
      actualLengthIn: numToStr(data.actualLengthIn),
      actualWidthIn: numToStr(data.actualWidthIn),
      actualHandleLengthIn: numToStr(data.actualHandleLengthIn),
      updatedAt: new Date(),
    })
    .where(eq(schema.physicalSamples.id, sampleId))
    .returning();

  await logActivity(userId, "sample.measurements_updated", "physical_sample", sampleId, {});

  return updated;
}

interface SampleInspectionInput {
  inspectionPackagingOk?: boolean;
  inspectionPackagingNotes?: string;
  inspectionCosmeticOk?: boolean;
  inspectionCosmeticNotes?: string;
  inspectionConstructionOk?: boolean;
  inspectionConstructionNotes?: string;
  inspectionSoundOk?: boolean;
  inspectionSoundNotes?: string;
}

export async function updateSampleInspection(sampleId: string, data: SampleInspectionInput, userId: string) {
  await getSampleById(sampleId);

  const [updated] = await db
    .update(schema.physicalSamples)
    .set({
      inspectionPackagingOk: data.inspectionPackagingOk ?? null,
      inspectionPackagingNotes: data.inspectionPackagingNotes || null,
      inspectionCosmeticOk: data.inspectionCosmeticOk ?? null,
      inspectionCosmeticNotes: data.inspectionCosmeticNotes || null,
      inspectionConstructionOk: data.inspectionConstructionOk ?? null,
      inspectionConstructionNotes: data.inspectionConstructionNotes || null,
      inspectionSoundOk: data.inspectionSoundOk ?? null,
      inspectionSoundNotes: data.inspectionSoundNotes || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.physicalSamples.id, sampleId))
    .returning();

  await logActivity(userId, "sample.inspection_updated", "physical_sample", sampleId, {});

  return updated;
}
