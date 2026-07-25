import React from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { SampleCreateForm } from "@/components/brand/sample-create-form";
import { db } from "@/db";

export const revalidate = 0;

export default async function NewSamplePage() {
  const suppliers = await db.query.suppliers.findMany({
    orderBy: (s, { asc }) => [asc(s.name)],
  });

  const products = await db.query.products.findMany({
    orderBy: (p, { asc }) => [asc(p.internalName)],
  });

  const revisions = await db.query.productRevisions.findMany({
    orderBy: (r, { asc }) => [asc(r.revisionCode)],
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Log Physical Sample"
        eyebrow="Triage Registration"
        description="Verify manufacturing batches, establish unique tracking codes, and route to triage."
        backHref="/owner/samples"
        backLabel="Back to samples"
      />
      <SampleCreateForm suppliers={suppliers} products={products} revisions={revisions} />
    </div>
  );
}
