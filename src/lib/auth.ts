import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendPasswordResetEmail } from "./email";

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
