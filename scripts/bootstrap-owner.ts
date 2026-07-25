import { Module } from "module";

// Shim 'server-only' for raw Node.js script environments
const originalRequire = Module.prototype.require;
Module.prototype.require = function (this: unknown, ...args: Parameters<typeof originalRequire>) {
  if (args[0] === "server-only") {
    return {};
  }
  return originalRequire.apply(this, args);
};

import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function bootstrapOwner() {
  const email = process.env.BOOTSTRAP_OWNER_EMAIL?.trim().toLowerCase();
  const name = process.env.BOOTSTRAP_OWNER_NAME?.trim();
  const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD;

  if (!email || !name || !password) {
    console.error("Missing bootstrap environment variables. Verify BOOTSTRAP_OWNER_EMAIL, BOOTSTRAP_OWNER_NAME, and BOOTSTRAP_OWNER_TEMP_PASSWORD are set.");
    process.exit(1);
  }

  // Dynamic imports to prevent static server-only module hoisting error
  const { db } = await import("../src/db");
  const schema = await import("../src/db/schema");
  const { auth } = await import("../src/lib/auth");

  console.log(`Checking if owner account ${email} already exists...`);

  // Verify if the auth user exists
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  });

  if (existingUser) {
    console.log("An account with this email already exists. Skipping owner bootstrap to prevent duplicates.");
    return;
  }

  console.log("Creating new owner auth user...");
  
  // Create user using Better Auth API (hashes password correctly)
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  if (!result || !result.user) {
    throw new Error("Failed to create owner account using Better Auth signUpEmail.");
  }

  console.log(`Created auth user with ID: ${result.user.id}. Creating KAVRI user profile...`);

  // Persist KAVRI profile
  await db.insert(schema.userProfiles).values({
    userId: result.user.id,
    role: "owner",
    accountStatus: "active",
    displayName: name,
    emailNormalized: email,
    mustChangePassword: true,
  });

  // Log initial bootstrap activity
  await db.insert(schema.activityLogs).values({
    actorUserId: result.user.id,
    action: "owner.bootstrapped",
    targetType: "user_profile",
    targetId: result.user.id,
    metadataJson: JSON.stringify({ email }),
  });

  console.log("Successfully bootstrapped the owner account. Credentials saved to database.");
}

bootstrapOwner()
  .then(() => {
    console.log("Bootstrap complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Bootstrap failed with error:", err);
    process.exit(1);
  });
