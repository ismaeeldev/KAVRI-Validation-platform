"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createPlaySessionSchema } from "@/lib/validation/schemas";
import { createPlaySessionAction } from "@/server/actions/evaluation-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type SessionFormData = zod.infer<typeof createPlaySessionSchema>;

interface PlaySessionFormProps {
  assignmentId: string;
  onLogged?: () => void;
}

export function PlaySessionForm({ assignmentId, onLogged }: PlaySessionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(createPlaySessionSchema) as unknown as Resolver<SessionFormData>,
    defaultValues: {
      sessionDate: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    setIsLoading(true);
    try {
      await createPlaySessionAction(assignmentId, data);
      toast.success("Play session logged.");
      reset({ sessionDate: new Date().toISOString().slice(0, 10) });
      router.refresh();
      onLogged?.();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to log play session.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-mono text-xs">
      <div className="space-y-1.5">
        <Label htmlFor="sessionDate" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Session Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sessionDate"
          type="date"
          {...register("sessionDate")}
          className="text-xs h-11 min-h-[44px] px-3 rounded-sm border-kavri-line"
          disabled={isLoading}
        />
        {errors.sessionDate && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.sessionDate.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="durationMinutes" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Duration (minutes)
        </Label>
        <Input
          id="durationMinutes"
          type="number"
          inputMode="numeric"
          {...register("durationMinutes", { valueAsNumber: true })}
          className="text-xs h-11 min-h-[44px] px-3 rounded-sm border-kavri-line"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="conditions" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Conditions
        </Label>
        <Input
          id="conditions"
          {...register("conditions")}
          placeholder="Indoor, outdoor, ball type, format..."
          className="text-xs h-11 min-h-[44px] px-3 rounded-sm border-kavri-line"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="referencePaddle" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Reference Paddle Used
        </Label>
        <Input
          id="referencePaddle"
          {...register("referencePaddle")}
          className="text-xs h-11 min-h-[44px] px-3 rounded-sm border-kavri-line"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-[10px] uppercase tracking-wider text-kavri-muted">
          Notes
        </Label>
        <Textarea
          id="notes"
          {...register("notes")}
          className="text-xs min-h-[80px] p-3 rounded-sm border-kavri-line resize-y"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-kavri-ink text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider h-11 min-h-[44px]"
      >
        {isLoading ? "Logging..." : "Log Play Session"}
      </Button>
    </form>
  );
}
