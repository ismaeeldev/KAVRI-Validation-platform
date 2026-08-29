"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { updateRevisionSchema, REVISION_SPEC_FIELDS } from "@/lib/validation/schemas";
import { updateRevisionAction } from "@/server/actions/product-actions";
import {
  DEVELOPMENT_STAGE,
  SHAPE,
  PERFORMANCE_PROFILE,
  FIREPOWER_BALANCE,
  SPIN_RATING,
  FEEL_QUADRANT,
  PUBLIC_STATE,
  deriveHandleLengthCategory,
  MEASUREMENT_METHOD,
  BALANCE_POINT_HELPER_TEXT,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lock, ShieldAlert } from "lucide-react";

type RevisionFormData = zod.infer<typeof updateRevisionSchema>;

interface EditFormProps {
  productId: string;
  revision: {
    id: string;
    revisionCode: string;
    revisionReason: string;
    requestedChanges: string;
    supplierReportedChanges: string;
    internalNotes: string | null;
    publicTitle: string | null;
    publicSummary: string | null;
    developmentStage: string;
    isPublic: boolean;
    shape: string | null;
    performanceProfile: string | null;
    firepowerBalance: string | null;
    coreThicknessMm: string | null;
    overallLengthIn: string | null;
    overallWidthIn: string | null;
    handleLengthIn: string | null;
    gripCircumferenceIn: string | null;
    handleWidthIn: string | null;
    handleDepthIn: string | null;
    targetStaticWeightMinG: string | null;
    targetStaticWeightMaxG: string | null;
    targetSwingWeight: string | null;
    targetSwingWeightMethod: string | null;
    targetTwistWeight: string | null;
    targetTwistWeightMethod: string | null;
    targetBalancePointMm: string | null;
    spinRating: string;
    spinRatingSource: string | null;
    spinRatingDate: string | null;
    spinRatingConfidence: string | null;
    feelQuadrant: string;
    publicState: string;
  };
  isLocked: boolean;
}

const toNum = (v: string | null): number | undefined => (v === null || v === "" ? undefined : Number(v));

