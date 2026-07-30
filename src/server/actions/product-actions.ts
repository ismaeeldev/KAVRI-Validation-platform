"use server";

import { requireOwner } from "@/lib/permissions";
import {
  createProduct,
  updateProduct,
  archiveProduct,
  createRevision,
  updateRevision,
} from "../services/product-service";
import {
  createCertification,
  updateCertificationStatus,
} from "../services/certification-service";
import {
  createProductSchema,
  createRevisionSchema,
  updateRevisionSchema,
  createCertificationSchema,
  updateCertificationStatusSchema,
} from "@/lib/validation/schemas";
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

export async function updateRevisionAction(id: string, productId: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = updateRevisionSchema.parse(formData);
  const result = await updateRevision(id, parsed, session.user.id);
  revalidatePath(`/owner/products/${productId}/revisions/${id}`);
  revalidatePath(`/owner/products/${productId}`);
  return result;
}

export async function createCertificationAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createCertificationSchema.parse(formData);
  const result = await createCertification(parsed, session.user.id);
  return result;
}

export async function updateCertificationStatusAction(id: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = updateCertificationStatusSchema.parse(formData);
  const result = await updateCertificationStatus(id, parsed, session.user.id);
  return result;
}
