import React from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { ProductCreateForm } from "@/components/brand/product-create-form";
import { db } from "@/db";

export const revalidate = 0;

export default async function NewProductPage() {
  const suppliers = await db.query.suppliers.findMany({
    orderBy: (suppliers, { asc }) => [asc(suppliers.name)],
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Add New Product"
        eyebrow="Product Definition"
        description="Establish internal validation schemas and link manufacturing partners."
        backHref="/owner/products"
        backLabel="Back to products"
      />
      <ProductCreateForm suppliers={suppliers} />
    </div>
  );
}
