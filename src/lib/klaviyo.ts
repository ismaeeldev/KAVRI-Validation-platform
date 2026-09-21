import "server-only";

// Step 7 (Workstream F, Decision 2): server-side Klaviyo sync for the public waitlist/tester
// paths. KLAVIYO_PRIVATE_API_KEY is a Klaviyo "Private API Key" (Account > Settings > API Keys)
// with at least profile/subscription write scope - it must NEVER be exposed to client code
// (this file is "server-only" and is only ever imported from server actions/services).
//
// Same fail-loudly pattern as src/lib/email.ts: if KLAVIYO_PRIVATE_API_KEY is absent at runtime,
// this throws a clear error rather than silently doing nothing - a missing key must never produce
// a misleading "synced to Klaviyo" success. Per Decision 2, KAVRI's own database (waitlistSubscribers)
// is always the source of truth for consent/source/UTM regardless of whether this call succeeds -
// callers must treat a thrown error here as best-effort and non-fatal to the underlying signup or
// application record (see waitlist-service.ts syncToKlaviyo wrapper).
//
// Two separate Klaviyo API calls, not one: the "profile-subscription-bulk-create-jobs" endpoint
// (used below to record marketing consent) only accepts email/phone_number/subscriptions/
// age_gated_date_of_birth on each profile - first_name and properties are rejected there with a
// 400 ("'properties' is not a valid field for the resource 'profile'"), confirmed against a real
// Klaviyo account. Properties and first_name must go through the separate profile-import
// (create-or-update) endpoint instead. We call profile-import first so the properties exist on
// the profile before consent is recorded, then call the subscription job for consent itself.

const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2026-07-15";

// KAVRI — Follow the Build (single opt-in). Without this relationship, a subscribe job still
// records "SUBSCRIBED" consent on the profile but never actually adds it to any list — which is
// exactly what happened in production: the API call was silently "succeeding" (200/202, no error
// thrown, klaviyoSyncedAt populated) while the list itself stayed at zero members, because no
// list_id was ever set. Confirmed against the client-provided List ID before this fix.
const KLAVIYO_LIST_ID = "X6vRnV";

interface KlaviyoSyncInput {
  email: string;
  name?: string;
  source: string; // e.g. 'join_the_build' | 'apply_to_test'
  ctaSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  consentTextVersion?: string;
}

function getApiKey(): string {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Klaviyo is not configured on this deployment (KLAVIYO_PRIVATE_API_KEY is missing). Contact the developer."
    );
  }
  return apiKey;
}

function klaviyoHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
    revision: KLAVIYO_REVISION,
  };
}

async function klaviyoPost(apiKey: string, path: string, body: unknown, email: string, step: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${KLAVIYO_API_BASE}${path}`, {
      method: "POST",
      headers: klaviyoHeaders(apiKey),
      body: JSON.stringify(body),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[klaviyo] Network error during ${step} for ${email}:`, err);
    throw new Error(`Failed to reach Klaviyo during ${step}.`);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(`[klaviyo] Klaviyo API rejected ${step} for ${email} (status ${response.status}):`, errorText);
    throw new Error(`Klaviyo ${step} failed (status ${response.status}).`);
  }
}

// Upserts profile properties (signup source, CTA source, UTM attribution, consent text version)
// via Klaviyo's profile-import (create-or-update) endpoint. Must run before the subscription
// job below, since that endpoint cannot carry properties itself.
async function upsertProfileProperties(apiKey: string, input: KlaviyoSyncInput): Promise<void> {
  const properties: Record<string, string> = {
    signup_source: input.source,
  };
  if (input.ctaSource) properties.cta_source = input.ctaSource;
  if (input.utmSource) properties.utm_source = input.utmSource;
  if (input.utmMedium) properties.utm_medium = input.utmMedium;
  if (input.utmCampaign) properties.utm_campaign = input.utmCampaign;
  if (input.consentTextVersion) properties.consent_text_version = input.consentTextVersion;

  const body = {
    data: {
      type: "profile",
      attributes: {
        email: input.email,
        ...(input.name ? { first_name: input.name } : {}),
        properties,
      },
    },
  };

  await klaviyoPost(apiKey, "/profile-import", body, input.email, "profile property upsert");
}

// Subscribes a profile to email marketing consent via Klaviyo's server-side subscription create
// job - the correct API for a single opt-in signup performed on the subscriber's own behalf
// (no confirmation email step), rather than a bare profile upsert which would not record consent.
// Throws on any non-2xx response or network failure - never resolves successfully without Klaviyo
// actually acknowledging the request.
async function subscribeToMarketing(apiKey: string, input: KlaviyoSyncInput): Promise<void> {
  const body = {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        custom_source: input.source,
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email: input.email,
                subscriptions: {
                  email: {
                    marketing: {
                      consent: "SUBSCRIBED",
                    },
                  },
                },
              },
            },
          ],
        },
      },
      // Without this relationship, Klaviyo records consent on the profile but never adds it to
      // any list — the job still returns success with no error, so this must not be omitted.
      relationships: {
        list: {
          data: {
            type: "list",
            id: KLAVIYO_LIST_ID,
          },
        },
      },
    },
  };

  await klaviyoPost(apiKey, "/profile-subscription-bulk-create-jobs/", body, input.email, "marketing consent subscription");
}

export async function syncSubscriberToKlaviyo(input: KlaviyoSyncInput): Promise<void> {
  const apiKey = getApiKey();
  await upsertProfileProperties(apiKey, input);
  await subscribeToMarketing(apiKey, input);
}
