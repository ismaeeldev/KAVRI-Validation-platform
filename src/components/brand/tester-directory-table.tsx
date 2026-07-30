"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { SKILL_LEVEL, PLAYING_FREQUENCY } from "@/lib/constants";
import { Search } from "lucide-react";

interface TesterRow {
  id: string;
  displayName: string;
  emailNormalized: string;
  approvalStatus: string;
  userId: string | null;
  skillLevel: string | null;
  playingFrequency: string | null;
  currentPaddle: string | null;
  playStyle: string | null;
  activeAssignmentCount: number;
  lastActivityAt: Date | string | null;
}

function relativeTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function TesterDirectoryTable({ testers }: { testers: TesterRow[] }) {
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return testers.filter((t) => {
      const matchesSearch =
        term === "" || t.displayName.toLowerCase().includes(term) || t.emailNormalized.toLowerCase().includes(term);
      const matchesApproval = approvalFilter === "all" || t.approvalStatus === approvalFilter;
      const matchesAccess = accessFilter === "all" || (accessFilter === "active" ? !!t.userId : !t.userId);
      const matchesSkill = skillFilter === "all" || t.skillLevel === skillFilter;
      const matchesFrequency = frequencyFilter === "all" || t.playingFrequency === frequencyFilter;
      const matchesAssignment =
        assignmentFilter === "all" || (assignmentFilter === "has" ? t.activeAssignmentCount > 0 : t.activeAssignmentCount === 0);
      return matchesSearch && matchesApproval && matchesAccess && matchesSkill && matchesFrequency && matchesAssignment;
    });
  }, [testers, search, approvalFilter, accessFilter, skillFilter, frequencyFilter, assignmentFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-kavri-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-kavri-line bg-background text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
          />
        </div>
        <select value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)} className="h-9 px-2.5 rounded-lg border border-kavri-line bg-background text-xs font-sans">
          <option value="all">All approvals</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="deactivated">Deactivated</option>
        </select>
        <select value={accessFilter} onChange={(e) => setAccessFilter(e.target.value)} className="h-9 px-2.5 rounded-lg border border-kavri-line bg-background text-xs font-sans">
          <option value="all">All access</option>
          <option value="active">Active</option>
          <option value="invited">Not activated</option>
        </select>
        <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="h-9 px-2.5 rounded-lg border border-kavri-line bg-background text-xs font-sans">
          <option value="all">All skill levels</option>
          {Object.values(SKILL_LEVEL).map((v) => (
            <option key={v} value={v}>{v === "not_sure" ? "Not Sure" : v}</option>
          ))}
        </select>
        <select value={frequencyFilter} onChange={(e) => setFrequencyFilter(e.target.value)} className="h-9 px-2.5 rounded-lg border border-kavri-line bg-background text-xs font-sans">
          <option value="all">All frequencies</option>
          {Object.values(PLAYING_FREQUENCY).map((v) => (
            <option key={v} value={v}>{v.split("_").join(" ")}</option>
          ))}
        </select>
        <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)} className="h-9 px-2.5 rounded-lg border border-kavri-line bg-background text-xs font-sans">
          <option value="all">All assignment states</option>
          <option value="has">Has active assignment</option>
          <option value="none">No active assignment</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center">
          <p className="text-xs font-sans font-semibold text-kavri-muted">No testers match your filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-kavri-line text-[10px] font-bold uppercase tracking-wider text-kavri-muted bg-[#fafaf8] select-none">
                  <th className="px-4 py-3">Name / Email</th>
                  <th className="px-4 py-3">Skill</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Current Paddle</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Active Assignments</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kavri-line/60">
                {filtered.map((tester) => (
                  <tr key={tester.id} className="hover:bg-[#f9f9f7]/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-kavri-ink text-[13px]">{tester.displayName}</p>
                      <p className="text-[10px] font-mono text-kavri-muted lowercase tracking-wider mt-0.5">{tester.emailNormalized}</p>
                    </td>
                    <td className="px-4 py-3 text-kavri-muted">{tester.skillLevel || "—"}</td>
                    <td className="px-4 py-3 text-kavri-muted capitalize">{tester.playingFrequency?.split("_").join(" ") || "—"}</td>
                    <td className="px-4 py-3 text-kavri-muted">{tester.currentPaddle || "—"}</td>
                    <td className="px-4 py-3">
                      {tester.approvalStatus === "approved" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#e8f5ec] text-[#257a47] border border-[#d1ecd9] px-2 py-0.5 rounded-md uppercase">Approved</span>
                      ) : tester.approvalStatus === "deactivated" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#f9e9e7] text-[#b33a32] border border-[#f5d6d4] px-2 py-0.5 rounded-md uppercase">Deactivated</span>
                      ) : tester.approvalStatus === "declined" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-md uppercase">Declined</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#fff5d8] text-[#986b11] border border-[#faecd1] px-2 py-0.5 rounded-md uppercase">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tester.userId ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-2 py-0.5 rounded-md uppercase">Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#ecefea] text-kavri-muted border border-kavri-line px-2 py-0.5 rounded-md uppercase">Invited</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-kavri-muted font-medium">{tester.activeAssignmentCount}</td>
                    <td className="px-4 py-3 text-kavri-muted">{relativeTime(tester.lastActivityAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/owner/testers/${tester.id}`} className="text-kavri-ink hover:underline font-semibold">Manage</Link>
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
