"use server";

import { requireOwner } from "@/lib/permissions";
import { createSupplier, updateSupplier, archiveSupplier } from "../services/supplier-service";
import { createSupplierSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createSupplierAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createSupplierSchema.parse(formData);
  const result = await createSupplier(parsed, session.user.id);
  revalidatePath("/owner/suppliers");
  return result;
}

export async function updateSupplierAction(id: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createSupplierSchema.parse(formData);
  const result = await updateSupplier(id, parsed, session.user.id);
  revalidatePath(`/owner/suppliers/${id}`);
  revalidatePath("/owner/suppliers");
  return result;
}

export async function archiveSupplierAction(id: string) {
  const { session } = await requireOwner();
  const result = await archiveSupplier(id, session.user.id);
  revalidatePath(`/owner/suppliers/${id}`);
  revalidatePath("/owner/suppliers");
  return result;
}
