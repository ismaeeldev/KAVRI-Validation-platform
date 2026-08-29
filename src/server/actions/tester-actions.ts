"use server";

import { requireOwner } from "@/lib/permissions";
import { createPendingTester, updateTesterApproval, updateTesterProfile, declineTester, getTesterById } from "../services/tester-service";
import { createInvitation, consumeInvitation } from "../services/invitation-service";
import { sendInvitationEmail } from "@/lib/email";
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

// Step 2A (FUNC-02 closure): a deliberate, owner-triggered action that both (re)issues the
// invitation token AND sends the tester activation email. This is intentionally a separate,
// explicit click from tester record creation (createTesterAction) - invitations are never sent
// automatically. Token creation always succeeds or throws (existing behavior preserved for the
// link display fallback); the email send is caught separately so a Resend delivery failure
// surfaces as a real error to the owner instead of a false-positive "sent" state, while the
// freshly generated link remains available to copy manually.
export async function sendTesterInvitationAction(testerProfileId: string) {
  const { session } = await requireOwner();
  const tester = await getTesterById(testerProfileId);
  const result = await createInvitation(testerProfileId, session.user.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${result.rawToken}`;

  let emailSent = false;
  let emailError: string | null = null;
  try {
    await sendInvitationEmail(tester.emailNormalized, tester.displayName, inviteUrl);
    emailSent = true;
  } catch (error: unknown) {
    const err = error as Error;
    emailError = err.message || "Failed to send invitation email.";
  }

  revalidatePath(`/owner/testers/${testerProfileId}`);

  return {
    rawToken: result.rawToken,
    expiresAt: result.invitation.expiresAt,
    emailSent,
    emailError,
  };
}

export async function acceptInvitationAction(rawToken: string, displayName: string, formData: unknown) {
  const parsed = acceptInvitationSchema.parse(formData);
  const result = await consumeInvitation(rawToken, parsed.password, displayName, parsed.consentTextVersion);
  return result;
}
