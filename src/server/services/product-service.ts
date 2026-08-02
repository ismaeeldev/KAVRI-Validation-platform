import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getProducts() {
  return await db.query.products.findMany({
    with: {
      supplier: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

export async function getProductById(id: string) {
  const product = await db.query.products.findFirst({
    where: eq(schema.products.id, id),
    with: {
      supplier: true,
    },
  });

  if (!product) {
    throw AppError.notFound("Product not found.");
  }

  return product;
}

interface ProductInput {
  supplierId: string;
  internalName: string;
  publicAlias?: string;
  descriptionInternal: string;
  publicSummary?: string;
  isPublic: boolean;
  shape?: string;
  performanceProfile?: string;
  firepowerBalance?: string;
  publicState: string;
}

export async function createProduct(data: ProductInput, userId: string) {
  // Validate supplier exists and is not archived
  const supplier = await db.query.suppliers.findFirst({
    where: eq(schema.suppliers.id, data.supplierId),
  });

  if (!supplier) {
    throw AppError.notFound("Selected supplier not found.");
  }

  if (supplier.status === "archived") {
    throw AppError.invalidState("Cannot link a product to an archived supplier.");
  }

  const [newProduct] = await db
    .insert(schema.products)
    .values({
      supplierId: data.supplierId,
      internalName: data.internalName,
      publicAlias: data.publicAlias || null,
      descriptionInternal: data.descriptionInternal,
      publicSummary: data.publicSummary || null,
      status: "active",
      isPublic: data.isPublic,
      shape: data.shape || null,
      performanceProfile: data.performanceProfile || null,
      firepowerBalance: data.firepowerBalance || null,
      publicState: data.publicState,
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "product.created", "product", newProduct.id, {
    internalName: data.internalName,
  });

  return newProduct;
}

export async function updateProduct(id: string, data: ProductInput, userId: string) {
  const product = await getProductById(id);

  if (product.status === "archived") {
    throw AppError.invalidState("Cannot update an archived product.");
  }

  const [updatedProduct] = await db
    .update(schema.products)
    .set({
      internalName: data.internalName,
      publicAlias: data.publicAlias || null,
      descriptionInternal: data.descriptionInternal,
      publicSummary: data.publicSummary || null,
      isPublic: data.isPublic,
      shape: data.shape || null,
      performanceProfile: data.performanceProfile || null,
      firepowerBalance: data.firepowerBalance || null,
      publicState: data.publicState,
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, id))
    .returning();

  await logActivity(userId, "product.updated", "product", id, {
    internalName: data.internalName,
  });

  return updatedProduct;
}

export async function archiveProduct(id: string, userId: string) {
  const product = await getProductById(id);

  if (product.status === "archived") {
    return product;
  }

  const [archivedProduct] = await db
    .update(schema.products)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, id))
    .returning();

  await logActivity(userId, "product.archived", "product", id);

  return archivedProduct;
}

// Revisions Service Layer
export async function getProductRevisions(productId: string) {
  return await db.query.productRevisions.findMany({
    where: eq(schema.productRevisions.productId, productId),
    orderBy: (revisions, { desc }) => [desc(revisions.createdAt)],
  });
}

export async function getRevisionById(id: string) {
  const revision = await db.query.productRevisions.findFirst({
    where: eq(schema.productRevisions.id, id),
    with: {
      product: {
        with: {
          supplier: true,
        },
      },
    },
  });

  if (!revision) {
    throw AppError.notFound("Product revision not found.");
  }

  return revision;
}

interface RevisionSpecFields {
  shape?: string;
  performanceProfile?: string;
  firepowerBalance?: string;
  coreThicknessMm?: number;
  overallLengthIn?: number;
  overallWidthIn?: number;
  handleLengthIn?: number;
  gripCircumferenceIn?: number;
  handleWidthIn?: number;
  handleDepthIn?: number;
  targetStaticWeightMinG?: number;
  targetStaticWeightMaxG?: number;
  targetSwingWeight?: number;
  targetSwingWeightMethod?: string;
  targetTwistWeight?: number;
  targetTwistWeightMethod?: string;
  targetBalancePointMm?: number;
}

interface RevisionAssessmentFields {
  spinRating: string;
  spinRatingSource?: string;
  spinRatingDate?: string;
  spinRatingConfidence?: string;
  feelQuadrant: string;
  publicState: string;
}

// Numeric-affecting/shape fields locked once a physical sample exists against the revision.
// Kept in sync with REVISION_SPEC_FIELDS in src/lib/validation/schemas.ts.
const SPEC_FIELD_KEYS: (keyof RevisionSpecFields)[] = [
  "shape",
  "coreThicknessMm",
  "overallLengthIn",
  "overallWidthIn",
  "handleLengthIn",
  "gripCircumferenceIn",
  "handleWidthIn",
  "handleDepthIn",
  "targetStaticWeightMinG",
  "targetStaticWeightMaxG",
  "targetSwingWeight",
  "targetTwistWeight",
  "targetBalancePointMm",
];

// drizzle-orm's numeric() column type accepts/returns strings (to avoid float precision
// loss), not JS numbers - convert here so callers can work with plain numbers everywhere else.
const numToStr = (n: number | undefined | null): string | null => (n === undefined || n === null ? null : String(n));

function specFieldValues(data: RevisionSpecFields) {
  return {
    shape: data.shape || null,
    performanceProfile: data.performanceProfile || null,
    firepowerBalance: data.firepowerBalance || null,
    coreThicknessMm: numToStr(data.coreThicknessMm),
    overallLengthIn: numToStr(data.overallLengthIn),
    overallWidthIn: numToStr(data.overallWidthIn),
    handleLengthIn: numToStr(data.handleLengthIn),
    gripCircumferenceIn: numToStr(data.gripCircumferenceIn),
    handleWidthIn: numToStr(data.handleWidthIn),
    handleDepthIn: numToStr(data.handleDepthIn),
    targetStaticWeightMinG: numToStr(data.targetStaticWeightMinG),
    targetStaticWeightMaxG: numToStr(data.targetStaticWeightMaxG),
    targetSwingWeight: numToStr(data.targetSwingWeight),
    targetSwingWeightMethod: data.targetSwingWeightMethod || null,
    targetTwistWeight: numToStr(data.targetTwistWeight),
    targetTwistWeightMethod: data.targetTwistWeightMethod || null,
    targetBalancePointMm: numToStr(data.targetBalancePointMm),
  };
}

function assessmentFieldValues(data: RevisionAssessmentFields) {
  return {
    spinRating: data.spinRating,
    spinRatingSource: data.spinRatingSource || null,
    spinRatingDate: data.spinRatingDate || null,
    spinRatingConfidence: data.spinRatingConfidence || null,
    feelQuadrant: data.feelQuadrant,
    publicState: data.publicState,
  };
}

export async function createRevision(
  data: {
    productId: string;
    revisionCode: string;
    revisionReason: string;
    requestedChanges: string;
    supplierReportedChanges: string;
    internalNotes?: string;
    publicTitle?: string;
    publicSummary?: string;
    developmentStage: string;
    isPublic: boolean;
  } & RevisionSpecFields &
    RevisionAssessmentFields,
  userId: string
) {
  // Verify product exists and is active
  const product = await getProductById(data.productId);
  if (product.status === "archived") {
    throw AppError.invalidState("Cannot add a revision to an archived product.");
  }

  // Enforce unique revision code per product
  const existingCode = await db.query.productRevisions.findFirst({
    where: and(
      eq(schema.productRevisions.productId, data.productId),
      eq(schema.productRevisions.revisionCode, data.revisionCode)
    ),
  });

  if (existingCode) {
    throw AppError.conflict(`Revision code '${data.revisionCode}' is already defined for this product.`);
  }

  const [newRevision] = await db
    .insert(schema.productRevisions)
    .values({
      productId: data.productId,
      revisionCode: data.revisionCode,
      revisionReason: data.revisionReason,
      requestedChanges: data.requestedChanges,
      supplierReportedChanges: data.supplierReportedChanges,
      internalNotes: data.internalNotes || "",
      publicTitle: data.publicTitle || null,
      publicSummary: data.publicSummary || null,
      developmentStage: data.developmentStage,
      isPublic: data.isPublic,
      ...specFieldValues(data),
      ...assessmentFieldValues(data),
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "revision.created", "product_revision", newRevision.id, {
    revisionCode: data.revisionCode,
    productId: data.productId,
  });

  return newRevision;
}

export async function updateRevision(
  id: string,
  data: {
    revisionReason: string;
    requestedChanges: string;
    supplierReportedChanges: string;
    internalNotes?: string;
    publicTitle?: string;
    publicSummary?: string;
    developmentStage: string;
    isPublic: boolean;
    isControlledCorrection?: boolean;
  } & RevisionSpecFields &
    RevisionAssessmentFields,
  userId: string
) {
  const revision = await getRevisionById(id);

  const linkedSample = await db.query.physicalSamples.findFirst({
    where: eq(schema.physicalSamples.revisionId, id),
  });

  const attemptingSpecChange = SPEC_FIELD_KEYS.some((key) => {
    const incoming = data[key] ?? null;
    const current = (revision as unknown as Record<string, unknown>)[key] ?? null;
    // Numeric columns come back as strings from Postgres via drizzle-orm's numeric type;
    // compare loosely (String()) rather than by type so "14" === 14 is not a false change.
    return String(incoming) !== String(current);
  });

  if (linkedSample && attemptingSpecChange && !data.isControlledCorrection) {
    throw AppError.invalidState(
      "This revision has a physical sample already registered against it, so its specification fields are locked. Use 'Request Correction' to change them and keep a record of why."
    );
  }

  const [updatedRevision] = await db
    .update(schema.productRevisions)
    .set({
      revisionReason: data.revisionReason,
      requestedChanges: data.requestedChanges,
      supplierReportedChanges: data.supplierReportedChanges,
      internalNotes: data.internalNotes || "",
      publicTitle: data.publicTitle || null,
      publicSummary: data.publicSummary || null,
      developmentStage: data.developmentStage,
      isPublic: data.isPublic,
      ...specFieldValues(data),
      ...assessmentFieldValues(data),
      updatedAt: new Date(),
    })
    .where(eq(schema.productRevisions.id, id))
    .returning();

  if (linkedSample && attemptingSpecChange && data.isControlledCorrection) {
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    for (const key of SPEC_FIELD_KEYS) {
      before[key] = (revision as unknown as Record<string, unknown>)[key] ?? null;
      after[key] = data[key] ?? null;
    }
    await logActivity(userId, "revision.corrected", "product_revision", id, { before, after });
  } else {
    await logActivity(userId, "revision.updated", "product_revision", id, {
      revisionCode: revision.revisionCode,
    });
  }

  return updatedRevision;
}
