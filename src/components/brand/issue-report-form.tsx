"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createIssueReportSchema } from "@/lib/validation/schemas";
import { createIssueReportAction } from "@/server/actions/issue-actions";
import { uploadPhotoAction } from "@/server/actions/attachment-actions";
import { ISSUE_CATEGORY, ISSUE_TYPE, ISSUE_SEVERITY, STILL_PLAYABLE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type IssueFormData = zod.infer<typeof createIssueReportSchema>;

interface IssueReportFormProps {
  sampleId: string;
  assignmentId?: string;
  redirectHref: string;
}

export function IssueReportForm({ sampleId, assignmentId, redirectHref }: IssueReportFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [createdIssueId, setCreatedIssueId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(createIssueReportSchema) as unknown as Resolver<IssueFormData>,
    defaultValues: {
      sampleId,
      assignmentId: assignmentId || "",
      firstObservedAt: new Date().toISOString().slice(0, 10),
    },
  });

  const issueType = watch("issueType");

  const onSubmit = async (data: IssueFormData) => {
    setIsLoading(true);
    try {
      const result = await createIssueReportAction({ ...data, sampleId, assignmentId: assignmentId || "" });
      toast.success("Issue reported.");
      setCreatedIssueId(result.id);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to report issue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdIssueId) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadPhotoAction("issue_report", createdIssueId, formData);
      toast.success("Photo attached.");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  if (createdIssueId) {
    return (
      <div className="space-y-4 font-mono text-xs">
        <div className="p-3 border border-kavri-line rounded-sm bg-kavri-surface-subtle">
          <p className="text-kavri-ink">Issue reported. Add a photo if it helps illustrate the defect (optional).</p>
        </div>
        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-kavri-signal-ink cursor-pointer hover:underline">
          <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" disabled={isUploading} />
          {isUploading ? "Uploading..." : "+ Add photo"}
        </label>
        <Button
          type="button"
          onClick={() => router.push(redirectHref)}
          className="w-full bg-kavri-ink text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
        >
          Done
        </Button>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-mono text-xs">
      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Category <span className="text-red-500">*</span>
        </Label>
        <select
          id="category"
          {...register("category")}
          className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
          disabled={isLoading}
        >
          <option value="">Select a category...</option>
          {Object.entries(ISSUE_CATEGORY).map(([key, val]) => (
            <option key={val} value={val}>
              {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.category.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="issueType" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Type <span className="text-red-500">*</span>
        </Label>
        <select
          id="issueType"
          {...register("issueType")}
          className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
          disabled={isLoading}
        >
          <option value="">Select a type...</option>
          {Object.entries(ISSUE_TYPE).map(([key, val]) => (
            <option key={val} value={val}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {errors.issueType && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.issueType.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="severity" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Severity <span className="text-red-500">*</span>
        </Label>
        <select
          id="severity"
          {...register("severity")}
          className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
          disabled={isLoading}
        >
          <option value="">Select severity...</option>
          {Object.entries(ISSUE_SEVERITY).map(([key, val]) => (
            <option key={val} value={val}>
              {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </option>
          ))}
        </select>
        {errors.severity && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.severity.message}</p>}
      </div>

      {issueType === "functional" && (
        <div className="space-y-1.5">
          <Label htmlFor="stillPlayable" className="text-[10px] uppercase tracking-wider text-kavri-muted">
            Still Playable? <span className="text-red-500">*</span>
          </Label>
          <select
            id="stillPlayable"
            {...register("stillPlayable")}
            className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
            disabled={isLoading}
          >
            <option value="">Select...</option>
            {Object.entries(STILL_PLAYABLE).map(([key, val]) => (
              <option key={val} value={val}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.stillPlayable && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.stillPlayable.message}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="firstObservedAt" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          First Observed <span className="text-red-500">*</span>
        </Label>
        <input
          id="firstObservedAt"
          type="date"
          {...register("firstObservedAt")}
          className="w-full text-xs h-11 min-h-[44px] px-3 rounded-sm border border-kavri-line bg-background"
          disabled={isLoading}
        />
        {errors.firstObservedAt && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.firstObservedAt.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          className="text-xs min-h-[90px] p-3 rounded-sm border-kavri-line resize-y"
          disabled={isLoading}
        />
        {errors.description && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.description.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-kavri-signal text-kavri-paper hover:opacity-90 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
      >
        {isLoading ? "Submitting..." : "Submit Issue Report"}
      </Button>
    </form>
  );
}
