import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { logActivity } from "./activity-service";
import { sendTesterApplicationConfirmationEmail } from "@/lib/email";
import { syncSubscriberToKlaviyo } from "@/lib/klaviyo";

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
      // Decision 2: "Join the Build" is single opt-in by definition - submitting the form IS the
      // marketing consent, so this is always true here (never a client-supplied value).
      marketingConsent: true,
    })
    .returning();

  // Decision 2: sync to Klaviyo immediately on submit (single opt-in, no confirmation step).
  // Best-effort and non-blocking - the KAVRI-side record above already succeeded and is the
  // source of truth regardless of whether this succeeds.
  await syncToKlaviyoBestEffort(newSub.id, {
    email: data.email,
    source: "join_the_build",
    ctaSource: data.ctaSource,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    consentTextVersion: data.consentTextVersion,
  });

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
  // Decision 2: optional, unchecked-by-default "Also send me KAVRI development & launch updates"
  // checkbox - entirely separate from the required application consent above. Klaviyo sync only
  // fires when this is true; the application itself always saves either way.
  marketingConsent?: boolean;
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
        marketingConsent: data.marketingConsent === true,
      })
      .where(eq(schema.waitlistSubscribers.id, existing.id))
      .returning();

    await logActivity(null, "waitlist.tester_application_merged", "waitlist_subscriber", existing.id, {});

    const { emailSent, emailError } = await sendApplicationConfirmation(data.email, data.name);

    // Decision 2: Klaviyo sync only if the optional checkbox was checked. Never blocks or
    // rolls back the application record above, which has already saved successfully.
    if (data.marketingConsent === true) {
      await syncToKlaviyoBestEffort(updated.id, {
        email: data.email,
        name: data.name,
        source: "apply_to_test",
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        consentTextVersion: data.consentTextVersion,
      });
    }

    return { id: updated.id, success: true, duplicate: true, message: "Application received.", emailSent, emailError };
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
      marketingConsent: data.marketingConsent === true,
    })
    .returning();

  await logActivity(null, "waitlist.tester_application_submitted", "waitlist_subscriber", newSub.id, {});

  const { emailSent, emailError } = await sendApplicationConfirmation(data.email, data.name);

  // Decision 2: Klaviyo sync only if the optional checkbox was checked. Never blocks or rolls
  // back the application record above, which has already saved successfully.
  if (data.marketingConsent === true) {
    await syncToKlaviyoBestEffort(newSub.id, {
      email: data.email,
      name: data.name,
      source: "apply_to_test",
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      consentTextVersion: data.consentTextVersion,
    });
  }

  return { id: newSub.id, success: true, duplicate: false, message: "Application received.", emailSent, emailError };
}

// Matrix row "Tester application" (applicant channel: on-screen + email). The application
// record above always succeeds or throws on its own - the confirmation email is a best-effort
// follow-up wrapped in its own try/catch so a Resend failure never turns a successful
// application into an error response (the on-screen "Application received" state already
// satisfies the on-screen half of the required channel), while the caller can still surface a
// real emailSent/emailError state rather than silently pretending delivery happened.
async function sendApplicationConfirmation(email: string, name: string) {
  try {
    await sendTesterApplicationConfirmationEmail(email, name);
    return { emailSent: true, emailError: null as string | null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[waitlist-service] Failed to send tester application confirmation to ${email}:`, err);
    return { emailSent: false, emailError: err.message || "Failed to send application confirmation email." };
  }
}

// Step 7 (Decision 2): wraps syncSubscriberToKlaviyo in its own try/catch, exactly mirroring
// sendApplicationConfirmation's best-effort pattern above - the waitlistSubscribers row this is
// called for has ALREADY been saved successfully before this runs. A Klaviyo failure (including
// the expected fail-loud "not configured" error when KLAVIYO_PRIVATE_API_KEY is absent) must
// never roll back or block the underlying signup/application; it is only recorded here for
// owner-side observability, never surfaced as a reason the KAVRI-side action failed.
async function syncToKlaviyoBestEffort(
  subscriberId: string,
  input: {
    email: string;
    name?: string;
    source: string;
    ctaSource?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    consentTextVersion?: string;
  }
): Promise<void> {
  try {
    await syncSubscriberToKlaviyo(input);
    await db
      .update(schema.waitlistSubscribers)
      .set({ klaviyoSyncedAt: new Date(), klaviyoSyncError: null })
      .where(eq(schema.waitlistSubscribers.id, subscriberId));
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[waitlist-service] Klaviyo sync failed for ${input.email}:`, err);
    await db
      .update(schema.waitlistSubscribers)
      .set({ klaviyoSyncError: err.message || "Klaviyo sync failed." })
      .where(eq(schema.waitlistSubscribers.id, subscriberId));
  }
}

