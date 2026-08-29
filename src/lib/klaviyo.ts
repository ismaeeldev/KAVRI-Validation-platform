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
// Uses Klaviyo's public REST API directly (no SDK dependency) - the Profiles "create or update"
// endpoint (via a subscription bulk-create job) which both upserts the profile and opts it in to
// email marketing consent in a single call, matching the single opt-in model from Decision 2.

const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2024-10-15";

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

// Subscribes a profile to email marketing consent via Klaviyo's server-side subscription create
// job - the correct API for a single opt-in signup performed on the subscriber's own behalf
// (no confirmation email step), rather than a bare profile upsert which would not record consent.
// Throws on any non-2xx response or network failure - never resolves successfully without Klaviyo
// actually acknowledging the request.
export async function syncSubscriberToKlaviyo(input: KlaviyoSyncInput): Promise<void> {
  const apiKey = getApiKey();

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
      type: "profile-subscription-bulk-create-job",
      attributes: {
        // No list_id set: profiles are synced with marketing consent + properties for
        // segmentation, per the brief's "use profile properties rather than excessive lists".
        custom_source: input.source,
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email: input.email,
                ...(input.name ? { first_name: input.name } : {}),
                properties,
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
    },
  };

  let response: Response;
  try {
    response = await fetch(`${KLAVIYO_API_BASE}/profile-subscription-bulk-create-jobs/`, {
      method: "POST",
      headers: klaviyoHeaders(apiKey),
      body: JSON.stringify(body),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[klaviyo] Network error syncing ${input.email} to Klaviyo:`, err);
    throw new Error("Failed to reach Klaviyo to sync subscriber.");
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(
      `[klaviyo] Klaviyo API rejected sync for ${input.email} (status ${response.status}):`,
      errorText
    );
    throw new Error(`Klaviyo sync failed (status ${response.status}).`);
  }
}
