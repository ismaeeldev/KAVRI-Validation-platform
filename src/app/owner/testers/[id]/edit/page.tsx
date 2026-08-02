import React from "react";
import { getTesterById } from "@/server/services/tester-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { TesterProfileEditForm } from "@/components/brand/tester-profile-edit-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTesterProfilePage({ params }: PageProps) {
  const { id } = await params;
  const tester = await getTesterById(id);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Edit Tester Profile"
        eyebrow="Update Profile"
        description={`Modify skill, preferences, and play details for ${tester.displayName}.`}
        backHref={`/owner/testers/${id}`}
        backLabel="Back to tester"
      />
      <TesterProfileEditForm testerId={id} profile={tester} />
    </div>
  );
}
