"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/brand/status";
import { SUPPLIER_RELATIONSHIP_STATUS } from "@/lib/constants";
import { Search } from "lucide-react";
import { ExportCsvButton } from "@/components/brand/export-csv-button";
import type { CsvColumn } from "@/lib/csv-export";

interface SupplierRow {
  id: string;
  name: string;
  code: string | null;
  status: string;
  supplierType?: string | null;
  website?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  relationshipStatus: string;
  productCount: number;
  sampleCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

function toDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

const SUPPLIER_CSV_COLUMNS: CsvColumn<SupplierRow>[] = [
  { header: "name", value: (s) => s.name },
  { header: "code", value: (s) => s.code },
  { header: "supplierType", value: (s) => s.supplierType },
  { header: "status", value: (s) => s.status },
  { header: "relationshipStatus", value: (s) => s.relationshipStatus },
  { header: "website", value: (s) => s.website },
  { header: "phone", value: (s) => s.phone },
  {
    header: "address",
    value: (s) =>
      [s.addressLine1, s.addressLine2, s.city, s.region, s.postalCode, s.country].filter(Boolean).join(", "),
  },
  { header: "createdAt", value: (s) => toDate(s.createdAt) },
  { header: "updatedAt", value: (s) => toDate(s.updatedAt) },
];

type SortKey = "name" | "status" | "createdAt";

export function SupplierDirectoryTable({ suppliers }: { suppliers: SupplierRow[] }) {
  const [search, setSearch] = useState("");
  const [archiveFilter, setArchiveFilter] = useState<string>("all");
  const [relationshipFilter, setRelationshipFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let rows = suppliers.filter((s) => {
      const matchesSearch =
        term === "" || s.name.toLowerCase().includes(term) || (s.code || "").toLowerCase().includes(term);
      const matchesArchive = archiveFilter === "all" || s.status === archiveFilter;
      const matchesRelationship = relationshipFilter === "all" || s.relationshipStatus === relationshipFilter;
      return matchesSearch && matchesArchive && matchesRelationship;
    });

    rows = rows.slice().sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [suppliers, search, archiveFilter, relationshipFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-kavri-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-kavri-line bg-background text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
          />
        </div>
        <select
          value={archiveFilter}
          onChange={(e) => setArchiveFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-kavri-line bg-background text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={relationshipFilter}
          onChange={(e) => setRelationshipFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-kavri-line bg-background text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
        >
          <option value="all">All relationships</option>
          {Object.entries(SUPPLIER_RELATIONSHIP_STATUS).map(([key, val]) => (
            <option key={val} value={val}>
              {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </option>
          ))}
        </select>
        <ExportCsvButton
          rows={filtered}
          columns={SUPPLIER_CSV_COLUMNS}
          filenamePrefix="suppliers"
          className="sm:ml-auto bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-4 rounded-lg flex items-center gap-1.5"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <p className="text-xs font-sans font-semibold text-kavri-muted">No suppliers match your filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4 cursor-pointer hover:text-kavri-ink" onClick={() => toggleSort("name")}>
                    Name / Code{sortIndicator("name")}
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-kavri-ink" onClick={() => toggleSort("status")}>
                    Status{sortIndicator("status")}
                  </th>
                  <th className="px-6 py-4">Relationship</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Physical Samples</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {filtered.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-[#f9f9f7]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-kavri-ink text-[13px]">{supplier.name}</p>
                      <p className="text-[10px] font-mono text-kavri-muted uppercase tracking-wider mt-0.5">
                        {supplier.code || "No Code"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={supplier.status as "active" | "archived"} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={supplier.relationshipStatus} />
                    </td>
                    <td className="px-6 py-4 text-kavri-muted font-medium">{supplier.productCount}</td>
                    <td className="px-6 py-4 text-kavri-muted font-medium">{supplier.sampleCount}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link href={`/owner/suppliers/${supplier.id}`} className="text-kavri-ink hover:underline font-semibold">
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
