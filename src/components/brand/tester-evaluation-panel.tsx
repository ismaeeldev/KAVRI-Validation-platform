"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlaySessionForm } from "./play-session-form";
import { EvaluationForm } from "./evaluation-form";

interface EvaluationRecord {
  id: string;
  status: string;
  // Decision 1: submittedAt is the immutable original submission stamp; reopenedAt is set only
  // when an owner has unlocked the evaluation for a correction.
  submittedAt: string | Date | null;
  reopenedAt: string | Date | null;
  updatedAt: string | Date;
  playTimeMinutes: number | null;
  conditions: string | null;
  comparisonReference: string | null;
  strengths: string | null;
  weaknesses: string | null;
  preference: string | null;
  confidence: string | null;
  issueTriggered: boolean;
  scoreControl: number | null;
  scoreStability: number | null;
  scoreFeel: number | null;
  scoreComfort: number | null;
  scoreConsistency: number | null;
  scoreOverallPreference: number | null;
  scorePower: number | null;
  scoreSpin: number | null;
  scoreForgiveness: number | null;
  scoreManeuverability: number | null;
  scoreSound: number | null;
  scoreFatigue: number | null;
  scoreBuildQuality: number | null;
}

interface TesterEvaluationPanelProps {
  assignmentId: string;
  sessionCount: number;
  requiredSessionCount: number;
  firstImpression: EvaluationRecord | null;
  followUp: EvaluationRecord | null;
  followUpUnlocked: boolean;
  roundClosed: boolean;
}

type Panel = "session" | "first_impression" | "follow_up" | null;

export function TesterEvaluationPanel({
  assignmentId,
  sessionCount,
  requiredSessionCount,
  firstImpression,
  followUp,
  followUpUnlocked,
  roundClosed,
}: TesterEvaluationPanelProps) {
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  const toggle = (panel: Panel) => setOpenPanel((prev) => (prev === panel ? null : panel));

  return (
    <div className="space-y-4">
      <Card className="border-kavri-line bg-kavri-surface dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Play Sessions</span>
            <span className="font-mono text-[10px] text-kavri-muted font-normal">
              {sessionCount} / {requiredSessionCount} logged
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => toggle("session")}
            className="w-full text-left font-mono text-xs uppercase tracking-wider bg-kavri-ink text-white hover:bg-neutral-800 h-11 min-h-[44px] px-4 rounded-sm flex items-center justify-center"
          >
            {openPanel === "session" ? "Close" : "Log a Play Session"}
          </button>
          {openPanel === "session" && (
            <div className="pt-4">
              <PlaySessionForm assignmentId={assignmentId} onLogged={() => setOpenPanel(null)} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-kavri-line bg-kavri-surface dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs uppercase tracking-wider flex items-center justify-between">
            <span>First Impression</span>
            {firstImpression && (
              <span className="font-mono text-[10px] text-kavri-muted font-normal uppercase">{firstImpression.status}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => toggle("first_impression")}
            className="w-full text-left font-mono text-xs uppercase tracking-wider bg-kavri-ink text-white hover:bg-neutral-800 h-11 min-h-[44px] px-4 rounded-sm flex items-center justify-center"
          >
            {openPanel === "first_impression" ? "Close" : firstImpression ? "Continue First Impression" : "Start First Impression"}
          </button>
          {openPanel === "first_impression" && (
            <div className="pt-4">
              <EvaluationForm
                assignmentId={assignmentId}
                evaluationType="first_impression"
                initialEvaluation={firstImpression}
                roundClosed={roundClosed}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-kavri-line bg-kavri-surface dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Follow-Up Evaluation</span>
            {followUp && (
              <span className="font-mono text-[10px] text-kavri-muted font-normal uppercase">{followUp.status}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followUpUnlocked ? (
            <>
              <button
                type="button"
                onClick={() => toggle("follow_up")}
                className="w-full text-left font-mono text-xs uppercase tracking-wider bg-kavri-ink text-white hover:bg-neutral-800 h-11 min-h-[44px] px-4 rounded-sm flex items-center justify-center"
              >
                {openPanel === "follow_up" ? "Close" : followUp ? "Continue Follow-Up" : "Start Follow-Up"}
              </button>
              {openPanel === "follow_up" && (
                <div className="pt-4">
                  <EvaluationForm
                    assignmentId={assignmentId}
                    evaluationType="follow_up"
                    initialEvaluation={followUp}
                    roundClosed={roundClosed}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="font-mono text-[11px] text-kavri-muted leading-relaxed">
              Locked until the First Impression is submitted and {requiredSessionCount} play session(s) are logged.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
