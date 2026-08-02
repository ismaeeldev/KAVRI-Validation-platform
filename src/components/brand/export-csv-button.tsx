"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { rowsToCsv, type CsvColumn } from "@/lib/csv-export";

interface ExportCsvButtonProps<T> {
  /** Already-filtered rows, so the export matches what's currently visible in the table. */
  rows: T[];
  columns: CsvColumn<T>[];
  filenamePrefix: string;
  label?: string;
  className?: string;
}

export function ExportCsvButton<T>({ rows, columns, filenamePrefix, label = "Export CSV", className }: ExportCsvButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const csv = rowsToCsv(rows, columns);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filenamePrefix}-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isExporting || rows.length === 0}
      className={
        className ||
        "bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-9 px-4 rounded-lg flex items-center gap-1.5"
      }
    >
      <Download className="h-3.5 w-3.5" />
      {isExporting ? "Exporting..." : label}
    </Button>
  );
}
