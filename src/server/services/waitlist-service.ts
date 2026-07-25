import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

export async function getWaitlistSubscribers() {
  return await db.query.waitlistSubscribers.findMany({
    orderBy: (sub, { desc }) => [desc(sub.createdAt)],
  });
}

export async function addToWaitlist(data: { email: string; honeypot?: string }) {
  const emailNormalized = data.email.trim().toLowerCase();

  // 1. Honeypot check: if filled, simulate a safe duplicate/successful action
  if (data.honeypot) {
    return {
      success: true,
      duplicate: false,
      message: "Subscription processed successfully.",
    };
  }

  // 2. Duplicate checks: return a privacy-safe duplicate payload
  const existing = await db.query.waitlistSubscribers.findFirst({
    where: eq(schema.waitlistSubscribers.emailNormalized, emailNormalized),
  });
  if (existing) {
    return {
      success: true,
      duplicate: true,
      message: "Subscription processed successfully.",
    };
  }

  const [newSub] = await db
    .insert(schema.waitlistSubscribers)
    .values({
      email: data.email,
      emailNormalized,
      signupSource: "landing_page",
      status: "active",
      consentAt: new Date(),
    })
    .returning();

  return {
    id: newSub.id,
    success: true,
    duplicate: false,
    message: "Subscription processed successfully.",
  };
}
