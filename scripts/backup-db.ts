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
import * as fs from "fs";
import * as path from "path";
import { is, Table } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function backup() {
  const { db } = await import("../src/db");
  const schema = await import("../src/db/schema");

  const tables: Record<string, unknown> = {};
  let totalRows = 0;

  for (const [name, table] of Object.entries(schema)) {
    // Only actual Drizzle Table instances; skip relations()/enums/types/consts.
    if (!is(table, Table)) continue;
    try {
      const rows = await db.select().from(table as never);
      tables[name] = rows;
      totalRows += rows.length;
      console.log(`  ${name}: ${rows.length} rows`);
    } catch (err) {
      console.warn(`  Skipped ${name} (not a queryable table):`, (err as Error).message);
    }
  }

  const backupDir = path.join(process.cwd(), "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(backupDir, `pre-sprint1-rev-baseline-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(tables, null, 2));

  console.log(`\nBackup complete: ${outPath}`);
  console.log(`Total rows backed up: ${totalRows}`);
  process.exit(0);
}

backup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
