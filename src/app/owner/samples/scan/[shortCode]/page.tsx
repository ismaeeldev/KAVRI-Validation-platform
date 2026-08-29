import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSampleByShortCode } from "@/server/services/sample-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { SearchX } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ScanSamplePage({ params }: PageProps) {
  const { shortCode } = await params;
  const sample = await getSampleByShortCode(shortCode);

  if (sample) {
    redirect(`/owner/samples/${sample.id}`);
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Sample Not Found"
        eyebrow="Scan Lookup"
        description="The scanned code could not be matched to a sample on file."
        backHref="/owner/samples"
        backLabel="Back to samples"
      />
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
        <SearchX className="h-8 w-8 text-kavri-muted" />
        <p className="text-xs font-sans font-semibold text-kavri-muted">
          This code doesn&apos;t match any sample on file.
        </p>
        <p className="text-[11px] font-mono text-kavri-muted uppercase tracking-wider">
          Code scanned: {shortCode}
        </p>
        <Link
          href="/owner/samples"
          className="text-xs font-mono uppercase text-kavri-signal hover:underline"
        >
          Return to samples list &rarr;
        </Link>
      </div>
    </div>
  );
}
