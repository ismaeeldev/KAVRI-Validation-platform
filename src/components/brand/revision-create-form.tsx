"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createRevisionSchema } from "@/lib/validation/schemas";
import { createRevisionAction } from "@/server/actions/product-actions";
import { DEVELOPMENT_STAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type RevisionFormData = zod.infer<typeof createRevisionSchema>;

interface CreateFormProps {
  productId: string;
}

export function RevisionCreateForm({ productId }: CreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RevisionFormData>({
    resolver: zodResolver(createRevisionSchema as any),
    defaultValues: {
      productId,
      isPublic: false,
    },
  });

  const onSubmit = async (data: RevisionFormData) => {
    setIsLoading(true);
    try {
      await createRevisionAction(data);
      toast.success("Product revision established.");
      router.push(`/owner/products/${productId}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to log revision. Duplicate revision code may be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <input type="hidden" {...register("productId")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="revisionCode" className="text-xs font-semibold text-kavri-ink">
              Revision Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="revisionCode"
              {...register("revisionCode")}
              className="font-mono text-xs uppercase focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="e.g. REV-A, REV-2.0"
              disabled={isLoading}
            />
            {errors.revisionCode && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.revisionCode.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="developmentStage" className="text-xs font-semibold text-kavri-ink">
              Development Stage <span className="text-red-500">*</span>
            </Label>
            <select
              id="developmentStage"
              {...register("developmentStage")}
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
              disabled={isLoading}
            >
              <option value="">Select a stage...</option>
              {Object.entries(DEVELOPMENT_STAGE).map(([key, val]) => (
                <option key={val} value={val}>
                  {key.replace("_", " ")}
                </option>
              ))}
            </select>
            {errors.developmentStage && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.developmentStage.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="revisionReason" className="text-xs font-semibold text-kavri-ink">
            Revision Reason <span className="text-red-500">*</span>
          </Label>
          <Input
            id="revisionReason"
            {...register("revisionReason")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            placeholder="e.g. Improved thermal performance, weave density adjustment"
            disabled={isLoading}
          />
          {errors.revisionReason && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.revisionReason.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="requestedChanges" className="text-xs font-semibold text-kavri-ink">
            Requested Changes <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="requestedChanges"
            {...register("requestedChanges")}
            className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="List out modifications requested from the supplier..."
            disabled={isLoading}
          />
          {errors.requestedChanges && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.requestedChanges.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="supplierReportedChanges" className="text-xs font-semibold text-kavri-ink">
            Supplier-Reported Changes <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="supplierReportedChanges"
            {...register("supplierReportedChanges")}
            className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Modifications reported by the supplier..."
            disabled={isLoading}
          />
          {errors.supplierReportedChanges && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.supplierReportedChanges.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="internalNotes" className="text-xs font-semibold text-kavri-ink">
            Internal Notes
          </Label>
          <Textarea
            id="internalNotes"
            {...register("internalNotes")}
            className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Confidential developer logs, measurements, etc."
            disabled={isLoading}
          />
          {errors.internalNotes && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.internalNotes.message}</p>
          )}
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-4">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink">Public Exposure Settings</h4>
          
          <div className="space-y-1.5">
            <Label htmlFor="publicTitle" className="text-xs font-semibold text-kavri-ink">
              Public Title
            </Label>
            <Input
              id="publicTitle"
              {...register("publicTitle")}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="e.g. Generation 2.0 (Thermal Optimization)"
              disabled={isLoading}
            />
            {errors.publicTitle && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.publicTitle.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="publicSummary" className="text-xs font-semibold text-kavri-ink">
              Public Summary
            </Label>
            <Textarea
              id="publicSummary"
              {...register("publicSummary")}
              className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
              placeholder="Expose validation metrics, testing achievements, etc."
              disabled={isLoading}
            />
            {errors.publicSummary && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.publicSummary.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 py-2 select-none">
            <input
              id="isPublic"
              type="checkbox"
              {...register("isPublic")}
              className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal focus:ring-2 focus:ring-offset-2 cursor-pointer"
              disabled={isLoading}
            />
            <Label htmlFor="isPublic" className="text-xs font-medium text-kavri-ink cursor-pointer">
              Expose this revision&apos;s metrics in public updates?
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/owner/products/${productId}`)}
            className="font-sans text-xs font-semibold h-10 px-4 rounded-lg"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-5 rounded-lg flex items-center justify-center gap-1.5"
          >
            {isLoading ? "Saving..." : "Create Revision"}
          </Button>
        </div>
      </form>
    </div>
  );
}
