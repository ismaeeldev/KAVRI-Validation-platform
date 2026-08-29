import { Module } from "module";
const originalRequire = Module.prototype.require;
Module.prototype.require = function (...args) {
  if (args[0] === "server-only") return {};
  return originalRequire.apply(this, args);
};
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { db } = await import("../src/db/index.ts");
const schema = await import("../src/db/schema/index.ts");
const { desc } = await import("drizzle-orm");

const rows = await db.select().from(schema.verification).orderBy(desc(schema.verification.createdAt)).limit(1);
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
