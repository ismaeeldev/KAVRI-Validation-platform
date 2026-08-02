import React from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { RoundCreateForm } from "@/components/brand/round-create-form";
import { db } from "@/db";

export const revalidate = 0;

export default async function NewRoundPage() {
  const revisions = await db.query.productRevisions.findMany({
    with: { product: true },
    orderBy: (r, { asc }) => [asc(r.revisionCode)],
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Create Test Round"
        eyebrow="New Validation Cycle"
        description="Define the goal, instructions, and product revisions covered by this validation cycle."
        backHref="/owner/rounds"
        backLabel="Back to rounds"
      />
      <RoundCreateForm revisions={revisions} />
    </div>
  );
}
