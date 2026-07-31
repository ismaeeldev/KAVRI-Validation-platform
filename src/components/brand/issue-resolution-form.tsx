"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateIssueResolutionAction } from "@/server/actions/issue-actions";
import { IMMEDIATE_ACTION, ISSUE_RESOLUTION_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface IssueResolutionFormProps {
  issueId: string;
  immediateAction: string | null;
  resolutionStatus: string;
  resolutionNotes: string | null;
}

export function IssueResolutionForm({ issueId, immediateAction, resolutionStatus, resolutionNotes }: IssueResolutionFormProps) {
  const router = useRouter();
  const [action, setAction] = useState(immediateAction || "");
  const [status, setStatus] = useState(resolutionStatus);
  const [notes, setNotes] = useState(resolutionNotes || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateIssueResolutionAction(issueId, {
        immediateAction: action,
        resolutionStatus: status,
        resolutionNotes: notes,
      });
      toast.success("Resolution saved.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to save resolution.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="space-y-1.5">
        <Label htmlFor="immediateAction" className="text-xs font-semibold text-kavri-ink">
          Immediate Action
        </Label>
        <select
          id="immediateAction"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
          disabled={isLoading}
        >
          <option value="">Not specified</option>
          {Object.entries(IMMEDIATE_ACTION).map(([key, val]) => (
            <option key={val} value={val}>
              {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resolutionStatus" className="text-xs font-semibold text-kavri-ink">
          Resolution Status <span className="text-red-500">*</span>
        </Label>
        <select
          id="resolutionStatus"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
          disabled={isLoading}
        >
          {Object.values(ISSUE_RESOLUTION_STATUS).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resolutionNotes" className="text-xs font-semibold text-kavri-ink">
          Resolution Notes
        </Label>
        <Textarea
          id="resolutionNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-xs min-h-[90px] p-3 rounded-lg border-kavri-line resize-y"
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-4 rounded-lg"
      >
        {isLoading ? "Saving..." : "Save Resolution"}
      </Button>
    </div>
  );
}
