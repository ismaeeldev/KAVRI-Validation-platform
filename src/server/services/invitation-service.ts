import "server-only";
import crypto from "crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import { auth } from "@/lib/auth";

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createInvitation(testerProfileId: string, creatorUserId: string) {
  const ttlHours = parseInt(process.env.TESTER_INVITATION_TTL_HOURS || "72", 10);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);

  const result = await db.transaction(async (tx) => {
    // 1. Revoke existing invitations for this tester
    await tx
      .update(schema.testerInvitations)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(schema.testerInvitations.testerProfileId, testerProfileId),
          isNull(schema.testerInvitations.usedAt),
          isNull(schema.testerInvitations.revokedAt)
        )
      );

    // 2. Insert new invitation
    const [invitation] = await tx
      .insert(schema.testerInvitations)
      .values({
        testerProfileId,
        tokenHash,
        expiresAt,
        createdBy: creatorUserId,
      })
      .returning();

    // 3. Log activity
    await tx.insert(schema.activityLogs).values({
      actorUserId: creatorUserId,
      action: "tester.invitation_created",
      targetType: "tester_profile",
      targetId: testerProfileId,
    });

    return invitation;
  });

  return {
    rawToken,
    invitation: result,
  };
}

export async function verifyInvitation(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const invitation = await db.query.testerInvitations.findFirst({
    where: eq(schema.testerInvitations.tokenHash, tokenHash),
    with: {
      testerProfile: true,
    },
  });

  if (!invitation) {
    throw AppError.tokenInvalid("The invitation link is invalid or malformed.");
  }

  if (invitation.usedAt) {
    throw AppError.tokenUsed("This invitation link has already been used.");
  }

  if (invitation.revokedAt) {
    throw AppError.tokenInvalid("This invitation link has been revoked.");
  }

  if (new Date() > invitation.expiresAt) {
    throw AppError.tokenExpired("This invitation link has expired.");
  }

  return invitation;
}

export async function consumeInvitation(
  rawToken: string,
  password: string,
  displayName: string,
  consentTextVersion: string
) {
  return await db.transaction(async (tx) => {
    // 1. Verify invitation status inside the transaction boundary
    const tokenHash = hashToken(rawToken);
    const invitation = await tx.query.testerInvitations.findFirst({
      where: eq(schema.testerInvitations.tokenHash, tokenHash),
    });

    if (!invitation || invitation.usedAt || invitation.revokedAt || new Date() > invitation.expiresAt) {
      throw AppError.tokenInvalid("Invitation token verification failed.");
    }

    const testerProfile = await tx.query.testerProfiles.findFirst({
      where: eq(schema.testerProfiles.id, invitation.testerProfileId),
    });

    if (!testerProfile) {
      throw AppError.notFound("Tester profile not found.");
    }

    if (testerProfile.approvalStatus !== "approved") {
      throw AppError.invalidState("Tester profile must be approved before activating account.");
    }

    // 2. Create the auth credentials account
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: testerProfile.emailNormalized,
        password,
        name: displayName,
      },
    });

    if (!signUpResult || !signUpResult.user) {
      throw new Error("Failed to create credential account in Better Auth.");
    }

    const userId = signUpResult.user.id;

    // 3. Update tester profile to link user_id and record consent - required before testing
    // per the audit; captured at acceptance time, not at owner-side creation.
    await tx
      .update(schema.testerProfiles)
      .set({
        userId,
        displayName,
        consentAt: new Date(),
        consentTextVersion,
        updatedAt: new Date(),
      })
      .where(eq(schema.testerProfiles.id, testerProfile.id));

    // 4. Create user profile
    await tx.insert(schema.userProfiles).values({
      userId,
      role: "tester",
      accountStatus: "active",
      displayName,
      emailNormalized: testerProfile.emailNormalized,
      mustChangePassword: false,
    });

    // 5. Mark invitation used
    await tx
      .update(schema.testerInvitations)
      .set({ usedAt: new Date() })
      .where(eq(schema.testerInvitations.id, invitation.id));

    // 6. Log activity
    await tx.insert(schema.activityLogs).values({
      actorUserId: userId,
      action: "tester.onboarded",
      targetType: "tester_profile",
      targetId: testerProfile.id,
    });

    return { userId, testerProfileId: testerProfile.id };
  });
}
