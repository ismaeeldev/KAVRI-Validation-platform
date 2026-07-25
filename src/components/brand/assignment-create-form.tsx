"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createAssignmentSchema } from "@/lib/validation/schemas";
import { createAssignmentAction } from "@/server/actions/assignment-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type AssignmentFormData = zod.infer<typeof createAssignmentSchema>;

interface CreateFormProps {
  testers: { id: string; displayName: string; approvalStatus: string }[];
  samples: {
    id: string;
    sampleCode: string;
    status: string;
    product: { id: string; internalName: string };
    revision: { id: string; revisionCode: string };
  }[];
}

export function AssignmentCreateForm({ testers, samples }: CreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState("");

  const [defaultDueAt] = useState(() => {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    // @ts-expect-error - Zod version mismatch
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      requiredSessionCount: 1,
      dueAt: defaultDueAt,
    },
  });

  // Filter approved active testers
  const activeTesters = useMemo(() => testers.filter((t) => t.approvalStatus === "approved"), [testers]);

  // Filter ready samples
  const readySamples = useMemo(() => samples.filter((s) => s.status === "ready_for_testing"), [samples]);

  // Derive product/revision based on selected sample
  const derivedContext = useMemo(() => {
    if (!selectedSampleId) return null;
    const sampleObj = samples.find((s) => s.id === selectedSampleId);
    return sampleObj || null;
  }, [selectedSampleId, samples]);

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedSampleId(sId);
    setValue("sampleId", sId);
  };

  const onSubmit = async (data: AssignmentFormData) => {
    setIsLoading(true);
    try {
      await createAssignmentAction(data);
      toast.success("Validation assignment draft saved.");
      router.push("/owner/assignments");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to create assignment brief.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="testerProfileId" className="text-xs font-semibold text-kavri-ink">
            Select Tester Profile <span className="text-red-500">*</span>
          </Label>
          <select
            id="testerProfileId"
            {...register("testerProfileId")}
            className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
            disabled={isLoading}
          >
            <option value="">Select an approved tester...</option>
            {activeTesters.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName}
              </option>
            ))}
          </select>
          {errors.testerProfileId && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.testerProfileId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sampleSelect" className="text-xs font-semibold text-kavri-ink">
            Select Physical Sample <span className="text-red-500">*</span>
          </Label>
          <select
            id="sampleSelect"
            onChange={handleSampleChange}
            value={selectedSampleId}
            className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
            disabled={isLoading}
          >
            <option value="">Select a ready sample...</option>
            {readySamples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sampleCode}
              </option>
            ))}
          </select>
          {errors.sampleId && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.sampleId.message}</p>
          )}
        </div>

        <input type="hidden" {...register("sampleId")} />

        {/* Derived context visual block */}
        {derivedContext && (
          <div className="p-4 border border-kavri-line bg-[#fafaf8] rounded-lg font-sans text-xs space-y-2">
            <span className="font-mono text-[9px] text-kavri-muted uppercase tracking-widest block font-bold">
              Derived Context Bindings
            </span>
            <div className="flex flex-col gap-1 text-kavri-ink font-semibold">
              <p>Product: <span className="text-kavri-muted font-medium">{derivedContext.product.internalName}</span></p>
              <p>Revision: <span className="font-mono text-[11px] bg-kavri-surface border border-kavri-line px-1.5 py-0.5 rounded-md text-kavri-ink">{derivedContext.revision.revisionCode}</span></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dueAt" className="text-xs font-semibold text-kavri-ink">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dueAt"
              type="date"
              {...register("dueAt")}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              disabled={isLoading}
            />
            {errors.dueAt && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.dueAt.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="requiredSessionCount" className="text-xs font-semibold text-kavri-ink">
              Required Sessions <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requiredSessionCount"
              type="number"
              {...register("requiredSessionCount", { valueAsNumber: true })}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="1"
              disabled={isLoading}
            />
            {errors.requiredSessionCount && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.requiredSessionCount.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instructions" className="text-xs font-semibold text-kavri-ink">
            Validation Instructions <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="instructions"
            {...register("instructions")}
            className="text-xs min-h-[100px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Detail testing procedures, telemetry collection rules, wear test directions, etc."
            disabled={isLoading}
          />
          {errors.instructions && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.instructions.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/owner/assignments")}
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
            {isLoading ? "Saving..." : "Save Draft Assignment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
