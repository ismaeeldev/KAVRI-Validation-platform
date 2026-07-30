"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createRoundSchema } from "@/lib/validation/schemas";
import { createRoundAction } from "@/server/actions/test-round-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type RoundFormData = zod.infer<typeof createRoundSchema>;

interface RevisionOption {
  id: string;
  revisionCode: string;
  product: { internalName: string };
}

interface CreateFormProps {
  revisions: RevisionOption[];
}

export function RoundCreateForm({ revisions }: CreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRevisionIds, setSelectedRevisionIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoundFormData>({
    resolver: zodResolver(createRoundSchema) as unknown as Resolver<RoundFormData>,
    defaultValues: {
      requiredFormFirstImpression: true,
      requiredFormFollowUp: true,
      requiredFormIssueReport: false,
      requiredSessionCount: 1,
    },
  });

  const toggleRevision = (id: string) => {
    setSelectedRevisionIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const onSubmit = async (data: RoundFormData) => {
    setIsLoading(true);
    try {
      await createRoundAction({ ...data, revisionIds: selectedRevisionIds });
      toast.success("Test round created.");
      router.push("/owner/rounds");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to create test round.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="roundName" className="text-xs font-semibold text-kavri-ink">
              Round Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roundName"
              {...register("roundName")}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="e.g. Pilot Round 1"
              disabled={isLoading}
            />
            {errors.roundName && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.roundName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roundCode" className="text-xs font-semibold text-kavri-ink">
              Round Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roundCode"
              {...register("roundCode")}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line font-mono"
              placeholder="e.g. R1"
              disabled={isLoading}
            />
            {errors.roundCode && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.roundCode.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purpose" className="text-xs font-semibold text-kavri-ink">
            Purpose <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="purpose"
            {...register("purpose")}
            className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="What decision should this round support?"
            disabled={isLoading}
          />
          {errors.purpose && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.purpose.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="startAt" className="text-xs font-semibold text-kavri-ink">Start Date</Label>
            <Input id="startAt" type="date" {...register("startAt")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endAt" className="text-xs font-semibold text-kavri-ink">End Date</Label>
            <Input id="endAt" type="date" {...register("endAt")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instructions" className="text-xs font-semibold text-kavri-ink">
            Tester Instructions <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="instructions"
            {...register("instructions")}
            className="text-xs min-h-[100px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Instructions shown to testers in this round..."
            disabled={isLoading}
          />
          {errors.instructions && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.instructions.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="requiredSessionCount" className="text-xs font-semibold text-kavri-ink">
            Required Session Count <span className="text-red-500">*</span>
          </Label>
          <Input
            id="requiredSessionCount"
            type="number"
            inputMode="numeric"
            {...register("requiredSessionCount", { valueAsNumber: true })}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line max-w-[160px]"
            disabled={isLoading}
          />
          {errors.requiredSessionCount && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.requiredSessionCount.message}</p>}
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-2">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink">Required Forms</h4>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" {...register("requiredFormFirstImpression")} className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal" disabled={isLoading} />
              <span className="text-xs font-medium text-kavri-ink">First Impression</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" {...register("requiredFormFollowUp")} className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal" disabled={isLoading} />
              <span className="text-xs font-medium text-kavri-ink">Follow-Up</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" {...register("requiredFormIssueReport")} className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal" disabled={isLoading} />
              <span className="text-xs font-medium text-kavri-ink">Issue Report</span>
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="publicSummary" className="text-xs font-semibold text-kavri-ink">Public Summary</Label>
          <Textarea
            id="publicSummary"
            {...register("publicSummary")}
            className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Shown publicly once approved (optional)..."
            disabled={isLoading}
          />
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-2">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink">Linked Revisions</h4>
          {revisions.length === 0 ? (
            <p className="text-xs text-kavri-muted">No product revisions available to link.</p>
          ) : (
            <div className="max-h-56 overflow-y-auto border border-kavri-line rounded-lg divide-y divide-kavri-line/60">
              {revisions.map((r) => (
                <label key={r.id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer select-none hover:bg-kavri-surface-subtle">
                  <input
                    type="checkbox"
                    checked={selectedRevisionIds.includes(r.id)}
                    onChange={() => toggleRevision(r.id)}
                    className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal"
                    disabled={isLoading}
                  />
                  <span className="text-xs font-medium text-kavri-ink">
                    {r.product.internalName} <span className="font-mono text-kavri-muted">{r.revisionCode}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/owner/rounds")}
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
            {isLoading ? "Creating..." : "Create Round"}
          </Button>
        </div>
      </form>
    </div>
  );
}
