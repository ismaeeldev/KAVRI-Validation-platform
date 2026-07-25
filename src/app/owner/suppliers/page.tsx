import React from "react";
import Link from "next/link";
import { getSuppliers } from "@/server/services/supplier-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { Building2, Plus, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function SuppliersListPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Suppliers Directory"
        eyebrow="Inventory Supply"
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
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Name / Code</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Physical Samples</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {suppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-[#f9f9f7]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-kavri-ink text-[13px]">{supplier.name}</p>
                      <p className="text-[10px] font-mono text-kavri-muted uppercase tracking-wider mt-0.5">{supplier.code || "No Code"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={supplier.status as "active" | "archived"} />
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-medium">{supplier.productCount}</td>
                    <td className="px-6 py-4 text-kavri-muted font-medium">{supplier.sampleCount}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`/owner/suppliers/${supplier.id}`}
                          className="text-kavri-ink hover:underline font-semibold"
                        >
                          View
                        </Link>
                        {supplier.status !== "archived" && (
                          <Link
                            href={`/owner/suppliers/${supplier.id}/edit`}
                            className="text-kavri-muted hover:text-kavri-ink hover:underline font-semibold"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
