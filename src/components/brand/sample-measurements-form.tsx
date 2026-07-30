"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { updateSampleMeasurementsSchema } from "@/lib/validation/schemas";
import { updateSampleMeasurementsAction } from "@/server/actions/sample-actions";
import { deriveHandleLengthCategory } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Ruler } from "lucide-react";

type MeasurementsFormData = zod.infer<typeof updateSampleMeasurementsSchema>;

interface Props {
  sampleId: string;
  measurements: {
    actualStaticWeightG: string | null;
    actualSwingWeight: string | null;
    actualSwingWeightMethod: string | null;
    actualSwingWeightDate: string | null;
    actualTwistWeight: string | null;
    actualTwistWeightMethod: string | null;
    actualTwistWeightDate: string | null;
    actualBalancePointMm: string | null;
    actualLengthIn: string | null;
    actualWidthIn: string | null;
    actualHandleLengthIn: string | null;
  };
}

const toNum = (v: string | null): number | undefined => (v === null || v === "" ? undefined : Number(v));

export function SampleMeasurementsForm({ sampleId, measurements }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<MeasurementsFormData>({
    resolver: zodResolver(updateSampleMeasurementsSchema) as unknown as Resolver<MeasurementsFormData>,
    defaultValues: {
      actualStaticWeightG: toNum(measurements.actualStaticWeightG),
      actualSwingWeight: toNum(measurements.actualSwingWeight),
      actualSwingWeightMethod: measurements.actualSwingWeightMethod || "",
      actualSwingWeightDate: measurements.actualSwingWeightDate || "",
      actualTwistWeight: toNum(measurements.actualTwistWeight),
      actualTwistWeightMethod: measurements.actualTwistWeightMethod || "",
      actualTwistWeightDate: measurements.actualTwistWeightDate || "",
      actualBalancePointMm: toNum(measurements.actualBalancePointMm),
      actualLengthIn: toNum(measurements.actualLengthIn),
      actualWidthIn: toNum(measurements.actualWidthIn),
      actualHandleLengthIn: toNum(measurements.actualHandleLengthIn),
    },
  });

  const handleLengthIn = watch("actualHandleLengthIn");
  const handleLengthCategory = deriveHandleLengthCategory(typeof handleLengthIn === "number" ? handleLengthIn : undefined);

  const onSubmit = async (data: MeasurementsFormData) => {
    setIsLoading(true);
    try {
      await updateSampleMeasurementsAction(sampleId, data);
      toast.success("Measurements saved.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to save measurements.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
      <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
        <Ruler className="h-4 w-4 text-kavri-muted" />
        <span>Measurements (Actual)</span>
      </h3>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="actualStaticWeightG" className="text-xs font-semibold text-kavri-ink">Static Weight (g)</Label>
            <Input id="actualStaticWeightG" type="number" step="0.1" {...register("actualStaticWeightG", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualLengthIn" className="text-xs font-semibold text-kavri-ink">Length (in)</Label>
            <Input id="actualLengthIn" type="number" step="0.01" {...register("actualLengthIn", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualWidthIn" className="text-xs font-semibold text-kavri-ink">Width (in)</Label>
            <Input id="actualWidthIn" type="number" step="0.01" {...register("actualWidthIn", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualHandleLengthIn" className="text-xs font-semibold text-kavri-ink">
              Handle Length (in) {handleLengthCategory && <span className="text-kavri-signal-ink font-mono">[{handleLengthCategory}]</span>}
            </Label>
            <Input id="actualHandleLengthIn" type="number" step="0.01" {...register("actualHandleLengthIn", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualBalancePointMm" className="text-xs font-semibold text-kavri-ink">Balance Point (mm)</Label>
            <Input id="actualBalancePointMm" type="number" step="0.1" {...register("actualBalancePointMm", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualSwingWeight" className="text-xs font-semibold text-kavri-ink">Swing Weight</Label>
            <Input id="actualSwingWeight" type="number" step="0.1" {...register("actualSwingWeight", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualSwingWeightMethod" className="text-xs font-semibold text-kavri-ink">Swing Weight Method</Label>
            <Input id="actualSwingWeightMethod" {...register("actualSwingWeightMethod")} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualSwingWeightDate" className="text-xs font-semibold text-kavri-ink">Swing Weight Date</Label>
            <Input id="actualSwingWeightDate" type="date" {...register("actualSwingWeightDate")} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualTwistWeight" className="text-xs font-semibold text-kavri-ink">Twist Weight</Label>
            <Input id="actualTwistWeight" type="number" step="0.1" {...register("actualTwistWeight", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualTwistWeightMethod" className="text-xs font-semibold text-kavri-ink">Twist Weight Method</Label>
            <Input id="actualTwistWeightMethod" {...register("actualTwistWeightMethod")} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualTwistWeightDate" className="text-xs font-semibold text-kavri-ink">Twist Weight Date</Label>
            <Input id="actualTwistWeightDate" type="date" {...register("actualTwistWeightDate")} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
        </div>
        <div className="flex justify-end pt-2 border-t border-kavri-line">
          <Button type="submit" disabled={isLoading} className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-9 px-4 rounded-lg">
            {isLoading ? "Saving..." : "Save Measurements"}
          </Button>
        </div>
      </form>
    </div>
  );
}
