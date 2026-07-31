import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { logActivity } from "./activity-service";

export async function getWaitlistSubscribers() {
  return await db.query.waitlistSubscribers.findMany({
    orderBy: (sub, { desc }) => [desc(sub.createdAt)],
  });
}

interface WaitlistSignupInput {
  email: string;
  honeypot?: string;
  ctaSource?: string;
  interestType?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ref?: string;
  consentTextVersion?: string;
}

export async function addToWaitlist(data: WaitlistSignupInput) {
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

  // Referral detection takes precedence over the form's own default source, since it
  // identifies the true acquisition channel regardless of which form was used.
  const signupSource = data.ref ? "referral" : "landing_page";

  const [newSub] = await db
    .insert(schema.waitlistSubscribers)
    .values({
      email: data.email,
      emailNormalized,
      signupSource,
      ctaSource: data.ctaSource || null,
      interestType: data.interestType || "all",
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      consentTextVersion: data.consentTextVersion || null,
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

interface TesterApplicationInput {
  name: string;
  email: string;
  skillLevel?: string;
  applicationNotes?: string;
  consentTextVersion: string;
  honeypot?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ref?: string;
}

// Reuses the waitlist table rather than a new one - a tester application at this stage is still
// fundamentally "someone who wants to hear from us, plus interest in testing," so it doesn't
// need a parallel identity/dedupe structure. testerInterest=true is a signal only; it does NOT
// create a testerProfiles row (that remains an owner-only action from the Testers module).
export async function applyToTest(data: TesterApplicationInput) {
  const emailNormalized = data.email.trim().toLowerCase();

  if (data.honeypot) {
    return { success: true, duplicate: false, message: "Application received." };
  }

  const signupSource = data.ref ? "referral" : "tester_form";

  const existing = await db.query.waitlistSubscribers.findFirst({
    where: eq(schema.waitlistSubscribers.emailNormalized, emailNormalized),
  });

  if (existing) {
    // Upgrade the existing record with tester-application data rather than silently no-op'ing -
    // someone already on the general list who then applies to test should have that reflected.
    const [updated] = await db
      .update(schema.waitlistSubscribers)
      .set({
        name: data.name,
        testerInterest: true,
        applicationSkillLevel: data.skillLevel || null,
        applicationNotes: data.applicationNotes || null,
        consentTextVersion: data.consentTextVersion,
      })
      .where(eq(schema.waitlistSubscribers.id, existing.id))
      .returning();

    await logActivity(null, "waitlist.tester_application_merged", "waitlist_subscriber", existing.id, {});

    return { id: updated.id, success: true, duplicate: true, message: "Application received." };
  }

  const [newSub] = await db
    .insert(schema.waitlistSubscribers)
    .values({
      email: data.email,
      emailNormalized,
      name: data.name,
      signupSource,
      interestType: "tester_opportunities",
      testerInterest: true,
      applicationSkillLevel: data.skillLevel || null,
      applicationNotes: data.applicationNotes || null,
      consentTextVersion: data.consentTextVersion,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      status: "active",
      consentAt: new Date(),
    })
    .returning();

  await logActivity(null, "waitlist.tester_application_submitted", "waitlist_subscriber", newSub.id, {});

  return { id: newSub.id, success: true, duplicate: false, message: "Application received." };
}

