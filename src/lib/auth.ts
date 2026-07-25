import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Disable public sign up
  onSignUp: {
    disableSignUp: true,
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
