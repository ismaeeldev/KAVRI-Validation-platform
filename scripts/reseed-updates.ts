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
dotenv.config({ path: ".env.local" });

async function reseedUpdates() {
  const { db } = await import("../src/db");
  const schema = await import("../src/db/schema");

  console.log("Locating owner user profile...");
  const ownerProfile = await db.query.userProfiles.findFirst({
    where: (up, { eq }) => eq(up.role, "owner"),
  });

  if (!ownerProfile) {
    console.error("No owner user profile found. Please bootstrap the owner first.");
    process.exit(1);
  }

  const userId = ownerProfile.userId;
  console.log(`Found owner user: ${ownerProfile.displayName} (User ID: ${userId})`);

  console.log("Locating first product and revision to associate...");
  const firstProduct = await db.query.products.findFirst({
    with: {
      revisions: {
        limit: 1,
      },
    },
  });

  const productId = firstProduct?.id ?? null;
  const revisionId = firstProduct?.revisions?.[0]?.id ?? null;

  if (productId && firstProduct) {
    console.log(`Associating updates with Product: ${firstProduct.internalName} (ID: ${productId})`);
  } else {
    console.log("No product found. Creating updates without association.");
  }

  console.log("Deleting existing public updates...");
  await db.delete(schema.publicUpdates);
  console.log("Deleted all existing public updates.");

  console.log("Inserting 3 new premium development timeline updates...");
  const updatesData = [
    {
      title: "Composite Core Torsional Rigidity Verification",
      summary: "Completed static stress test cycles for the Apex prototype series. Structural telemetry demonstrates zero matrix fracture or resin delamination under maximum loading configurations.",
      statusLabel: "PASSED",
      developmentStage: "field_testing",
      publishedState: "published" as const,
      sortOrder: 1,
      productId,
      revisionId,
      createdBy: userId,
      updatedBy: userId,
      publishedAt: new Date(),
    },
    {
      title: "Carbon Frame Alignment Calibration",
      summary: "Calibrated manufacturing alignment tolerances on the carbon matrix frames. Structural variance decreased by 42% on incoming prototype batches.",
      statusLabel: "STABILIZED",
      developmentStage: "prototype",
      publishedState: "published" as const,
      sortOrder: 2,
      productId,
      revisionId,
      createdBy: userId,
      updatedBy: userId,
      publishedAt: new Date(),
    },
    {
      title: "Aero Weave Friction Index Validation",
      summary: "Concluded surface frictional abrasion tests under high-velocity friction trials. Frictional wear index matches target durability thresholds for long-duration play cycles.",
      statusLabel: "VERIFIED",
      developmentStage: "prototype",
      publishedState: "published" as const,
      sortOrder: 3,
      productId,
      revisionId,
      createdBy: userId,
      updatedBy: userId,
      publishedAt: new Date(),
    },
  ];

  for (const update of updatesData) {
    await db.insert(schema.publicUpdates).values(update);
    console.log(`Created public update: "${update.title}"`);
  }

  console.log("Reseed complete!");
}

reseedUpdates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reseed failed:", err);
    process.exit(1);
  });
