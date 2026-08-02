import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity-service";

export async function getSuppliers() {
  // Query all suppliers and count associated products and physical samples
  const list = await db
    .select({
      id: schema.suppliers.id,
      name: schema.suppliers.name,
      code: schema.suppliers.code,
      status: schema.suppliers.status,
      supplierType: schema.suppliers.supplierType,
      website: schema.suppliers.website,
      phone: schema.suppliers.phone,
      addressLine1: schema.suppliers.addressLine1,
      addressLine2: schema.suppliers.addressLine2,
      city: schema.suppliers.city,
      region: schema.suppliers.region,
      postalCode: schema.suppliers.postalCode,
      country: schema.suppliers.country,
      relationshipStatus: schema.suppliers.relationshipStatus,
      createdAt: schema.suppliers.createdAt,
      updatedAt: schema.suppliers.updatedAt,
      productCount: sql<number>`cast(count(distinct ${schema.products.id}) as integer)`,
      sampleCount: sql<number>`cast(count(distinct ${schema.physicalSamples.id}) as integer)`,
    })
    .from(schema.suppliers)
    .leftJoin(schema.products, eq(schema.products.supplierId, schema.suppliers.id))
    .leftJoin(schema.physicalSamples, eq(schema.physicalSamples.supplierId, schema.suppliers.id))
    .groupBy(schema.suppliers.id)
    .orderBy(schema.suppliers.name);

  return list;
}

export async function getSupplierById(id: string) {
  const supplier = await db.query.suppliers.findFirst({
    where: eq(schema.suppliers.id, id),
  });

  if (!supplier) {
    throw AppError.notFound("Supplier not found.");
  }

  return supplier;
}

interface SupplierInput {
  name: string;
  code: string;
  contactName?: string;
  contactEmail?: string;
  notes: string;
  supplierType?: string;
  website?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  relationshipStatus: string;
}

export async function createSupplier(data: SupplierInput, userId: string) {
  // Code is required (enforced by schema); still guard against a duplicate.
  const existing = await db.query.suppliers.findFirst({
    where: eq(schema.suppliers.code, data.code),
  });
  if (existing) {
    throw AppError.conflict(`A supplier with code '${data.code}' already exists.`);
  }

  const [newSupplier] = await db
    .insert(schema.suppliers)
    .values({
      name: data.name,
      code: data.code,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      notes: data.notes,
      status: "active",
      supplierType: data.supplierType || null,
      website: data.website || null,
      phone: data.phone || null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      region: data.region || null,
      postalCode: data.postalCode || null,
      country: data.country || null,
      relationshipStatus: data.relationshipStatus,
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "supplier.created", "supplier", newSupplier.id, {
    name: data.name,
    code: data.code,
  });

  return newSupplier;
}

export async function updateSupplier(id: string, data: SupplierInput, userId: string) {
  const supplier = await getSupplierById(id);

  if (supplier.status === "archived") {
    throw AppError.invalidState("Cannot update an archived supplier.");
  }

  // Check code conflicts (code is always required now, so always re-check on change)
  if (data.code !== supplier.code) {
    const existing = await db.query.suppliers.findFirst({
      where: eq(schema.suppliers.code, data.code),
    });
    if (existing) {
      throw AppError.conflict(`A supplier with code '${data.code}' already exists.`);
    }
  }

  const [updatedSupplier] = await db
    .update(schema.suppliers)
    .set({
      name: data.name,
      code: data.code,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      notes: data.notes,
      supplierType: data.supplierType || null,
      website: data.website || null,
      phone: data.phone || null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      region: data.region || null,
      postalCode: data.postalCode || null,
      country: data.country || null,
      relationshipStatus: data.relationshipStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.suppliers.id, id))
    .returning();

  await logActivity(userId, "supplier.updated", "supplier", id, {
    name: data.name,
  });

  return updatedSupplier;
}

export async function getSupplierLinkedRecordCounts(supplierId: string) {
  const [productsRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.products)
    .where(eq(schema.products.supplierId, supplierId));

  const [samplesRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.physicalSamples)
    .where(eq(schema.physicalSamples.supplierId, supplierId));

  return {
    productCount: productsRow?.count ?? 0,
    sampleCount: samplesRow?.count ?? 0,
  };
}

export async function archiveSupplier(id: string, userId: string) {
  const supplier = await getSupplierById(id);

  if (supplier.status === "archived") {
    return supplier; // Idempotent
  }

  const [archivedSupplier] = await db
    .update(schema.suppliers)
    .set({
      status: "archived",
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.suppliers.id, id))
    .returning();

  await logActivity(userId, "supplier.archived", "supplier", id);

  return archivedSupplier;
}
