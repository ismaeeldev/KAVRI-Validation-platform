import React from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { PublicUpdateForm } from "@/components/brand/public-update-form";
import { getPublicUpdateById } from "@/server/services/public-update-service";
import { db } from "@/db";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPublicUpdatePage({ params }: PageProps) {
  const { id } = await params;
  const update = await getPublicUpdateById(id);

  const products = await db.query.products.findMany({
    orderBy: (p, { asc }) => [asc(p.internalName)],
  });

  const revisions = await db.query.productRevisions.findMany({
    orderBy: (r, { asc }) => [asc(r.revisionCode)],
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Edit Public Update"
        eyebrow="Update Log Settings"
        description={`Modify the settings or content body of the public log update: ${update.title}.`}
        backHref={`/owner/updates/${update.id}`}
        backLabel={`Back to update details`}
      />
      <PublicUpdateForm
        products={products}
        revisions={revisions}
        initialData={{
          id: update.id,
          title: update.title,
          summary: update.summary,
          statusLabel: update.statusLabel,
          developmentStage: update.developmentStage,
          productId: update.productId,
          revisionId: update.revisionId,
          publishedState: update.publishedState as "draft" | "published" | "archived",
          sortOrder: update.sortOrder,
        }}
      />
    </div>
  );
}
