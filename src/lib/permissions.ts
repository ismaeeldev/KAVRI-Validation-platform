import "server-only";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppError } from "./errors";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw AppError.authenticationRequired();
  }

  return session;
}

export async function requireOwner() {
  const session = await requireSession();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, session.user.id),
  });

  if (!profile || profile.role !== "owner") {
    throw AppError.forbidden();
  }

  if (profile.accountStatus !== "active") {
    throw AppError.forbidden("Account is currently deactivated.");
  }

  return { session, profile };
}

export async function requireActiveTester() {
  const session = await requireSession();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, session.user.id),
  });

  if (!profile || profile.role !== "tester") {
    throw AppError.forbidden();
  }

  if (profile.accountStatus !== "active") {
    throw AppError.forbidden("Account is currently deactivated.");
  }

  return { session, profile };
}

export async function requireTesterAssignment(assignmentId: string, testerUserId: string) {
  const assignment = await db.query.testingAssignments.findFirst({
    where: eq(schema.testingAssignments.id, assignmentId),
  });

  if (!assignment) {
    throw AppError.notFound("Testing assignment not found.");
  }

  // Enforce tester isolation
  if (assignment.testerUserId !== testerUserId) {
    throw AppError.forbidden("Access denied to this assignment.");
  }

  return assignment;
}

export async function requireApprovedTesterProfile(testerProfileId: string) {
  const testerProfile = await db.query.testerProfiles.findFirst({
    where: eq(schema.testerProfiles.id, testerProfileId),
  });

  if (!testerProfile) {
    throw AppError.notFound("Tester profile not found.");
  }

  if (testerProfile.approvalStatus !== "approved") {
    throw AppError.invalidState("Tester profile must be approved.");
  }

  return testerProfile;
}

export async function requireSampleReady(sampleId: string) {
  const sample = await db.query.physicalSamples.findFirst({
    where: eq(schema.physicalSamples.id, sampleId),
  });

  if (!sample) {
    throw AppError.notFound("Physical sample not found.");
  }

  if (sample.status !== "ready_for_testing") {
    throw AppError.invalidState("Physical sample is not ready for testing.");
  }

  return sample;
}
