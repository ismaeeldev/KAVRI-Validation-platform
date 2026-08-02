"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ExportCsvButton } from "@/components/brand/export-csv-button";
import type { CsvColumn } from "@/lib/csv-export";

interface WaitlistSubscriberRow {
  id: string;
  email: string;
  name: string | null;
  signupSource: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ctaSource: string | null;
  interestType: string | null;
  testerInterest: boolean;
  applicationSkillLevel: string | null;
  applicationNotes: string | null;
  consentAt: Date;
  consentTextVersion: string | null;
  status: string;
}

interface WaitlistTableProps {
  subscribers: WaitlistSubscriberRow[];
}

const ALL = "all";

const WAITLIST_CSV_COLUMNS: CsvColumn<WaitlistSubscriberRow>[] = [
  { header: "email", value: (s) => s.email },
  { header: "name", value: (s) => s.name },
  { header: "signupSource", value: (s) => s.signupSource },
  { header: "utmSource", value: (s) => s.utmSource },
  { header: "utmMedium", value: (s) => s.utmMedium },
  { header: "utmCampaign", value: (s) => s.utmCampaign },
  { header: "ctaSource", value: (s) => s.ctaSource },
  { header: "interestType", value: (s) => s.interestType },
  { header: "testerInterest", value: (s) => s.testerInterest },
  { header: "applicationSkillLevel", value: (s) => s.applicationSkillLevel },
  { header: "applicationNotes", value: (s) => s.applicationNotes },
  { header: "consentAt", value: (s) => s.consentAt },
  { header: "consentTextVersion", value: (s) => s.consentTextVersion },
  { header: "status", value: (s) => s.status },
];

export function WaitlistTable({ subscribers }: WaitlistTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [sourceFilter, setSourceFilter] = useState(ALL);
  const [interestFilter, setInterestFilter] = useState(ALL);
  const [testerOnly, setTesterOnly] = useState(false);

  const statuses = useMemo(() => Array.from(new Set(subscribers.map((s) => s.status))), [subscribers]);
  const sources = useMemo(() => Array.from(new Set(subscribers.map((s) => s.signupSource))), [subscribers]);
  const interests = useMemo(
    () => Array.from(new Set(subscribers.map((s) => s.interestType).filter((v): v is string => Boolean(v)))),
    [subscribers]
  );

  const filtered = subscribers.filter((sub) => {
    if (statusFilter !== ALL && sub.status !== statusFilter) return false;
    if (sourceFilter !== ALL && sub.signupSource !== sourceFilter) return false;
    if (interestFilter !== ALL && sub.interestType !== interestFilter) return false;
    if (testerOnly && !sub.testerInterest) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-kavri-line bg-background px-3 h-9 text-[11px] font-mono uppercase tracking-wider"
        >
          <option value={ALL}>All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-kavri-line bg-background px-3 h-9 text-[11px] font-mono uppercase tracking-wider"
        >
          <option value={ALL}>All Sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={interestFilter}
          onChange={(e) => setInterestFilter(e.target.value)}
          className="rounded-lg border border-kavri-line bg-background px-3 h-9 text-[11px] font-mono uppercase tracking-wider"
        >
          <option value={ALL}>All Interests</option>
          {interests.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-kavri-muted px-1 h-9">
          <input type="checkbox" checked={testerOnly} onChange={(e) => setTesterOnly(e.target.checked)} />
          Tester Interest Only
        </label>

        <ExportCsvButton
          rows={filtered}
          columns={WAITLIST_CSV_COLUMNS}
          filenamePrefix="waitlist"
          className="ml-auto bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-9 px-4 rounded-lg flex items-center gap-1.5"
        />
      </div>

      <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                <th className="px-4 py-4 w-8" />
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Tester Interest</th>
                <th className="px-6 py-4">Consent Timestamp</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kavri-line/60">
              {filtered.map((sub) => {
                const isExpanded = expandedId === sub.id;
                return (
                  <React.Fragment key={sub.id}>
                    <tr
                      className="hover:bg-[#f9f9f7]/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    >
                      <td className="px-4 py-4 text-kavri-muted">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </td>
                      <td className="px-6 py-4 font-semibold text-kavri-ink text-[13px]">{sub.email}</td>
                      <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-kavri-muted font-mono">
                        {sub.signupSource}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono">
                        {sub.testerInterest ? (
                          <span className="text-kavri-signal-ink font-bold uppercase">Yes</span>
                        ) : (
                          <span className="text-kavri-muted">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-kavri-muted font-mono text-[11px]">
                        {new Date(sub.consentAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-2 py-0.5 rounded-md uppercase">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#fafaf8]">
                        <td colSpan={6} className="px-6 py-5">
                          <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 font-mono text-[11px]">
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">Name</dt>
                              <dd className="text-kavri-ink">{sub.name || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">Interest Type</dt>
                              <dd className="text-kavri-ink">{sub.interestType || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">CTA Source</dt>
                              <dd className="text-kavri-ink">{sub.ctaSource || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">UTM Source</dt>
                              <dd className="text-kavri-ink">{sub.utmSource || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">UTM Medium</dt>
                              <dd className="text-kavri-ink">{sub.utmMedium || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">UTM Campaign</dt>
                              <dd className="text-kavri-ink">{sub.utmCampaign || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">Skill Level</dt>
                              <dd className="text-kavri-ink">{sub.applicationSkillLevel || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">Consent Version</dt>
                              <dd className="text-kavri-ink">{sub.consentTextVersion || "—"}</dd>
                            </div>
                            <div className="col-span-2 md:col-span-3">
                              <dt className="text-kavri-muted uppercase tracking-wider text-[9px] mb-0.5">Application Notes</dt>
                              <dd className="text-kavri-ink whitespace-pre-wrap">{sub.applicationNotes || "—"}</dd>
                            </div>
                          </dl>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
