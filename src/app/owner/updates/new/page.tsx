import React from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { PublicUpdateForm } from "@/components/brand/public-update-form";
import { db } from "@/db";

export const revalidate = 0;

export default async function NewPublicUpdatePage() {
  const products = await db.query.products.findMany({
    orderBy: (p, { asc }) => [asc(p.internalName)],
  });

  const revisions = await db.query.productRevisions.findMany({
    orderBy: (r, { asc }) => [asc(r.revisionCode)],
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Create Public Update"
        eyebrow="New Development Log"
        description="Add a development timeline log update to the public landing page feed."
        backHref="/owner/updates"
        backLabel="Back to updates"
      />
      <PublicUpdateForm products={products} revisions={revisions} />
    </div>
  );
}
