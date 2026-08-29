"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export function SampleScanLookup() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/owner/samples/scan/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border border-kavri-line rounded-lg bg-kavri-surface px-3 py-2"
    >
      <QrCode className="h-4 w-4 text-kavri-muted shrink-0" />
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter short code"
        aria-label="Sample short code"
        className="w-32 md:w-40 bg-transparent text-xs font-mono uppercase tracking-wider text-kavri-ink placeholder:text-kavri-muted placeholder:normal-case focus:outline-none"
      />
      <Button
        type="submit"
        variant="outline"
        className="h-7 px-2.5 text-[10px] font-semibold"
        disabled={!code.trim()}
      >
        Find
      </Button>
    </form>
  );
}
