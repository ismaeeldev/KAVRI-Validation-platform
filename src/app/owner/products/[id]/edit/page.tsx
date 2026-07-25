import React from "react";
import { getProductById } from "@/server/services/product-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { ProductEditForm } from "@/components/brand/product-edit-form";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Edit Product"
        eyebrow="Update Target"
        description={`Modify configuration settings and public listing details for ${product.internalName}.`}
        backHref={`/owner/products/${product.id}`}
        backLabel={`Back to ${product.internalName}`}
      />
      <ProductEditForm product={product} />
    </div>
  );
}
