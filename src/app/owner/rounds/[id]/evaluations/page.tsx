import React from "react";
import Link from "next/link";
import { getRoundById } from "@/server/services/test-round-service";
import { getEvaluationsByRound } from "@/server/services/evaluation-service";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { ClipboardCheck } from "lucide-react";
import { DownloadCsvButton } from "@/components/brand/download-csv-button";
import { rowsToCsv, type CsvColumn } from "@/lib/csv-export";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; sampleId?: string }>;
}

type EvaluationExportRow = Awaited<ReturnType<typeof getEvaluationsByRound>>[number];

const EVALUATION_CSV_COLUMNS: CsvColumn<EvaluationExportRow>[] = [
  { header: "tester", value: (e) => e.assignment.testerProfile.displayName },
  { header: "sample", value: (e) => e.sample.sampleCode },
  { header: "evaluationType", value: (e) => e.evaluationType },
  { header: "status", value: (e) => e.status },
  { header: "preference", value: (e) => e.preference },
  { header: "confidence", value: (e) => e.confidence },
  { header: "scoreControl", value: (e) => e.scoreControl },
  { header: "scoreStability", value: (e) => e.scoreStability },
  { header: "scoreFeel", value: (e) => e.scoreFeel },
  { header: "scoreComfort", value: (e) => e.scoreComfort },
  { header: "scoreConsistency", value: (e) => e.scoreConsistency },
  { header: "scoreOverallPreference", value: (e) => e.scoreOverallPreference },
  { header: "scorePower", value: (e) => e.scorePower },
  { header: "scoreSpin", value: (e) => e.scoreSpin },
  { header: "scoreForgiveness", value: (e) => e.scoreForgiveness },
  { header: "scoreManeuverability", value: (e) => e.scoreManeuverability },
  { header: "scoreSound", value: (e) => e.scoreSound },
  { header: "scoreFatigue", value: (e) => e.scoreFatigue },
  { header: "scoreBuildQuality", value: (e) => e.scoreBuildQuality },
  { header: "strengths", value: (e) => e.strengths },
  { header: "weaknesses", value: (e) => e.weaknesses },
  { header: "issueTriggered", value: (e) => e.issueTriggered },
  { header: "playTimeMinutes", value: (e) => e.playTimeMinutes },
  { header: "conditions", value: (e) => e.conditions },
  { header: "comparisonReference", value: (e) => e.comparisonReference },
  { header: "submittedAt", value: (e) => e.submittedAt },
];

export default async function RoundEvaluationsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { type, sampleId } = await searchParams;
  const round = await getRoundById(id);
  const allEvaluations = await getEvaluationsByRound(id);

  const evaluations = allEvaluations.filter((e) => {
    if (type && e.evaluationType !== type) return false;
    if (sampleId && e.sampleId !== sampleId) return false;
    return true;
  });

  const samples = Array.from(new Map(allEvaluations.map((e) => [e.sample.id, e.sample])).values());

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Round Evaluations"
        eyebrow={`Round ${round.roundCode}`}
        description="First Impression and Follow-Up evaluations submitted by testers in this round."
        backHref={`/owner/rounds/${id}`}
        backLabel="Back to round"
        count={evaluations.length}
        actions={<DownloadCsvButton csv={rowsToCsv(evaluations, EVALUATION_CSV_COLUMNS)} filenamePrefix={`evaluations-${round.roundCode}`} />}
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/owner/rounds/${id}/evaluations`}
          className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${
            !type ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"
          }`}
        >
          All Types
        </Link>
        {["first_impression", "follow_up"].map((t) => (
          <Link
            key={t}
            href={`/owner/rounds/${id}/evaluations?type=${t}`}
            className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${
              type === t ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"
            }`}
          >
            {t.replace("_", " ")}
          </Link>
        ))}
        {samples.map((s) => (
          <Link
            key={s.id}
            href={`/owner/rounds/${id}/evaluations?sampleId=${s.id}${type ? `&type=${type}` : ""}`}
            className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${
              sampleId === s.id ? "bg-kavri-ink text-white border-kavri-ink" : "border-kavri-line text-kavri-muted hover:text-kavri-ink"
            }`}
          >
            {s.sampleCode}
          </Link>
        ))}
      </div>

      {evaluations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3">
          <ClipboardCheck className="h-8 w-8 text-kavri-muted" />
          <p className="text-xs font-sans font-semibold text-kavri-muted">No evaluations match the current filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-6 py-4">Tester</th>
                  <th className="px-6 py-4">Sample</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Preference</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {evaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-[#f9f9f7]/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-kavri-ink">{evaluation.assignment.testerProfile.displayName}</td>
                    <td className="px-6 py-4 font-mono text-[11px]">{evaluation.sample.sampleCode}</td>
                    <td className="px-6 py-4 capitalize">{evaluation.evaluationType.replace("_", " ")}</td>
                    <td className="px-6 py-4 text-kavri-muted capitalize">{evaluation.preference?.replace("_", " ") || "—"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={evaluation.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/owner/rounds/${id}/evaluations/${evaluation.id}`} className="text-kavri-ink hover:underline font-semibold">
                        View
                      </Link>
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
