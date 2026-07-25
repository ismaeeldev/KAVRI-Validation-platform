"use server";

import { requireOwner } from "@/lib/permissions";
import {
  createProduct,
  updateProduct,
  archiveProduct,
  createRevision,
} from "../services/product-service";
import { createProductSchema, createRevisionSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createProductSchema.parse(formData);
  const result = await createProduct(parsed, session.user.id);
  revalidatePath("/owner/products");
  return result;
}

export async function updateProductAction(id: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createProductSchema.parse(formData);
  const result = await updateProduct(id, parsed, session.user.id);
  revalidatePath(`/owner/products/${id}`);
  revalidatePath("/owner/products");
  return result;
}

export async function archiveProductAction(id: string) {
  const { session } = await requireOwner();
  const result = await archiveProduct(id, session.user.id);
  revalidatePath(`/owner/products/${id}`);
  revalidatePath("/owner/products");
  return result;
}

export async function createRevisionAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createRevisionSchema.parse(formData);
  const result = await createRevision(parsed, session.user.id);
  revalidatePath(`/owner/products/${parsed.productId}`);
  return result;
}
