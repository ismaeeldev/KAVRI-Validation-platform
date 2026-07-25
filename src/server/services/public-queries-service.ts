import "server-only";
import { eq, or, count } from "drizzle-orm";
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

  // 4. Assignments active (active + acknowledged status count)
  const [assignmentsRow] = await db
    .select({ count: count() })
    .from(schema.testingAssignments)
    .where(
      or(
        eq(schema.testingAssignments.status, "active"),
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
