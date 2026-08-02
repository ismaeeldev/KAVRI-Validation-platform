import { Module } from "module";
const originalRequire = Module.prototype.require;
Module.prototype.require = function (this: unknown, ...args: Parameters<typeof originalRequire>) {
  if (args[0] === "server-only") return {};
  return originalRequire.apply(this, args);
};

import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

// Clears only sample/domain data (suppliers, products, revisions, samples, testers, and every
// dependent table). Deliberately does NOT touch "user", "session", "account", "verification",
// or "user_profiles" - the admin/owner account is left exactly as-is.
async function main() {
  const { db } = await import("../src/db");

  console.log("Clearing sample data (admin account left untouched)...");
  await db.execute(sql`
    TRUNCATE TABLE
      "photo_attachments",
      "closeout_evidence_links",
      "closeout_decisions",
      "issue_reports",
      "evaluations",
      "play_sessions",
      "testing_assignments",
      "test_round_revisions",
      "test_rounds",
      "tester_invitations",
      "tester_profiles",
      "product_certifications",
      "physical_samples",
      "product_revisions",
      "products",
      "suppliers",
      "public_updates",
      "waitlist_subscribers"
    RESTART IDENTITY CASCADE
  `);
  console.log("Done - all sample data cleared. Admin account and activity log untouched.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("Failed to clear sample data:", err);
  process.exit(1);
});
