"use client";

import React, { useState } from "react";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { StatusBadge } from "@/components/brand/status";
import { SampleTriageControls } from "@/components/brand/sample-triage-controls";
import { ShieldAlert, CheckCircle, User } from "lucide-react";

interface SampleDetailClientProps {
  sampleId: string;
  sampleCode: string;
  currentHolder: string;
  initialStatus: string;
  initialReadinessNote: string | null;
  /** Static content rendered between the banner and the triage controls card (e.g. the
   * observations grid) - unaffected by the status mutation, kept server-rendered. */
  children: React.ReactNode;
  /** Static content rendered after the triage controls card (variance/measurements/inspection). */
  afterTriage: React.ReactNode;
  sidebar: React.ReactNode;
}

/**
 * Client wrapper for the sample detail page's mutation-sensitive fields: the header status
 * badge and the Validation Ready/Blocked banner, alongside the triage controls that mutate
 * them. The triage action's return value drives useState directly here, so both spots update
 * immediately after a transition with no server round-trip (router.refresh() reliance removed).
 */
export function SampleDetailClient({
  sampleId,
  sampleCode,
  currentHolder,
  initialStatus,
  initialReadinessNote,
  children,
  afterTriage,
  sidebar,
}: SampleDetailClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [readinessNote, setReadinessNote] = useState(initialReadinessNote);

  const handleUpdate = (updated: { status: string; readinessNote: string | null }) => {
    setStatus(updated.status);
    setReadinessNote(updated.readinessNote);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title={`Sample ${sampleCode}`}
        eyebrow="Sample Review"
        description="Verify incoming batches, record material observations, and review readiness."
        backHref="/owner/samples"
        backLabel="Back to samples"
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-kavri-line bg-[#ecefea] text-kavri-muted">
              <User className="h-3 w-3" /> Holder: {currentHolder}
            </span>
            <StatusBadge status={status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {status !== "ready_for_testing" ? (
            <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 flex gap-3 text-xs font-sans">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-red-900 uppercase tracking-wide block">Validation Blocked</span>
                <p className="text-red-700 leading-relaxed">
                  This batch is currently marked as <strong className="uppercase">[{status.replace("_", " ")}]</strong> and cannot be assigned to active validation sessions.
                </p>
                {readinessNote ? (
                  <p className="mt-2 p-2.5 bg-white border border-red-100 rounded-lg text-red-800 italic">
                    Reason: {readinessNote}
                  </p>
                ) : (
                  <p className="mt-1 italic text-red-600">No transition notes recorded.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-kavri-line bg-kavri-signal-soft/40 rounded-xl p-4 flex gap-3 text-xs font-sans">
              <CheckCircle className="h-5 w-5 text-kavri-ink shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-kavri-ink uppercase tracking-wide block">Validation Ready</span>
                <p className="text-kavri-muted font-medium">
                  This prototype batch is confirmed and cleared for tester validation dispatches.
                </p>
                {readinessNote && (
                  <p className="mt-2 p-2.5 bg-white border border-kavri-line rounded-lg text-kavri-ink italic">
                    Note: {readinessNote}
                  </p>
                )}
              </div>
            </div>
          )}

          {children}

          {/* Sample Review Controls Card */}
          <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3">
              Sample Review Workflow
            </h3>
            <SampleTriageControls sampleId={sampleId} currentStatus={status} onUpdate={handleUpdate} />
          </div>

          {afterTriage}
        </div>

        <div className="lg:col-span-4 space-y-6">{sidebar}</div>
      </div>
    </div>
  );
}
