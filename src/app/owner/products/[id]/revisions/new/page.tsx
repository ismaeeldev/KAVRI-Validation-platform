import React from "react";
import { getProductById } from "@/server/services/product-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { RevisionCreateForm } from "@/components/brand/revision-create-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewProductRevisionPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Add Product Revision"
        eyebrow="New Revision Matrix"
        description={`Log structural matrix modification or new engineering specs for ${product.internalName}.`}
        backHref={`/owner/products/${product.id}`}
        backLabel={`Back to ${product.internalName}`}
      />
      <RevisionCreateForm productId={id} />
    </div>
  );
}
