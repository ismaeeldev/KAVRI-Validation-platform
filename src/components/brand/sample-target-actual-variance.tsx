import React from "react";
import { deriveHandleLengthCategory, gramsToOz } from "@/lib/constants";
import { Scale } from "lucide-react";

interface RevisionTargets {
  overallLengthIn: string | null;
  overallWidthIn: string | null;
  handleLengthIn: string | null;
  gripCircumferenceIn: string | null;
  coreThicknessMm: string | null;
  targetStaticWeightMinG: string | null;
  targetStaticWeightMaxG: string | null;
  targetSwingWeight: string | null;
  targetTwistWeight: string | null;
  targetBalancePointMm: string | null;
}

interface SampleActuals {
  actualLengthIn: string | null;
  actualWidthIn: string | null;
  actualHandleLengthIn: string | null;
  actualGripCircumferenceIn: string | null;
  actualCoreThicknessMm: string | null;
  actualStaticWeightG: string | null;
  actualSwingWeight: string | null;
  actualTwistWeight: string | null;
  actualBalancePointMm: string | null;
}

interface Props {
  target: RevisionTargets;
  actual: SampleActuals;
}

const n = (v: string | null): number | null => (v === null || v === "" ? null : Number(v));

interface Row {
  label: string;
  unit: string;
  targetDisplay: string;
  actualValue: number | null;
  targetForVariance: number | null; // midpoint or single target value used for variance math
}

function fmt(v: number | null, digits = 2): string {
  return v === null ? "—" : v.toFixed(digits).replace(/\.?0+$/, "") || "0";
}

export function SampleTargetActualVariance({ target, actual }: Props) {
  const weightMin = n(target.targetStaticWeightMinG);
  const weightMax = n(target.targetStaticWeightMaxG);
  const weightTargetMid = weightMin !== null && weightMax !== null ? (weightMin + weightMax) / 2 : weightMin ?? weightMax;
  const actualWeightG = n(actual.actualStaticWeightG);

  const rows: Row[] = [
    {
      label: "Static Weight",
      unit: "g",
      targetDisplay:
        weightMin !== null && weightMax !== null
          ? `${fmt(weightMin)}–${fmt(weightMax)}`
          : fmt(weightTargetMid),
      actualValue: actualWeightG,
      targetForVariance: weightTargetMid,
    },
    {
      label: "Overall Length",
      unit: "in",
      targetDisplay: fmt(n(target.overallLengthIn)),
      actualValue: n(actual.actualLengthIn),
      targetForVariance: n(target.overallLengthIn),
    },
    {
      label: "Overall Width",
      unit: "in",
      targetDisplay: fmt(n(target.overallWidthIn)),
      actualValue: n(actual.actualWidthIn),
      targetForVariance: n(target.overallWidthIn),
    },
    {
      label: "Handle Length",
      unit: "in",
      targetDisplay: fmt(n(target.handleLengthIn)),
      actualValue: n(actual.actualHandleLengthIn),
      targetForVariance: n(target.handleLengthIn),
    },
    {
      label: "Grip Circumference",
      unit: "in",
      targetDisplay: fmt(n(target.gripCircumferenceIn)),
      actualValue: n(actual.actualGripCircumferenceIn),
      targetForVariance: n(target.gripCircumferenceIn),
    },
    {
      label: "Core Thickness",
      unit: "mm",
      targetDisplay: fmt(n(target.coreThicknessMm), 1),
      actualValue: n(actual.actualCoreThicknessMm),
      targetForVariance: n(target.coreThicknessMm),
    },
    {
      label: "Balance Point",
      unit: "cm",
      targetDisplay: fmt(n(target.targetBalancePointMm), 1),
      actualValue: n(actual.actualBalancePointMm),
      targetForVariance: n(target.targetBalancePointMm),
    },
    {
      label: "Swing Weight",
      unit: "",
      targetDisplay: fmt(n(target.targetSwingWeight), 1),
      actualValue: n(actual.actualSwingWeight),
      targetForVariance: n(target.targetSwingWeight),
    },
    {
      label: "Twist Weight",
      unit: "",
      targetDisplay: fmt(n(target.targetTwistWeight), 1),
      actualValue: n(actual.actualTwistWeight),
      targetForVariance: n(target.targetTwistWeight),
    },
  ];

  const handleCategory = deriveHandleLengthCategory(n(actual.actualHandleLengthIn) ?? undefined);

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
      <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
        <Scale className="h-4 w-4 text-kavri-muted" />
        <span>Target vs Actual vs Variance</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-sans">
          <thead>
            <tr className="text-left border-b border-kavri-line text-[10px] uppercase tracking-wider text-kavri-muted">
              <th className="py-2 pr-3 font-semibold">Measurement</th>
              <th className="py-2 pr-3 font-semibold">Target</th>
              <th className="py-2 pr-3 font-semibold">Actual</th>
              <th className="py-2 pr-3 font-semibold">Variance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const variance =
                row.actualValue !== null && row.targetForVariance !== null
                  ? row.actualValue - row.targetForVariance
                  : null;
              const variancePct =
                variance !== null && row.targetForVariance ? (variance / row.targetForVariance) * 100 : null;
              const isNotable = variance !== null && variancePct !== null && Math.abs(variancePct) >= 5;
              return (
                <tr key={row.label} className="border-b border-kavri-line/50 last:border-0">
                  <td className="py-2 pr-3 font-semibold text-kavri-ink">
                    {row.label}
                    {row.label === "Static Weight" && actualWeightG !== null && (
                      <span className="block text-[10px] font-mono text-kavri-muted font-normal">
                        {gramsToOz(actualWeightG)} oz
                      </span>
                    )}
                    {row.label === "Handle Length" && handleCategory && (
                      <span className="block text-[10px] font-mono text-kavri-signal-ink font-normal">[{handleCategory}]</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-kavri-muted font-mono">
                    {row.targetDisplay === "—" ? "—" : `${row.targetDisplay} ${row.unit}`.trim()}
                  </td>
                  <td className="py-2 pr-3 text-kavri-ink font-mono font-semibold">
                    {row.actualValue === null ? "—" : `${fmt(row.actualValue)} ${row.unit}`.trim()}
                  </td>
                  <td className={`py-2 pr-3 font-mono ${isNotable ? "text-amber-700 font-bold" : "text-kavri-muted"}`}>
                    {variance === null
                      ? "—"
                      : `${variance > 0 ? "+" : ""}${fmt(variance)} ${row.unit}`.trim() +
                        (variancePct !== null ? ` (${variancePct > 0 ? "+" : ""}${variancePct.toFixed(1)}%)` : "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-kavri-muted italic">
        Target values come from the linked product revision and are never overwritten by actual measurements.
      </p>
    </div>
  );
}
