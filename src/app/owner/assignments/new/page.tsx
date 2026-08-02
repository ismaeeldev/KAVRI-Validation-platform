import React from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { AssignmentCreateForm } from "@/components/brand/assignment-create-form";
import { db } from "@/db";

export const revalidate = 0;

export default async function NewAssignmentPage() {
  const testers = await db.query.testerProfiles.findMany({
    orderBy: (t, { asc }) => [asc(t.displayName)],
  });

  const samples = await db.query.physicalSamples.findMany({
    with: {
      product: true,
      revision: true,
    },
    orderBy: (s, { asc }) => [asc(s.sampleCode)],
  });

  const rounds = await db.query.testRounds.findMany({
    where: (r, { inArray }) => inArray(r.status, ["recruiting", "active"]),
    with: {
      roundRevisions: true,
    },
    orderBy: (r, { asc }) => [asc(r.roundName)],
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Create Testing Assignment"
        eyebrow="Briefing Room"
        description="Draft instruction briefs and assign physical batches to approved play-testers, linked to a test round."
        backHref="/owner/assignments"
        backLabel="Back to assignments"
      />
      <AssignmentCreateForm testers={testers} samples={samples} rounds={rounds} />
    </div>
  );
}
