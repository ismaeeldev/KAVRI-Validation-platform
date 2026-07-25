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

export async function createProduct(
  data: {
    supplierId: string;
    internalName: string;
    publicAlias?: string;
    descriptionInternal: string;
    publicSummary?: string;
    isPublic: boolean;
  },
  userId: string
) {
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
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "product.created", "product", newProduct.id, {
    internalName: data.internalName,
  });

  return newProduct;
}

export async function updateProduct(
  id: string,
  data: {
    internalName: string;
    publicAlias?: string;
    descriptionInternal: string;
    publicSummary?: string;
    isPublic: boolean;
  },
  userId: string
) {
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
  },
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
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "revision.created", "product_revision", newRevision.id, {
    revisionCode: data.revisionCode,
    productId: data.productId,
  });

  return newRevision;
}
