"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { AppError } from "@/lib/errors";

export async function changePasswordAction(oldPassword: string, newPassword: string) {
  const currentHeaders = await headers();
  const session = await auth.api.getSession({
    headers: currentHeaders,
  });

  if (!session || !session.user) {
    throw AppError.authenticationRequired("Must be authenticated to change password.");
  }

  // Update password using Better Auth API
  await auth.api.changePassword({
    body: {
      currentPassword: oldPassword,
      newPassword: newPassword,
    },
    headers: currentHeaders,
  });

  // Clear mustChangePassword field on the user profile
  await db
    .update(schema.userProfiles)
    .set({ mustChangePassword: false, updatedAt: new Date() })
    .where(eq(schema.userProfiles.userId, session.user.id));

  // Log password change activity
  await db.insert(schema.activityLogs).values({
    actorUserId: session.user.id,
    action: "password.changed",
    targetType: "user_profile",
    targetId: session.user.id,
  });

  return { success: true };
}

export async function getCurrentUserRoleAction() {
  const currentHeaders = await headers();
  const session = await auth.api.getSession({
    headers: currentHeaders,
  });

  if (!session || !session.user) {
    return { role: null };
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, session.user.id),
  });

  return { role: profile?.role || null };
}
