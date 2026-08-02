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

async function main() {
  const email = process.env.BOOTSTRAP_OWNER_EMAIL?.trim().toLowerCase();
  const name = process.env.BOOTSTRAP_OWNER_NAME?.trim();
  const password = process.env.BOOTSTRAP_OWNER_TEMP_PASSWORD;

  if (!email || !name || !password) {
    console.error("Missing BOOTSTRAP_OWNER_EMAIL / BOOTSTRAP_OWNER_NAME / BOOTSTRAP_OWNER_TEMP_PASSWORD in .env.local.");
    process.exit(1);
  }

  const { db } = await import("../src/db");
  const schema = await import("../src/db/schema");
  const { auth } = await import("../src/lib/auth");

  console.log("Step 1/4: Clearing all existing sample/test data and accounts...");
  // TRUNCATE ... CASCADE handles every foreign-key relationship automatically regardless of
  // table order - this only touches data (rows), never table structure/schema.
  await db.execute(sql`
    TRUNCATE TABLE
      "activity_logs",
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
      "waitlist_subscribers",
      "user_profiles",
      "session",
      "account",
      "verification",
      "user"
    RESTART IDENTITY CASCADE
  `);
  console.log("  Done - all tables cleared.");

  console.log(`Step 2/4: Creating fresh owner account (${email})...`);
  const result = await auth.api.signUpEmail({ body: { email, password, name } });
  if (!result || !result.user) {
    throw new Error("Failed to create owner account using Better Auth signUpEmail.");
  }
  const ownerId = result.user.id;

  await db.insert(schema.userProfiles).values({
    userId: ownerId,
    role: "owner",
    accountStatus: "active",
    displayName: name,
    emailNormalized: email,
    mustChangePassword: true,
  });

  await db.insert(schema.activityLogs).values({
    actorUserId: ownerId,
    action: "owner.bootstrapped",
    targetType: "user_profile",
    targetId: ownerId,
    metadataJson: JSON.stringify({ email }),
  });
  console.log("  Done - owner account created.");

  console.log("Step 3/4: Seeding realistic sample data (suppliers, products, revisions, samples, testers)...");

  // ── Suppliers ──────────────────────────────────────────────────────────
  const [supplierPaddleTech] = await db.insert(schema.suppliers).values({
    name: "PaddleTech Manufacturing Co.",
    code: "PTM-001",
    contactName: "Laura Chen",
    contactEmail: "laura.chen@paddletechmfg.com",
    notes: "Primary carbon-fiber paddle manufacturer. Reliable turnaround on prototype batches, typically 3-4 weeks.",
    status: "active",
    supplierType: "product",
    website: "https://paddletechmfg.com",
    phone: "+1 512 555 0142",
    addressLine1: "4820 Manufacturing Way",
    city: "Austin",
    region: "TX",
    postalCode: "78744",
    country: "USA",
    relationshipStatus: "active",
    createdBy: ownerId,
  }).returning();

  const [supplierCoreFoam] = await db.insert(schema.suppliers).values({
    name: "CoreFoam Composites",
    code: "CFC-002",
    contactName: "Marcus Ibrahim",
    contactEmail: "m.ibrahim@corefoamcomposites.com",
    notes: "Supplies polymer core material for the honeycomb-matrix line. Good QC documentation.",
    status: "active",
    supplierType: "component",
    website: "https://corefoamcomposites.com",
    phone: "+1 619 555 0187",
    city: "San Diego",
    region: "CA",
    postalCode: "92101",
    country: "USA",
    relationshipStatus: "active",
    createdBy: ownerId,
  }).returning();

  // Intentionally has no products/samples yet - realistic "under evaluation" supplier relationship.
  await db.insert(schema.suppliers).values({
    name: "GripWorks Industries",
    code: "GWI-003",
    contactName: "Priya Nair",
    contactEmail: "priya.nair@gripworks.co",
    notes: "New relationship under evaluation for handle wrap and edge guard components.",
    status: "active",
    supplierType: "component",
    website: "https://gripworks.co",
    phone: "+1 704 555 0119",
    city: "Charlotte",
    region: "NC",
    postalCode: "28202",
    country: "USA",
    relationshipStatus: "under_evaluation",
    createdBy: ownerId,
  }).returning();

  // ── Products + Revisions ──────────────────────────────────────────────
  const [productVelocity] = await db.insert(schema.products).values({
    supplierId: supplierPaddleTech.id,
    internalName: "Apex Velocity Pro",
    publicAlias: "Apex Velocity",
    descriptionInternal: "Elongated control-oriented paddle targeting intermediate-to-advanced players seeking spin consistency.",
    publicSummary: "A control-focused paddle built for players who want confident, consistent spin.",
    status: "active",
    isPublic: true,
    shape: "elongated",
    performanceProfile: "control",
    firepowerBalance: "balanced",
    publicState: "candidate",
    createdBy: ownerId,
  }).returning();

  const [revisionVelocity] = await db.insert(schema.productRevisions).values({
    productId: productVelocity.id,
    revisionCode: "REV-1.0",
    revisionReason: "Initial field-test build following concept approval.",
    requestedChanges: "Baseline spec - no prior revision to compare against.",
    supplierReportedChanges: "First production run from finalized mold.",
    internalNotes: "Watch for edge-guard delamination reported in early prototype rounds.",
    publicTitle: "Field Test Build 1.0",
    publicSummary: "Our first field-ready build, currently under active testing.",
    developmentStage: "field_testing",
    isPublic: true,
    shape: "elongated",
    performanceProfile: "control",
    firepowerBalance: "balanced",
    coreThicknessMm: "14",
    overallLengthIn: "16.5",
    overallWidthIn: "7.5",
    handleLengthIn: "5.25",
    gripCircumferenceIn: "4.25",
    targetStaticWeightMinG: "225",
    targetStaticWeightMaxG: "235",
    spinRating: "good",
    feelQuadrant: "b_stiff_hollow",
    publicState: "candidate",
    createdBy: ownerId,
  }).returning();

  const [productStorm] = await db.insert(schema.products).values({
    supplierId: supplierCoreFoam.id,
    internalName: "Storm Elite X1",
    publicAlias: "Storm Elite",
    descriptionInternal: "Widebody power paddle for players prioritizing firepower over touch.",
    publicSummary: "Built for players who want to hit through the ball with confidence.",
    status: "active",
    isPublic: true,
    shape: "widebody",
    performanceProfile: "power",
    firepowerBalance: "power_leaning",
    publicState: "private",
    createdBy: ownerId,
  }).returning();

  const [revisionStorm] = await db.insert(schema.productRevisions).values({
    productId: productStorm.id,
    revisionCode: "REV-1.0",
    revisionReason: "Initial concept-to-prototype build.",
    requestedChanges: "Baseline spec.",
    supplierReportedChanges: "First prototype batch, hand-finished edges.",
    internalNotes: "Awaiting static weight distribution measurements from intake.",
    developmentStage: "prototype",
    isPublic: false,
    shape: "widebody",
    performanceProfile: "power",
    firepowerBalance: "power_leaning",
    coreThicknessMm: "16",
    overallLengthIn: "15.75",
    overallWidthIn: "8.25",
    handleLengthIn: "5.0",
    targetStaticWeightMinG: "235",
    targetStaticWeightMaxG: "245",
    spinRating: "not_yet_rated",
    feelQuadrant: "not_yet_assessed",
    publicState: "private",
    createdBy: ownerId,
  }).returning();

  const [productVortex] = await db.insert(schema.products).values({
    supplierId: supplierPaddleTech.id,
    internalName: "Vortex Carbon Tour",
    publicAlias: "Vortex Tour",
    descriptionInternal: "All-court hybrid paddle, our most versatile shape to date.",
    publicSummary: "A do-it-all paddle for players who don't want to compromise.",
    status: "active",
    isPublic: false,
    shape: "hybrid",
    performanceProfile: "all_court",
    firepowerBalance: "balanced",
    publicState: "private",
    createdBy: ownerId,
  }).returning();

  const [revisionVortex] = await db.insert(schema.productRevisions).values({
    productId: productVortex.id,
    revisionCode: "REV-1.0",
    revisionReason: "Concept validation build.",
    requestedChanges: "Baseline spec.",
    supplierReportedChanges: "Not yet reported - sample newly received.",
    internalNotes: "Just logged, pending intake inspection.",
    developmentStage: "concept",
    isPublic: false,
    shape: "hybrid",
    performanceProfile: "all_court",
    firepowerBalance: "balanced",
    coreThicknessMm: "15",
    overallLengthIn: "16.0",
    overallWidthIn: "7.75",
    spinRating: "not_yet_rated",
    feelQuadrant: "not_yet_assessed",
    publicState: "private",
    createdBy: ownerId,
  }).returning();

  // ── Physical Samples ────────────────────────────────────────────────
  await db.insert(schema.physicalSamples).values([
    {
      sampleCode: "S-APEX-001",
      productId: productVelocity.id,
      revisionId: revisionVelocity.id,
      supplierId: supplierPaddleTech.id,
      receivedAt: new Date(),
      receivingObservations: "Packaging intact, seals unbroken. Surface finish looks clean under inspection light.",
      identifyingNotes: "Matte black finish, serial etched on throat: PTM-24-0091.",
      readinessNote: "Cleared intake inspection, ready for field testing rotation.",
      status: "ready_for_testing",
      statusChangedBy: ownerId,
      inspectionPackagingOk: true,
      inspectionCosmeticOk: true,
      inspectionConstructionOk: true,
      inspectionSoundOk: true,
      createdBy: ownerId,
    },
    {
      sampleCode: "S-STORM-001",
      productId: productStorm.id,
      revisionId: revisionStorm.id,
      supplierId: supplierCoreFoam.id,
      receivedAt: new Date(),
      receivingObservations: "Minor cosmetic scuff on paddle face near the throat, does not affect play surface.",
      identifyingNotes: "Prototype orange trim, hand-labeled 'STORM-P1' on edge guard.",
      readinessNote: "Under review - awaiting static weight measurement before clearing for testing.",
      status: "under_review",
      statusChangedBy: ownerId,
      inspectionPackagingOk: true,
      inspectionCosmeticOk: false,
      inspectionCosmeticNotes: "Small scuff, cosmetic only - monitoring for consistency across batch.",
      inspectionConstructionOk: true,
      createdBy: ownerId,
    },
    {
      sampleCode: "S-VORTEX-001",
      productId: productVortex.id,
      revisionId: revisionVortex.id,
      supplierId: supplierPaddleTech.id,
      receivedAt: new Date(),
      receivingObservations: "Just received, box intact, not yet unpacked for full inspection.",
      identifyingNotes: "Natural carbon finish, no branding applied yet (pre-production sample).",
      readinessNote: "Logged at intake, inspection scheduled.",
      status: "received",
      statusChangedBy: ownerId,
      createdBy: ownerId,
    },
  ]);

  // ── Testers ─────────────────────────────────────────────────────────
  await db.insert(schema.testerProfiles).values([
    {
      emailNormalized: "jordan.martinez@example.com",
      displayName: "Jordan Martinez",
      approvalStatus: "approved",
      approvedAt: new Date(),
      approvedBy: ownerId,
      skillLevel: "4.0",
      playingFrequency: "few_times_week",
      currentPaddle: "Selkirk Vanguard Power Air",
      playStyle: "all_court",
      preferenceControlPower: "control",
      dominantHand: "right",
    },
    {
      emailNormalized: "casey.nguyen@example.com",
      displayName: "Casey Nguyen",
      approvalStatus: "approved",
      approvedAt: new Date(),
      approvedBy: ownerId,
      skillLevel: "4.5",
      playingFrequency: "daily",
      currentPaddle: "JOOLA Perseus",
      playStyle: "aggressive_baseline",
      preferenceControlPower: "power",
      dominantHand: "right",
    },
    {
      emailNormalized: "riley.thompson@example.com",
      displayName: "Riley Thompson",
      approvalStatus: "pending",
      skillLevel: "3.5",
      playingFrequency: "weekly",
      currentPaddle: "Paddletek Bantam TS-5",
      dominantHand: "left",
    },
  ]);

  console.log("  Done - 3 suppliers, 3 products (with revisions), 3 samples, 3 testers seeded.");

  console.log("Step 4/4: Complete.");
  console.log(`\nFresh owner login -> ${email} / ${password}`);
}

main()
  .then(() => {
    console.log("Reset and reseed finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Reset and reseed failed:", err);
    process.exit(1);
  });