export function RevisionEditForm({ productId, revision, isLocked }: EditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [requestCorrection, setRequestCorrection] = useState(false);

  const specFieldsDisabled = isLocked && !requestCorrection;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RevisionFormData>({
    resolver: zodResolver(updateRevisionSchema) as unknown as Resolver<RevisionFormData>,
    defaultValues: {
      revisionReason: revision.revisionReason,
      requestedChanges: revision.requestedChanges,
      supplierReportedChanges: revision.supplierReportedChanges,
      internalNotes: revision.internalNotes || "",
      publicTitle: revision.publicTitle || "",
      publicSummary: revision.publicSummary || "",
      developmentStage: revision.developmentStage as RevisionFormData["developmentStage"],
      isPublic: revision.isPublic,
      shape: revision.shape || "",
      performanceProfile: revision.performanceProfile || "",
      firepowerBalance: revision.firepowerBalance || "",
      coreThicknessMm: toNum(revision.coreThicknessMm),
      overallLengthIn: toNum(revision.overallLengthIn),
      overallWidthIn: toNum(revision.overallWidthIn),
      handleLengthIn: toNum(revision.handleLengthIn),
      gripCircumferenceIn: toNum(revision.gripCircumferenceIn),
      handleWidthIn: toNum(revision.handleWidthIn),
      handleDepthIn: toNum(revision.handleDepthIn),
      targetStaticWeightMinG: toNum(revision.targetStaticWeightMinG),
      targetStaticWeightMaxG: toNum(revision.targetStaticWeightMaxG),
      targetSwingWeight: toNum(revision.targetSwingWeight),
      targetSwingWeightMethod: revision.targetSwingWeightMethod || "",
      targetTwistWeight: toNum(revision.targetTwistWeight),
      targetTwistWeightMethod: revision.targetTwistWeightMethod || "",
      targetBalancePointMm: toNum(revision.targetBalancePointMm),
      spinRating: revision.spinRating,
      spinRatingSource: revision.spinRatingSource || "",
      spinRatingDate: revision.spinRatingDate || "",
      spinRatingConfidence: revision.spinRatingConfidence || "",
      feelQuadrant: revision.feelQuadrant,
      publicState: revision.publicState,
      isControlledCorrection: false,
    },
  });

  const handleLengthIn = watch("handleLengthIn");
  const handleLengthCategory = deriveHandleLengthCategory(typeof handleLengthIn === "number" ? handleLengthIn : undefined);

  const onSubmit = async (data: RevisionFormData) => {
    setIsLoading(true);
    try {
      await updateRevisionAction(revision.id, productId, { ...data, isControlledCorrection: requestCorrection });
      toast.success(requestCorrection ? "Revision corrected and logged." : "Revision updated.");
      router.push(`/owner/products/${productId}/revisions/${revision.id}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update revision.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {isLocked && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900">
          <Lock className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-xs font-sans space-y-1.5">
            <p className="font-semibold">
              This revision has a physical sample registered against it, so its specification fields
              (dimensions, weights, shape) are locked to protect historical accuracy.
            </p>
            {!requestCorrection ? (
              <button
                type="button"
                onClick={() => setRequestCorrection(true)}
                className="font-bold underline hover:no-underline"
              >
                Request Correction
              </button>
            ) : (
              <p className="flex items-center gap-1 text-red-700 font-semibold">
                <ShieldAlert className="h-3.5 w-3.5" />
                Correction mode enabled - spec field changes will be logged with before/after values.
              </p>
            )}
          </div>
        </div>
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-kavri-ink">Revision Code</Label>
            <p className="font-mono text-xs uppercase h-10 flex items-center px-3 rounded-lg border border-kavri-line bg-kavri-surface-subtle text-kavri-muted">
              {revision.revisionCode} (immutable)
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="developmentStage" className="text-xs font-semibold text-kavri-ink">
              Development Stage <span className="text-red-500">*</span>
            </Label>
            <select id="developmentStage" {...register("developmentStage")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
              {Object.entries(DEVELOPMENT_STAGE).map(([key, val]) => (
                <option key={val} value={val}>{key.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="revisionReason" className="text-xs font-semibold text-kavri-ink">Revision Reason <span className="text-red-500">*</span></Label>
          <Input id="revisionReason" {...register("revisionReason")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          {errors.revisionReason && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.revisionReason.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="requestedChanges" className="text-xs font-semibold text-kavri-ink">Requested Changes <span className="text-red-500">*</span></Label>
          <Textarea id="requestedChanges" {...register("requestedChanges")} className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y" disabled={isLoading} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="supplierReportedChanges" className="text-xs font-semibold text-kavri-ink">Supplier-Reported Changes <span className="text-red-500">*</span></Label>
          <Textarea id="supplierReportedChanges" {...register("supplierReportedChanges")} className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y" disabled={isLoading} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="internalNotes" className="text-xs font-semibold text-kavri-ink">Internal Notes</Label>
          <Textarea id="internalNotes" {...register("internalNotes")} className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y" disabled={isLoading} />
        </div>

        <div className="flex items-center gap-2 py-2 select-none">
          <input id="isPublic" type="checkbox" {...register("isPublic")} className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal focus:ring-2 focus:ring-offset-2 cursor-pointer" disabled={isLoading} />
          <Label htmlFor="isPublic" className="text-xs font-medium text-kavri-ink cursor-pointer">Expose this revision&apos;s metrics in public updates?</Label>
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-4">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5">
            Shape &amp; Performance {specFieldsDisabled && <Lock className="h-3 w-3 text-amber-600" />}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="shape" className="text-xs font-semibold text-kavri-ink">Shape</Label>
              <select id="shape" {...register("shape")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled}>
                <option value="">Use product default</option>
                {Object.entries(SHAPE).map(([key, val]) => (
                  <option key={val} value={val}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="performanceProfile" className="text-xs font-semibold text-kavri-ink">Performance Profile</Label>
              <select id="performanceProfile" {...register("performanceProfile")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                <option value="">Use product default</option>
                {Object.entries(PERFORMANCE_PROFILE).map(([key, val]) => (
                  <option key={val} value={val}>{key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="firepowerBalance" className="text-xs font-semibold text-kavri-ink">Firepower Balance</Label>
              <select id="firepowerBalance" {...register("firepowerBalance")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                <option value="">Use product default</option>
                {Object.entries(FIREPOWER_BALANCE).map(([key, val]) => (
                  <option key={val} value={val}>{key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-4">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5">
            Dimensions &amp; Weight (Targets) {specFieldsDisabled && <Lock className="h-3 w-3 text-amber-600" />}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="coreThicknessMm" className="text-xs font-semibold text-kavri-ink">Core Thickness (mm)</Label>
              <select
                className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal mb-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading || specFieldsDisabled}
                onChange={(e) => {
                  if (e.target.value) setValue("coreThicknessMm", Number(e.target.value), { shouldValidate: true });
                }}
                defaultValue=""
              >
                <option value="">Quick choice / Other...</option>
                <option value="13">13 mm</option>
                <option value="14">14 mm</option>
                <option value="16">16 mm</option>
              </select>
              <Input id="coreThicknessMm" type="number" step="0.1" {...register("coreThicknessMm", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="overallLengthIn" className="text-xs font-semibold text-kavri-ink">Overall Length (in)</Label>
              <Input id="overallLengthIn" type="number" step="0.01" {...register("overallLengthIn", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="overallWidthIn" className="text-xs font-semibold text-kavri-ink">Overall Width (in)</Label>
              <Input id="overallWidthIn" type="number" step="0.01" {...register("overallWidthIn", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="handleLengthIn" className="text-xs font-semibold text-kavri-ink">
                Handle Length (in) {handleLengthCategory && <span className="text-kavri-signal-ink font-mono">[{handleLengthCategory}]</span>}
              </Label>
              <Input id="handleLengthIn" type="number" step="0.01" {...register("handleLengthIn", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gripCircumferenceIn" className="text-xs font-semibold text-kavri-ink">Grip Circumference (in)</Label>
              <Input id="gripCircumferenceIn" type="number" step="0.01" {...register("gripCircumferenceIn", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="handleWidthIn" className="text-xs font-semibold text-kavri-ink">Handle Width (in)</Label>
              <Input id="handleWidthIn" type="number" step="0.01" {...register("handleWidthIn", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="handleDepthIn" className="text-xs font-semibold text-kavri-ink">Handle Depth (in)</Label>
              <Input id="handleDepthIn" type="number" step="0.01" {...register("handleDepthIn", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetStaticWeightMinG" className="text-xs font-semibold text-kavri-ink">Static Weight Min (g)</Label>
              <Input id="targetStaticWeightMinG" type="number" step="0.1" {...register("targetStaticWeightMinG", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetStaticWeightMaxG" className="text-xs font-semibold text-kavri-ink">Static Weight Max (g)</Label>
              <Input id="targetStaticWeightMaxG" type="number" step="0.1" {...register("targetStaticWeightMaxG", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetSwingWeight" className="text-xs font-semibold text-kavri-ink">Swing Weight</Label>
              <Input id="targetSwingWeight" type="number" step="0.1" {...register("targetSwingWeight", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetSwingWeightMethod" className="text-xs font-semibold text-kavri-ink">Swing Weight Method</Label>
              <Input id="targetSwingWeightMethod" list="measurement-method-options" {...register("targetSwingWeightMethod")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetTwistWeight" className="text-xs font-semibold text-kavri-ink">Twist Weight</Label>
              <Input id="targetTwistWeight" type="number" step="0.1" {...register("targetTwistWeight", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetTwistWeightMethod" className="text-xs font-semibold text-kavri-ink">Twist Weight Method</Label>
              <Input id="targetTwistWeightMethod" list="measurement-method-options" {...register("targetTwistWeightMethod")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetBalancePointMm" className="text-xs font-semibold text-kavri-ink">Balance Point (cm)</Label>
              <Input id="targetBalancePointMm" type="number" step="0.1" {...register("targetBalancePointMm", { valueAsNumber: true })} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || specFieldsDisabled} />
              <p className="text-[10px] text-kavri-muted italic">{BALANCE_POINT_HELPER_TEXT}</p>
            </div>
          </div>
          <datalist id="measurement-method-options">
            {Object.values(MEASUREMENT_METHOD).map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          {specFieldsDisabled && (
            <p className="text-[10px] text-amber-700">
              Locked because a physical sample references this revision. Fields not listed under REVISION_SPEC_FIELDS
              ({REVISION_SPEC_FIELDS.length} tracked fields) remain freely editable.
            </p>
          )}
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-4">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink">Assessment (always editable)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="spinRating" className="text-xs font-semibold text-kavri-ink">Spin Rating</Label>
              <select id="spinRating" {...register("spinRating")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                {Object.entries(SPIN_RATING).map(([key, val]) => (
                  <option key={val} value={val}>{key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feelQuadrant" className="text-xs font-semibold text-kavri-ink">Feel Quadrant</Label>
              <select id="feelQuadrant" {...register("feelQuadrant")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                <option value={FEEL_QUADRANT.NOT_YET_ASSESSED}>Not Yet Assessed</option>
                <option value={FEEL_QUADRANT.A_STIFF_DENSE}>A - Stiff + Dense</option>
                <option value={FEEL_QUADRANT.B_STIFF_HOLLOW}>B - Stiff + Hollow</option>
                <option value={FEEL_QUADRANT.C_SOFT_DENSE}>C - Soft + Dense</option>
                <option value={FEEL_QUADRANT.D_SOFT_HOLLOW}>D - Soft + Hollow</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spinRatingSource" className="text-xs font-semibold text-kavri-ink">Spin Rating Source</Label>
              <Input id="spinRatingSource" {...register("spinRatingSource")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spinRatingDate" className="text-xs font-semibold text-kavri-ink">Spin Rating Date</Label>
              <Input id="spinRatingDate" type="date" {...register("spinRatingDate")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
            </div>
          </div>
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-4">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink">Public Exposure Settings</h4>
          <div className="space-y-1.5">
            <Label htmlFor="publicState" className="text-xs font-semibold text-kavri-ink">Public State</Label>
            <select id="publicState" {...register("publicState")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
              {Object.entries(PUBLIC_STATE).map(([key, val]) => (
                <option key={val} value={val}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="publicTitle" className="text-xs font-semibold text-kavri-ink">Public Title</Label>
            <Input id="publicTitle" {...register("publicTitle")} className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="publicSummary" className="text-xs font-semibold text-kavri-ink">Public Summary</Label>
            <Textarea id="publicSummary" {...register("publicSummary")} className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y" disabled={isLoading} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button type="button" variant="outline" onClick={() => router.push(`/owner/products/${productId}/revisions/${revision.id}`)} className="font-sans text-xs font-semibold h-10 px-4 rounded-lg" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-5 rounded-lg flex items-center justify-center gap-1.5">
            {isLoading ? "Saving..." : requestCorrection ? "Save Correction" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
