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
import { sql } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function checkHealth() {
  console.log("Testing database connection health...");
  try {
    // Dynamic import to ensure the require shim is active before loading db
    const { db } = await import("../src/db");
    const result = await db.execute(sql`SELECT 1 as connected`);
    console.log("Database connectivity check succeeded:", result);
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed. Verify DATABASE_URL is correct and active.", error);
    process.exit(1);
  }
}

checkHealth();
