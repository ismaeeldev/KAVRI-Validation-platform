import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Step 6 / Decision 3: enables signIn.magicLink for the tester sign-in page. Additive only -
  // signIn.email (owner/admin) is unchanged.
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
