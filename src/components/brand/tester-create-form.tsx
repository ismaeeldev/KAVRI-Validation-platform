"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { createTesterSchema } from "@/lib/validation/schemas";
import { createTesterAction } from "@/server/actions/tester-actions";
import { SKILL_LEVEL, PLAYING_FREQUENCY, DOMINANT_HAND } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

type TesterFormData = zod.infer<typeof createTesterSchema>;

interface TesterCreateFormProps {
  onSuccess?: () => void;
}

export function TesterCreateForm({ onSuccess }: TesterCreateFormProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TesterFormData>({
    resolver: zodResolver(createTesterSchema) as unknown as Resolver<TesterFormData>,
  });

  const onSubmit = async (data: TesterFormData) => {
    setIsLoading(true);
    try {
      await createTesterAction(data);
      toast.success("Pending tester profile created successfully.");
      reset();
      router.refresh();
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to onboard tester.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!onSuccess && (
        <div className="space-y-1 pb-3 border-b border-kavri-line">
          <h3 className="font-heading font-black uppercase text-sm text-kavri-ink tracking-wider flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-kavri-muted" />
            <span>Register Tester</span>
          </h3>
          <p className="text-[11px] text-kavri-muted font-sans">
            Onboard a pending play-tester by registering their details.
          </p>
        </div>
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-kavri-ink">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            placeholder="e.g. Jane Smith"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-kavri-ink">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            placeholder="e.g. jane@kavri.co"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="skillLevel" className="text-xs font-semibold text-kavri-ink">Skill Level</Label>
            <select id="skillLevel" {...register("skillLevel")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(SKILL_LEVEL).map((v) => (
                <option key={v} value={v}>{v === "not_sure" ? "Not Sure" : v}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="playingFrequency" className="text-xs font-semibold text-kavri-ink">Playing Frequency</Label>
            <select id="playingFrequency" {...register("playingFrequency")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(PLAYING_FREQUENCY).map((v) => (
                <option key={v} value={v}>{v.split("_").join(" ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currentPaddle" className="text-xs font-semibold text-kavri-ink">Current Paddle</Label>
          <Input id="currentPaddle" {...register("currentPaddle")} className="text-xs h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dominantHand" className="text-xs font-semibold text-kavri-ink">Dominant Hand</Label>
          <select id="dominantHand" {...register("dominantHand")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
            <option value="">Not specified</option>
            {Object.values(DOMINANT_HAND).map((v) => (
              <option key={v} value={v}>{v.split("_").join(" ")}</option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 rounded-lg flex items-center justify-center gap-1.5"
        >
          {isLoading ? "Saving..." : "Add Tester Profile"}
        </Button>
      </form>
    </div>
  );
}
