import React from "react";
import { getRevisionById } from "@/server/services/product-service";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { RevisionEditForm } from "@/components/brand/revision-edit-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string; revId: string }>;
}

export default async function EditRevisionPage({ params }: PageProps) {
  const { id, revId } = await params;
  const revision = await getRevisionById(revId);

  const linkedSample = await db.query.physicalSamples.findFirst({
    where: eq(schema.physicalSamples.revisionId, revId),
  });

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Edit Revision ${revision.revisionCode}`}
        eyebrow="Update Specification"
        description={`Modify configuration and assessment fields for ${revision.product.internalName}.`}
        backHref={`/owner/products/${id}/revisions/${revId}`}
        backLabel="Back to revision"
      />
      <RevisionEditForm productId={id} revision={revision} isLocked={!!linkedSample} />
    </div>
  );
}
