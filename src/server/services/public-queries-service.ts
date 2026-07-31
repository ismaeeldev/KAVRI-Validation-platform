import "server-only";
import { eq, or, and, isNotNull, count, asc } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

export interface PublicUpdateDTO {
  id: string;
  title: string;
  summary: string;
  statusLabel: string;
  developmentStage: string | null;
  publishedAt: Date | null;
  product: {
    publicAlias: string;
  } | null;
  revision: {
    revisionCode: string;
  } | null;
}

export interface PublicProductDTO {
  id: string;
  publicAlias: string;
  publicSummary: string;
  revisions: {
    id: string;
    revisionCode: string;
    publicTitle: string;
    publicSummary: string;
    developmentStage: string;
  }[];
}

export interface PublicMetricsDTO {
  revisionsCount: number;
  samplesReceived: number;
  approvedTesters: number;
  activeAssignments: number;
  publishedUpdates: number;
}

export async function getPublicUpdatesFeed(): Promise<PublicUpdateDTO[]> {
  const list = await db.query.publicUpdates.findMany({
    where: eq(schema.publicUpdates.publishedState, "published"),
    with: {
      product: true,
      revision: true,
    },
    orderBy: (updates, { asc, desc }) => [asc(updates.sortOrder), desc(updates.publishedAt)],
  });

  return list.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    statusLabel: item.statusLabel,
    developmentStage: item.developmentStage,
    publishedAt: item.publishedAt,
    product: item.product ? { publicAlias: item.product.publicAlias || "Generic Product" } : null,
    revision: item.revision ? { revisionCode: item.revision.revisionCode } : null,
  }));
}

export async function getPublicProducts(): Promise<PublicProductDTO[]> {
  const productsList = await db.query.products.findMany({
    where: eq(schema.products.isPublic, true),
    with: {
      revisions: {
        where: eq(schema.productRevisions.isPublic, true),
        orderBy: (rev, { desc }) => [desc(rev.createdAt)],
      },
    },
  });

  return productsList.map((prod) => ({
    id: prod.id,
    publicAlias: prod.publicAlias || "Generic Product",
    publicSummary: prod.publicSummary || "No public summary provided.",
    revisions: prod.revisions.map((rev) => ({
      id: rev.id,
      revisionCode: rev.revisionCode,
      publicTitle: rev.publicTitle || "Development Revision",
      publicSummary: rev.publicSummary || "Validation testing underway.",
      developmentStage: rev.developmentStage,
    })),
  }));
}

export async function getPublicMetrics(): Promise<PublicMetricsDTO> {
  // 1. Revisions documented (count of public revisions)
  const [revisionsRow] = await db
    .select({ count: count() })
    .from(schema.productRevisions)
    .where(eq(schema.productRevisions.isPublic, true));

  // 2. Samples received (total samples logged)
  const [samplesRow] = await db.select({ count: count() }).from(schema.physicalSamples);

  // 3. Approved testers (total approved tester profiles)
  const [testersRow] = await db
    .select({ count: count() })
    .from(schema.testerProfiles)
    .where(eq(schema.testerProfiles.approvalStatus, "approved"));

  // 4. Assignments active (invited + acknowledged status count)
  const [assignmentsRow] = await db
    .select({ count: count() })
    .from(schema.testingAssignments)
    .where(
      or(
        eq(schema.testingAssignments.status, "invited"),
        eq(schema.testingAssignments.status, "acknowledged")
      )
    );

  // 5. Updates published (published update count)
  const [updatesRow] = await db
    .select({ count: count() })
    .from(schema.publicUpdates)
    .where(eq(schema.publicUpdates.publishedState, "published"));

  return {
    revisionsCount: revisionsRow?.count ?? 0,
    samplesReceived: samplesRow?.count ?? 0,
    approvedTesters: testersRow?.count ?? 0,
    activeAssignments: assignmentsRow?.count ?? 0,
    publishedUpdates: updatesRow?.count ?? 0,
  };
}

export interface PublicWhatChangedDTO {
  id: string;
  publicVersion: string;
  evidenceStrength: string | null;
  decisionDate: Date;
}

// "What Changed and Why" (Step 15) — only decisions whose author explicitly wrote a
// publicVersion AND whose parent revision/product has been exposed publicly. closeoutDecisions
// is polymorphic (scope + scopeId, no FK), so each scope type needs its own join; scope='round'
// is excluded because test_rounds has no publicState gate to check against.
export async function getPublicWhatChangedAndWhy(): Promise<PublicWhatChangedDTO[]> {
  const revisionScoped = await db
    .select({
      id: schema.closeoutDecisions.id,
      publicVersion: schema.closeoutDecisions.publicVersion,
      evidenceStrength: schema.closeoutDecisions.evidenceStrength,
      decisionDate: schema.closeoutDecisions.decisionDate,
    })
    .from(schema.closeoutDecisions)
    .innerJoin(schema.productRevisions, eq(schema.productRevisions.id, schema.closeoutDecisions.scopeId))
    .where(
      and(
        eq(schema.closeoutDecisions.scope, "revision"),
        isNotNull(schema.closeoutDecisions.publicVersion),
        or(eq(schema.productRevisions.publicState, "candidate"), eq(schema.productRevisions.publicState, "published"))
      )
    );

  const productScoped = await db
    .select({
      id: schema.closeoutDecisions.id,
      publicVersion: schema.closeoutDecisions.publicVersion,
      evidenceStrength: schema.closeoutDecisions.evidenceStrength,
      decisionDate: schema.closeoutDecisions.decisionDate,
    })
    .from(schema.closeoutDecisions)
    .innerJoin(schema.products, eq(schema.products.id, schema.closeoutDecisions.scopeId))
    .where(
      and(
        eq(schema.closeoutDecisions.scope, "product"),
        isNotNull(schema.closeoutDecisions.publicVersion),
        or(eq(schema.products.publicState, "candidate"), eq(schema.products.publicState, "published"))
      )
    );

  return [...revisionScoped, ...productScoped]
    .filter((row): row is typeof row & { publicVersion: string } => Boolean(row.publicVersion))
    .sort((a, b) => b.decisionDate.getTime() - a.decisionDate.getTime());
}

export interface PublicSampleSummaryDTO {
  alias: string;
  statusLabel: string;
}

const SAMPLE_STATUS_LABELS: Record<string, string> = {
  received: "Received",
  under_review: "Under Review",
  ready_for_testing: "Ready for Testing",
  assigned: "In Field Testing",
  blocked: "On Hold",
  rejected: "Did Not Pass Inspection",
  returned: "Testing Complete",
  retired: "Retired",
};

// Anonymous sample cards (Step 15 item 7) — deliberately returns only a generated alias
// ("Specimen A/B/C") and a status-safe label. No sampleCode, supplierId, or notes fields.
export async function getPublicSampleSummaries(): Promise<PublicSampleSummaryDTO[]> {
  const rows = await db
    .select({
      status: schema.physicalSamples.status,
      receivedAt: schema.physicalSamples.receivedAt,
    })
    .from(schema.physicalSamples)
    .innerJoin(schema.productRevisions, eq(schema.productRevisions.id, schema.physicalSamples.revisionId))
    .where(
      or(eq(schema.productRevisions.publicState, "candidate"), eq(schema.productRevisions.publicState, "published"))
    )
    .orderBy(asc(schema.physicalSamples.receivedAt));

  return rows.map((row, idx) => ({
    alias: `Specimen ${String.fromCharCode(65 + idx)}`,
    statusLabel: SAMPLE_STATUS_LABELS[row.status] ?? "In Progress",
  }));
}
