"use client";

import React, { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { updateSampleMeasurementsSchema } from "@/lib/validation/schemas";
import { updateSampleMeasurementsAction } from "@/server/actions/sample-actions";
import {
  deriveHandleLengthCategory,
  MEASUREMENT_METHOD,
  CORE_THICKNESS_QUICK_OPTIONS_MM,
  BALANCE_POINT_HELPER_TEXT,
  PLAUSIBLE_RANGES,
  ozToGrams,
  gramsToOz,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Ruler, AlertTriangle } from "lucide-react";

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
    actualGripCircumferenceIn: string | null;
    actualCoreThicknessMm: string | null;
  };
}

const toNum = (v: string | null): number | undefined => (v === null || v === "" ? undefined : Number(v));
const todayIso = () => new Date().toISOString().slice(0, 10);

const METHOD_LABELS: Record<string, string> = {
  [MEASUREMENT_METHOD.RDC_BABOLAT]: "RDC (Babolat)",
  [MEASUREMENT_METHOD.ONCOURT_SWINGWEIGHT]: "OnCourt SwingWeight",
  [MEASUREMENT_METHOD.MANUAL_PENDULUM]: "Manual Pendulum",
  [MEASUREMENT_METHOD.TWISTWEIGHT_LAB]: "TwistWeight Lab",
  [MEASUREMENT_METHOD.OTHER]: "Other",
};

// Out-of-range check against PLAUSIBLE_RANGES; returns a warning message or null. `hardMax`
// values (e.g. length=555in) require the same deliberate-confirmation checkbox rather than a
// silent block, per the brief: "Block or require explicit override with clear error."
function rangeWarning(
  label: string,
  value: number | undefined,
  range: { min: number; max: number; hardMax: number }
): string | null {
  if (value === undefined || Number.isNaN(value)) return null;
  if (value > range.hardMax) {
    return `${label} value of ${value} is far outside any plausible paddle range. This looks like a data-entry error.`;
  }
  if (value < range.min || value > range.max) {
    return `${label} value of ${value} is outside the expected paddle range (${range.min}-${range.max}).`;
  }
  return null;
}

