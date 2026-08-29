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
const { eq } = await import("drizzle-orm");

const rows = await db
  .select({
    id: schema.testingAssignments.id,
    sampleId: schema.testingAssignments.sampleId,
    testerProfileId: schema.testingAssignments.testerProfileId,
  })
  .from(schema.testingAssignments)
  .where(eq(schema.testingAssignments.status, "invited"));

for (const r of rows) {
  const [tp] = await db.select().from(schema.testerProfiles).where(eq(schema.testerProfiles.id, r.testerProfileId));
  const [sample] = await db.select().from(schema.physicalSamples).where(eq(schema.physicalSamples.id, r.sampleId));
  console.log(JSON.stringify({ id: r.id, testerEmail: tp?.emailNormalized, sample: sample?.sampleCode }));
}
process.exit(0);
