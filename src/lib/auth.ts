import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendPasswordResetEmail, sendMagicLinkEmail } from "./email";

// Step 6 / Decision 3: magic links are a TESTER-ONLY authentication path. Owner/admin accounts
// keep email + password below and must never be able to bypass it with an emailed link.
export const MAGIC_LINK_EXPIRES_IN_SECONDS = 60 * 15;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // A missing RESEND_API_KEY must never look like a successfully-sent email to the user -
    // sendPasswordResetEmail throws loudly in that case, and better-auth surfaces that as a
    // request failure rather than a false "email sent" success (Step 16 item 2).
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  // Disable public sign up
  onSignUp: {
    disableSignUp: true,
  },
  // Explicit session lifetime rather than relying on undocumented framework defaults (Step 16
  // item 1). 7-day expiry with a daily sliding refresh on activity - adjust here if the client's
  // risk tolerance differs.
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    // Step 6 (Workstream E, Decision 3). Additive only - the emailAndPassword provider above is
    // untouched, so the owner/admin login at /login behaves exactly as before.
    magicLink({
      expiresIn: MAGIC_LINK_EXPIRES_IN_SECONDS,
      // Never provision an account from a link request; testers are created by the owner and
      // activated through the existing invitation flow.
      disableSignUp: true,
      sendMagicLink: async ({ email, url }) => {
        // Role gate: only an active tester profile may receive a magic link. Owner/admin accounts
        // are password-only. We return without sending (rather than throwing) for a non-tester or
        // unknown address so the sign-in page cannot be used to enumerate which emails exist or
        // which of them are owners.
        const normalized = email.trim().toLowerCase();
        const account = await db.query.user.findFirst({
          where: eq(schema.user.email, normalized),
        });
        if (!account) {
          console.warn(`[auth] Magic link requested for unknown email ${normalized} - not sent.`);
          return;
        }

        const profile = await db.query.userProfiles.findFirst({
          where: eq(schema.userProfiles.userId, account.id),
        });
        if (!profile || profile.role !== "tester" || profile.accountStatus !== "active") {
          console.warn(
            `[auth] Magic link requested for non-tester or inactive account ${normalized} - not sent.`
          );
          return;
        }

        // In development the key is usually absent; log the link so the flow stays testable
        // without inventing an insecure production bypass. Never logged outside development.
        if (process.env.NODE_ENV !== "production") {
          console.info(`[auth][dev] Magic link for ${normalized}: ${url}`);
        }

        await sendMagicLinkEmail(normalized, url, Math.round(MAGIC_LINK_EXPIRES_IN_SECONDS / 60));
      },
    }),
  ],
  advanced: {
    cookiePrefix: "kavri",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXT_PUBLIC_APP_URL!,
  ].filter(Boolean),
});
