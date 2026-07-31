import React from "react";
import Link from "next/link";
import { getProducts } from "@/server/services/product-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { ShoppingBag, Plus } from "lucide-react";

export const revalidate = 0;

export default async function ProductsListPage() {
  const productsList = await getProducts();

  // Fetch revisions count for each product to find active revision count
  const productsWithRevisions = await Promise.all(
    productsList.map(async (prod) => {
      const revs = await db.query.productRevisions.findMany({
        where: eq(schema.productRevisions.productId, prod.id),
        orderBy: (revisions, { desc }) => [desc(revisions.createdAt)],
      });
      return {
        ...prod,
        revisions: revs,
        activeRevision: revs[0] || null,
      };
    })
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Products Catalog"
        eyebrow="Products"
        description="Manage internal definitions, public aliases, and product revision timelines."
        count={productsWithRevisions.length}
        actions={
          <Link
            href="/owner/products/new"
            className="bg-kavri-ink text-white hover:bg-neutral-800 text-xs font-sans font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        }
      />

      {productsWithRevisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <ShoppingBag className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No products defined in catalog.</p>
          <Link
            href="/owner/products/new"
            className="text-xs font-mono uppercase text-kavri-signal hover:underline"
          >
            Add first product &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Internal Name / Alias</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Active Revision</th>
                  <th className="px-6 py-4">Public Status</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {productsWithRevisions.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-[#f9f9f7]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-kavri-ink text-[13px]">{prod.internalName}</p>
                      <p className="text-[10px] text-kavri-muted tracking-wide mt-0.5">
                        Alias: <span className="font-semibold text-kavri-ink">{prod.publicAlias || "None"}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/owner/suppliers/${prod.supplierId}`}
                        className="text-kavri-ink font-medium hover:underline hover:text-kavri-muted"
                      >
                        {prod.supplier.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {prod.activeRevision ? (
                        <span className="font-mono text-[10px] font-bold bg-[#fafaf8] border border-kavri-line px-2 py-0.5 rounded-md text-kavri-ink">
                          {prod.activeRevision.revisionCode}
                        </span>
                      ) : (
                        <span className="text-[10px] text-kavri-muted italic">No Revisions</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {prod.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#ecefea] text-kavri-muted border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                          Private
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={prod.status as "active" | "archived"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`/owner/products/${prod.id}`}
                          className="text-kavri-ink hover:underline font-semibold"
                        >
                          View
                        </Link>
                        {prod.status !== "archived" && (
                          <Link
                            href={`/owner/products/${prod.id}/edit`}
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
