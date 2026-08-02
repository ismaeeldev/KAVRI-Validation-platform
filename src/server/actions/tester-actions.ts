"use server";

import { requireOwner } from "@/lib/permissions";
import { createPendingTester, updateTesterApproval, updateTesterProfile, declineTester } from "../services/tester-service";
import { createInvitation, consumeInvitation } from "../services/invitation-service";
import {
  createTesterSchema,
  updateTesterProfileSchema,
  declineTesterSchema,
  acceptInvitationSchema,
} from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function createTesterAction(formData: unknown) {
  const { session } = await requireOwner();
  const parsed = createTesterSchema.parse(formData);
  const result = await createPendingTester(parsed, session.user.id);
  revalidatePath("/owner/testers");
  return result;
}

export async function updateTesterApprovalAction(id: string, approvalStatus: "approved" | "deactivated") {
  const { session } = await requireOwner();
  const result = await updateTesterApproval(id, approvalStatus, session.user.id);
  revalidatePath(`/owner/testers/${id}`);
  revalidatePath("/owner/testers");
  return result;
}

export async function updateTesterProfileAction(id: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = updateTesterProfileSchema.parse(formData);
  const result = await updateTesterProfile(id, parsed, session.user.id);
  revalidatePath(`/owner/testers/${id}`);
  return result;
}

export async function declineTesterAction(id: string, formData: unknown) {
  const { session } = await requireOwner();
  const parsed = declineTesterSchema.parse(formData);
  const result = await declineTester(id, parsed.reason, session.user.id);
  revalidatePath(`/owner/testers/${id}`);
  revalidatePath("/owner/testers");
  return result;
}

export async function generateInvitationAction(testerProfileId: string) {
  const { session } = await requireOwner();
  const result = await createInvitation(testerProfileId, session.user.id);
  revalidatePath(`/owner/testers/${testerProfileId}`);
  return {
    rawToken: result.rawToken,
    expiresAt: result.invitation.expiresAt,
  };
}

export async function acceptInvitationAction(rawToken: string, displayName: string, formData: unknown) {
  const parsed = acceptInvitationSchema.parse(formData);
  const result = await consumeInvitation(rawToken, parsed.password, displayName, parsed.consentTextVersion);
  return result;
}