export function SampleMeasurementsForm({ sampleId, measurements }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);
  const [staticWeightOz, setStaticWeightOz] = useState<number | undefined>(
    measurements.actualStaticWeightG ? gramsToOz(Number(measurements.actualStaticWeightG)) : undefined
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<MeasurementsFormData>({
    resolver: zodResolver(updateSampleMeasurementsSchema) as unknown as Resolver<MeasurementsFormData>,
    defaultValues: {
      actualStaticWeightG: toNum(measurements.actualStaticWeightG),
      actualSwingWeight: toNum(measurements.actualSwingWeight),
      actualSwingWeightMethod: measurements.actualSwingWeightMethod || "",
      actualSwingWeightDate: measurements.actualSwingWeightDate || todayIso(),
      actualTwistWeight: toNum(measurements.actualTwistWeight),
      actualTwistWeightMethod: measurements.actualTwistWeightMethod || "",
      actualTwistWeightDate: measurements.actualTwistWeightDate || todayIso(),
      actualBalancePointMm: toNum(measurements.actualBalancePointMm),
      actualLengthIn: toNum(measurements.actualLengthIn),
      actualWidthIn: toNum(measurements.actualWidthIn),
      actualHandleLengthIn: toNum(measurements.actualHandleLengthIn),
      actualGripCircumferenceIn: toNum(measurements.actualGripCircumferenceIn),
      actualCoreThicknessMm: toNum(measurements.actualCoreThicknessMm),
    },
  });

  const isKnownMethod = (v: string | undefined) => !v || (Object.values(MEASUREMENT_METHOD) as string[]).includes(v);
  const swingMethodValue = watch("actualSwingWeightMethod");
  const twistMethodValue = watch("actualTwistWeightMethod");
  const [swingMethodIsOther, setSwingMethodIsOther] = useState(!isKnownMethod(measurements.actualSwingWeightMethod || undefined));
  const [twistMethodIsOther, setTwistMethodIsOther] = useState(!isKnownMethod(measurements.actualTwistWeightMethod || undefined));

  const handleLengthIn = watch("actualHandleLengthIn");
  const handleLengthCategory = deriveHandleLengthCategory(typeof handleLengthIn === "number" ? handleLengthIn : undefined);
  const lengthIn = watch("actualLengthIn");
  const widthIn = watch("actualWidthIn");
  const gripCircumferenceIn = watch("actualGripCircumferenceIn");

  // Static weight is entered in oz (primary display/input per the brief); grams are derived
  // and stored — the owner never has to enter both.
  const handleStaticWeightOzChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setStaticWeightOz(undefined);
      setValue("actualStaticWeightG", undefined as unknown as number, { shouldValidate: true });
      return;
    }
    const oz = Number(raw);
    setStaticWeightOz(Number.isNaN(oz) ? undefined : oz);
    setValue("actualStaticWeightG", Number.isNaN(oz) ? (undefined as unknown as number) : ozToGrams(oz), {
      shouldValidate: true,
    });
  };

  const derivedGrams = staticWeightOz !== undefined ? ozToGrams(staticWeightOz) : undefined;

  const warnings = useMemo(() => {
    const list: string[] = [];
    const w = rangeWarning("Static weight", staticWeightOz, PLAUSIBLE_RANGES.staticWeightOz);
    if (w) list.push(w);
    const l = rangeWarning("Overall length", typeof lengthIn === "number" ? lengthIn : undefined, PLAUSIBLE_RANGES.overallLengthIn);
    if (l) list.push(l);
    const wi = rangeWarning("Overall width", typeof widthIn === "number" ? widthIn : undefined, PLAUSIBLE_RANGES.overallWidthIn);
    if (wi) list.push(wi);
    const hl = rangeWarning("Handle length", typeof handleLengthIn === "number" ? handleLengthIn : undefined, PLAUSIBLE_RANGES.handleLengthIn);
    if (hl) list.push(hl);
    const gc = rangeWarning(
      "Grip circumference",
      typeof gripCircumferenceIn === "number" ? gripCircumferenceIn : undefined,
      PLAUSIBLE_RANGES.gripCircumferenceIn
    );
    if (gc) list.push(gc);
    return list;
  }, [staticWeightOz, lengthIn, widthIn, handleLengthIn, gripCircumferenceIn]);

  const onSubmit = async (data: MeasurementsFormData) => {
    if (warnings.length > 0 && !overrideConfirmed) {
      toast.error("One or more measurements look implausible. Review the warning and confirm before saving.");
      return;
    }
    setIsLoading(true);
    try {
      await updateSampleMeasurementsAction(sampleId, { ...data, measurementOverrideConfirmed: overrideConfirmed });
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
            <Label htmlFor="actualStaticWeightOz" className="text-xs font-semibold text-kavri-ink">Static Weight (oz)</Label>
            <Input
              id="actualStaticWeightOz"
              type="number"
              step="0.1"
              value={staticWeightOz ?? ""}
              onChange={handleStaticWeightOzChange}
              className="text-xs h-9 px-3 rounded-lg border-kavri-line"
              disabled={isLoading}
            />
            <p className="text-[10px] text-kavri-muted font-mono">
              {derivedGrams !== undefined ? `= ${derivedGrams} g` : "Enter oz to auto-calculate grams"}
            </p>
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
            <Label htmlFor="actualGripCircumferenceIn" className="text-xs font-semibold text-kavri-ink">Grip Circumference (in)</Label>
            <Input id="actualGripCircumferenceIn" type="number" step="0.01" {...register("actualGripCircumferenceIn", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualCoreThicknessMm" className="text-xs font-semibold text-kavri-ink">Core Thickness (mm)</Label>
            <select
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-9 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal mb-1.5"
              disabled={isLoading}
              onChange={(e) => {
                if (e.target.value) setValue("actualCoreThicknessMm", Number(e.target.value), { shouldValidate: true });
              }}
              defaultValue=""
            >
              <option value="">Quick choice / Other...</option>
              {CORE_THICKNESS_QUICK_OPTIONS_MM.map((mm) => (
                <option key={mm} value={mm}>{mm} mm</option>
              ))}
            </select>
            <Input id="actualCoreThicknessMm" type="number" step="0.1" {...register("actualCoreThicknessMm", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" placeholder="Other numeric value" disabled={isLoading} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="actualBalancePointMm" className="text-xs font-semibold text-kavri-ink">Balance Point (cm)</Label>
            <Input id="actualBalancePointMm" type="number" step="0.1" {...register("actualBalancePointMm", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
            <p className="text-[10px] text-kavri-muted italic">{BALANCE_POINT_HELPER_TEXT}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualSwingWeight" className="text-xs font-semibold text-kavri-ink">Swing Weight</Label>
            <Input id="actualSwingWeight" type="number" step="0.1" {...register("actualSwingWeight", { valueAsNumber: true })} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualSwingWeightMethod" className="text-xs font-semibold text-kavri-ink">Swing Weight Method / Device</Label>
            <select
              id="actualSwingWeightMethod"
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-9 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
              disabled={isLoading}
              value={swingMethodIsOther ? MEASUREMENT_METHOD.OTHER : (swingMethodValue || "")}
              onChange={(e) => {
                const isOther = e.target.value === MEASUREMENT_METHOD.OTHER;
                setSwingMethodIsOther(isOther);
                setValue("actualSwingWeightMethod", isOther ? "" : e.target.value, { shouldValidate: true });
              }}
            >
              <option value="">Not recorded</option>
              {Object.values(MEASUREMENT_METHOD).map((m) => (
                <option key={m} value={m}>{METHOD_LABELS[m]}</option>
              ))}
            </select>
            {swingMethodIsOther && (
              <Input
                {...register("actualSwingWeightMethod")}
                placeholder="Describe device/method"
                className="text-xs h-9 px-3 rounded-lg border-kavri-line"
                disabled={isLoading}
              />
            )}
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
            <Label htmlFor="actualTwistWeightMethod" className="text-xs font-semibold text-kavri-ink">Twist Weight Method / Device</Label>
            <select
              id="actualTwistWeightMethod"
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-9 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
              disabled={isLoading}
              value={twistMethodIsOther ? MEASUREMENT_METHOD.OTHER : (twistMethodValue || "")}
              onChange={(e) => {
                const isOther = e.target.value === MEASUREMENT_METHOD.OTHER;
                setTwistMethodIsOther(isOther);
                setValue("actualTwistWeightMethod", isOther ? "" : e.target.value, { shouldValidate: true });
              }}
            >
              <option value="">Not recorded</option>
              {Object.values(MEASUREMENT_METHOD).map((m) => (
                <option key={m} value={m}>{METHOD_LABELS[m]}</option>
              ))}
            </select>
            {twistMethodIsOther && (
              <Input
                {...register("actualTwistWeightMethod")}
                placeholder="Describe device/method"
                className="text-xs h-9 px-3 rounded-lg border-kavri-line"
                disabled={isLoading}
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualTwistWeightDate" className="text-xs font-semibold text-kavri-ink">Twist Weight Date</Label>
            <Input id="actualTwistWeightDate" type="date" {...register("actualTwistWeightDate")} className="text-xs h-9 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="border border-amber-300 bg-amber-50 rounded-lg p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                {warnings.map((w, i) => (
                  <p key={i} className="text-amber-800 text-[11px] leading-relaxed">{w}</p>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-amber-900 pl-6 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideConfirmed}
                onChange={(e) => setOverrideConfirmed(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              I have verified this value is correct and want to save it anyway.
            </label>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-kavri-line">
          <Button
            type="submit"
            disabled={isLoading || (warnings.length > 0 && !overrideConfirmed)}
            className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-9 px-4 rounded-lg disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Measurements"}
          </Button>
        </div>
      </form>
    </div>
  );
}
