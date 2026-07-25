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

export async function createSupplier(
  data: {
    name: string;
    code?: string;
    contactName?: string;
    contactEmail?: string;
    notes: string;
  },
  userId: string
) {
  // Check duplicate code
  if (data.code) {
    const existing = await db.query.suppliers.findFirst({
      where: eq(schema.suppliers.code, data.code),
    });
    if (existing) {
      throw AppError.conflict(`A supplier with code '${data.code}' already exists.`);
    }
  }

  const [newSupplier] = await db
    .insert(schema.suppliers)
    .values({
      name: data.name,
      code: data.code || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      notes: data.notes,
      status: "active",
      createdBy: userId,
    })
    .returning();

  await logActivity(userId, "supplier.created", "supplier", newSupplier.id, {
    name: data.name,
    code: data.code,
  });

  return newSupplier;
}

export async function updateSupplier(
  id: string,
  data: {
    name: string;
    code?: string;
    contactName?: string;
    contactEmail?: string;
    notes: string;
  },
  userId: string
) {
  const supplier = await getSupplierById(id);

  if (supplier.status === "archived") {
    throw AppError.invalidState("Cannot update an archived supplier.");
  }

  // Check code conflicts
  if (data.code && data.code !== supplier.code) {
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
      code: data.code || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(schema.suppliers.id, id))
    .returning();

  await logActivity(userId, "supplier.updated", "supplier", id, {
    name: data.name,
  });

  return updatedSupplier;
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
