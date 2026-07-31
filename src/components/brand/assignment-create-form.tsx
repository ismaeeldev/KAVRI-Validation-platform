"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createAssignmentSchema } from "@/lib/validation/schemas";
import { createAssignmentAction, checkAssignmentConflictsAction } from "@/server/actions/assignment-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

type AssignmentFormData = zod.infer<typeof createAssignmentSchema>;

interface CreateFormProps {
  testers: { id: string; displayName: string; approvalStatus: string }[];
  samples: {
    id: string;
    sampleCode: string;
    status: string;
    revisionId: string;
    product: { id: string; internalName: string };
    revision: { id: string; revisionCode: string };
  }[];
  rounds: {
    id: string;
    roundName: string;
    roundCode: string;
    roundRevisions: { revisionId: string }[];
  }[];
}

export function AssignmentCreateForm({ testers, samples, rounds }: CreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState("");
  const [selectedTesterId, setSelectedTesterId] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);
  const [assignAnyway, setAssignAnyway] = useState(false);

  const [defaultDueAt] = useState(() => {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema) as unknown as Resolver<AssignmentFormData>,
    defaultValues: {
      requiredSessionCount: 1,
      dueAt: defaultDueAt,
    },
  });

  const activeTesters = useMemo(() => testers.filter((t) => t.approvalStatus === "approved"), [testers]);

  const selectedRound = useMemo(() => rounds.find((r) => r.id === selectedRoundId) || null, [selectedRoundId, rounds]);

  // Only samples whose revision is actually linked to the chosen round, per Step 10's requirement.
  const readySamples = useMemo(() => {
    if (!selectedRound) return [];
    const linkedRevisionIds = new Set(selectedRound.roundRevisions.map((rr) => rr.revisionId));
    return samples.filter((s) => s.status === "ready_for_testing" && linkedRevisionIds.has(s.revisionId));
  }, [samples, selectedRound]);

  const derivedContext = useMemo(() => {
    if (!selectedSampleId) return null;
    return samples.find((s) => s.id === selectedSampleId) || null;
  }, [selectedSampleId, samples]);

  const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoundId(e.target.value);
    setValue("roundId", e.target.value);
    setSelectedSampleId("");
    setValue("sampleId", "");
  };

  const handleTesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTesterId(e.target.value);
    setValue("testerProfileId", e.target.value);
  };

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedSampleId(sId);
    setValue("sampleId", sId);
  };

  // Re-check conflicts whenever the tester/sample/round trio changes; not a hard block, just an
  // early warning matching the audit's "warn, not prevent" rule. All state updates are deferred
  // into a promise continuation (never called synchronously in the effect body) so a stale
  // conflict check can never overwrite the checkbox for a newer selection.
  useEffect(() => {
    let cancelled = false;

    if (!selectedTesterId || !selectedSampleId || !selectedRoundId) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setConflictWarnings([]);
          setAssignAnyway(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    checkAssignmentConflictsAction(selectedTesterId, selectedSampleId, selectedRoundId)
      .then((warnings) => {
        if (!cancelled) {
          setConflictWarnings(warnings);
          setAssignAnyway(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConflictWarnings([]);
          setAssignAnyway(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTesterId, selectedSampleId, selectedRoundId]);

  const onSubmit = async (data: AssignmentFormData) => {
    if (conflictWarnings.length > 0 && !assignAnyway) {
      toast.error("Confirm 'Assign Anyway' to proceed despite the conflict warning below.");
      return;
    }
    setIsLoading(true);
    try {
      await createAssignmentAction({ ...data, forceAssign: conflictWarnings.length > 0 });
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
          <Label htmlFor="roundId" className="text-xs font-semibold text-kavri-ink">
            Test Round <span className="text-red-500">*</span>
          </Label>
          <select
            id="roundId"
            onChange={handleRoundChange}
            value={selectedRoundId}
            className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
            disabled={isLoading}
          >
            <option value="">Select a recruiting/active round...</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roundName} ({r.roundCode})
              </option>
            ))}
          </select>
          <input type="hidden" {...register("roundId")} />
          {errors.roundId && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.roundId.message}</p>}
          {selectedRoundId && rounds.length === 0 && (
            <p className="text-[11px] text-kavri-muted">No rounds in recruiting/active status. Create or advance a round first.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="testerProfileId" className="text-xs font-semibold text-kavri-ink">
            Select Tester Profile <span className="text-red-500">*</span>
          </Label>
          <select
            id="testerProfileId"
            onChange={handleTesterChange}
            value={selectedTesterId}
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
            disabled={isLoading || !selectedRoundId}
          >
            <option value="">{selectedRoundId ? "Select a ready sample linked to this round..." : "Select a round first..."}</option>
            {readySamples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sampleCode}
              </option>
            ))}
          </select>
          {errors.sampleId && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.sampleId.message}</p>
          )}
          {selectedRoundId && readySamples.length === 0 && (
            <p className="text-[11px] text-kavri-muted">
              No ready samples whose revision is linked to this round. Link a revision on the round detail page first.
            </p>
          )}
        </div>

        <input type="hidden" {...register("sampleId")} />

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

        {conflictWarnings.length > 0 && (
          <div className="border border-amber-300 bg-amber-50 rounded-xl p-4 space-y-3 font-sans text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ShieldAlert className="h-4 w-4" />
              <span>Conflict Warning</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              {conflictWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={assignAnyway}
                onChange={(e) => setAssignAnyway(e.target.checked)}
                className="h-4 w-4 rounded border-amber-400"
              />
              <span className="text-amber-900 font-semibold">Assign Anyway</span>
            </label>
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
            disabled={isLoading || (conflictWarnings.length > 0 && !assignAnyway)}
            className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-5 rounded-lg flex items-center justify-center gap-1.5"
          >
            {isLoading ? "Saving..." : "Save Draft Assignment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
