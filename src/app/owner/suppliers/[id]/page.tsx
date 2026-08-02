import React from "react";
import Link from "next/link";
import { getSupplierById, getSupplierLinkedRecordCounts } from "@/server/services/supplier-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { SupplierArchiveButton } from "@/components/brand/supplier-actions";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { FileText, ShieldAlert, Award, Globe, Phone, MapPin } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  const linkedProducts = await db.query.products.findMany({
    where: eq(schema.products.supplierId, id),
  });

  const linkedCounts = await getSupplierLinkedRecordCounts(id);

  const addressParts = [
    supplier.addressLine1,
    supplier.addressLine2,
    [supplier.city, supplier.region].filter(Boolean).join(", "),
    [supplier.postalCode, supplier.country].filter(Boolean).join(" "),
  ].filter(Boolean);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={supplier.name}
        eyebrow={`Supplier ID: ${supplier.code || supplier.id.slice(0, 8)}`}
        description="Detailed credentials, private verification notes, and associated items catalog."
        backHref="/owner/suppliers"
        backLabel="Back to suppliers"
        actions={
          <div className="flex items-center gap-2">
            {supplier.status !== "archived" && (
              <>
                <Link
                  href={`/owner/suppliers/${id}/edit`}
                  className="border border-kavri-line-strong hover:bg-kavri-surface-subtle text-xs font-sans font-semibold px-4 py-2 h-9 rounded-lg transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-kavri-signal"
                >
                  Edit Details
                </Link>
                <SupplierArchiveButton
                  supplierId={id}
                  linkedProductCount={linkedCounts.productCount}
                  linkedSampleCount={linkedCounts.sampleCount}
                />
              </>
            )}
            <StatusBadge status={supplier.relationshipStatus} />
            <StatusBadge status={supplier.status as "active" | "archived"} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Notes Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-kavri-line pb-3">
              <h2 className="font-heading text-sm font-black uppercase tracking-wider text-kavri-ink flex items-center gap-2">
                <FileText className="h-4 w-4 text-kavri-muted" />
                <span>Internal Notes</span>
              </h2>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-[#f9e9e7] text-[#b33a32] border border-[#f5d6d4] px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                <ShieldAlert className="h-3 w-3" />
                <span>Strictly Confidential</span>
              </span>
            </div>
            <p className="font-sans text-xs text-kavri-ink leading-relaxed whitespace-pre-wrap">
              {supplier.notes}
            </p>
          </div>

          {/* Linked Products Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h2 className="font-heading text-sm font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Linked Products
            </h2>
            {linkedProducts.length === 0 ? (
              <p className="text-xs text-kavri-muted font-sans py-4">No products linked to this supplier yet.</p>
            ) : (
              <div className="divide-y divide-kavri-line/60">
                {linkedProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="flex justify-between items-center py-3 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-0.5">
                      <Link 
                        href={`/owner/products/${prod.id}`} 
                        className="text-xs font-semibold text-kavri-ink hover:underline"
                      >
                        {prod.internalName}
                      </Link>
                      {prod.publicAlias && (
                        <p className="text-[10px] text-kavri-muted font-sans uppercase">Alias: {prod.publicAlias}</p>
                      )}
                    </div>
                    <StatusBadge status={prod.status as "active" | "archived"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="lg:col-span-4 border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-6">
          <h2 className="font-heading text-sm font-black uppercase tracking-wider text-kavri-ink flex items-center gap-2 border-b border-kavri-line pb-3">
            <Award className="h-4 w-4 text-kavri-muted" />
            <span>Contact Credentials</span>
          </h2>
          
          <div className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Contact Name</span>
              <p className="font-semibold text-kavri-ink text-[13px]">
                {supplier.contactName || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Contact Email</span>
              <p className="font-semibold text-kavri-ink text-[13px]">
                {supplier.contactEmail || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Logged Since</span>
              <p className="text-kavri-muted font-medium">
                {new Date(supplier.createdAt).toLocaleDateString()}
              </p>
            </div>

            {supplier.supplierType && (
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block">Supplier Type</span>
                <p className="font-semibold text-kavri-ink text-[13px] capitalize">
                  {supplier.supplierType}
                </p>
              </div>
            )}
          </div>

          {(supplier.website || supplier.phone || addressParts.length > 0) && (
            <div className="space-y-4 text-xs font-sans border-t border-kavri-line pt-4">
              {supplier.website && (
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website
                  </span>
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-kavri-signal-ink hover:underline text-[13px] break-all"
                  >
                    {supplier.website}
                  </a>
                </div>
              )}

              {supplier.phone && (
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </span>
                  <p className="font-semibold text-kavri-ink text-[13px]">{supplier.phone}</p>
                </div>
              )}

              {addressParts.length > 0 && (
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </span>
                  <p className="font-semibold text-kavri-ink text-[13px] leading-relaxed">
                    {addressParts.map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
