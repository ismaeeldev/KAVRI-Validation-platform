"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadCsvButtonProps {
  /** A pre-generated CSV string. Generate this server-side (rowsToCsv is not itself passable as
   * a prop function across the server/client boundary - only the resulting string is). */
  csv: string;
  filenamePrefix: string;
  label?: string;
  className?: string;
}

export function DownloadCsvButton({ csv, filenamePrefix, label = "Export CSV", className }: DownloadCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filenamePrefix}-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
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
