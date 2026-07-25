import React from "react";
import { getSupplierById } from "@/server/services/supplier-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { SupplierEditForm } from "@/components/brand/supplier-edit-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: PageProps) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Edit Supplier"
        eyebrow="Update Credentials"
        description={`Modify directory configurations and contact credentials for ${supplier.name}.`}
        backHref={`/owner/suppliers/${supplier.id}`}
        backLabel={`Back to ${supplier.name}`}
      />
      <SupplierEditForm supplier={supplier} />
    </div>
  );
}
