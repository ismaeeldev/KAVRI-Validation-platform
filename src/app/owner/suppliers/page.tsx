import React from "react";
import Link from "next/link";
import { getSuppliers } from "@/server/services/supplier-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { SupplierDirectoryTable } from "@/components/brand/supplier-directory-table";
import { Building2, Plus } from "lucide-react";

export const revalidate = 0;

export default async function SuppliersListPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Suppliers Directory"
        eyebrow="Suppliers"
        description="Log and manage validation suppliers, partners, and manufacturing entities."
        count={suppliers.length}
        actions={
          <Link
            href="/owner/suppliers/new"
            className="bg-kavri-ink text-white hover:bg-neutral-800 text-xs font-sans font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </Link>
        }
      />

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <Building2 className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No suppliers logged in directory.</p>
          <Link
            href="/owner/suppliers/new"
            className="text-xs font-mono uppercase text-kavri-signal hover:underline"
          >
            Add first supplier &rarr;
          </Link>
        </div>
      ) : (
        <SupplierDirectoryTable suppliers={suppliers} />
      )}
    </div>
  );
}
