import { Module } from "module";
const originalRequire = Module.prototype.require;
Module.prototype.require = function (...args) {
  if (args[0] === "server-only") return {};
  return originalRequire.apply(this, args);
};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const schemaAuth = await import("../src/db/schema/auth.ts").catch(() => null);
const schemaIndex = await import("../src/db/schema/index.ts").catch(() => null);
const { db } = await import("../src/db/index.ts");

// Try to find whatever table better-auth's magic-link plugin uses (commonly "verification").
const schema = schemaAuth || schemaIndex;
console.log("Schema keys:", Object.keys(schema).filter(k => /verif|token|magic/i.test(k)));

if (schema.verification) {
  const { desc } = await import("drizzle-orm");
  const rows = await db.select().from(schema.verification).orderBy(desc(schema.verification.createdAt)).limit(5);
  console.log("Recent verification rows:", JSON.stringify(rows, null, 2));
}
process.exit(0);
