"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { updateTesterProfileSchema } from "@/lib/validation/schemas";
import { updateTesterProfileAction } from "@/server/actions/tester-actions";
import {
  SKILL_LEVEL,
  PLAYING_FREQUENCY,
  PREFERENCE_CONTROL_POWER,
  PREFERENCE_POP,
  PREFERENCE_FEEL,
  DOMINANT_HAND,
  PLAY_STYLE_OPTIONS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ProfileFormData = zod.infer<typeof updateTesterProfileSchema>;

interface Props {
  testerId: string;
  profile: {
    skillLevel: string | null;
    playingFrequency: string | null;
    currentPaddle: string | null;
    playStyle: string | null;
    preferenceControlPower: string | null;
    preferencePop: string | null;
    preferenceFeel: string | null;
    preferenceHandle: string | null;
    dominantHand: string | null;
    singlesDoublesPreference: string | null;
  };
}

export function TesterProfileEditForm({ testerId, profile }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(updateTesterProfileSchema) as unknown as Resolver<ProfileFormData>,
    defaultValues: {
      skillLevel: profile.skillLevel || "",
      playingFrequency: profile.playingFrequency || "",
      currentPaddle: profile.currentPaddle || "",
      playStyle: profile.playStyle ? profile.playStyle.split(",") : [],
      preferenceControlPower: profile.preferenceControlPower || "",
      preferencePop: profile.preferencePop || "",
      preferenceFeel: profile.preferenceFeel || "",
      preferenceHandle: profile.preferenceHandle || "",
      dominantHand: profile.dominantHand || "",
      singlesDoublesPreference: profile.singlesDoublesPreference || "",
    },
  });

  const selectedPlayStyles = watch("playStyle") || [];

  const togglePlayStyle = (style: string) => {
    const current = selectedPlayStyles;
    setValue("playStyle", current.includes(style) ? current.filter((s) => s !== style) : [...current, style]);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateTesterProfileAction(testerId, data);
      toast.success("Tester profile updated.");
      router.push(`/owner/testers/${testerId}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update tester profile.");
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
            <Label htmlFor="skillLevel" className="text-xs font-semibold text-kavri-ink">Skill Level</Label>
            <select id="skillLevel" {...register("skillLevel")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(SKILL_LEVEL).map((v) => <option key={v} value={v}>{v === "not_sure" ? "Not Sure" : v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="playingFrequency" className="text-xs font-semibold text-kavri-ink">Playing Frequency</Label>
            <select id="playingFrequency" {...register("playingFrequency")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(PLAYING_FREQUENCY).map((v) => <option key={v} value={v}>{v.split("_").join(" ")}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currentPaddle" className="text-xs font-semibold text-kavri-ink">Current Paddle</Label>
          <Input id="currentPaddle" {...register("currentPaddle")} className="text-xs h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-kavri-ink">Play Style</Label>
          <div className="flex flex-wrap gap-2">
            {PLAY_STYLE_OPTIONS.map((style) => (
              <button
                type="button"
                key={style}
                onClick={() => togglePlayStyle(style)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${selectedPlayStyles.includes(style) ? "bg-kavri-signal text-kavri-ink border-kavri-signal" : "bg-white border-kavri-line text-kavri-muted"}`}
              >
                {style.split("_").join(" ")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-kavri-line">
          <div className="space-y-1.5">
            <Label htmlFor="preferenceControlPower" className="text-xs font-semibold text-kavri-ink">Control / Power</Label>
            <select id="preferenceControlPower" {...register("preferenceControlPower")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(PREFERENCE_CONTROL_POWER).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preferencePop" className="text-xs font-semibold text-kavri-ink">Pop</Label>
            <select id="preferencePop" {...register("preferencePop")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(PREFERENCE_POP).map((v) => <option key={v} value={v}>{v.split("_").join(" ")}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preferenceFeel" className="text-xs font-semibold text-kavri-ink">Feel</Label>
            <select id="preferenceFeel" {...register("preferenceFeel")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(PREFERENCE_FEEL).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferenceHandle" className="text-xs font-semibold text-kavri-ink">Handle Preference</Label>
          <Input id="preferenceHandle" {...register("preferenceHandle")} className="text-xs h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dominantHand" className="text-xs font-semibold text-kavri-ink">Dominant Hand</Label>
            <select id="dominantHand" {...register("dominantHand")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans" disabled={isLoading}>
              <option value="">Not specified</option>
              {Object.values(DOMINANT_HAND).map((v) => <option key={v} value={v}>{v.split("_").join(" ")}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="singlesDoublesPreference" className="text-xs font-semibold text-kavri-ink">Singles / Doubles</Label>
            <Input id="singlesDoublesPreference" {...register("singlesDoublesPreference")} className="text-xs h-10 px-3 rounded-lg border-kavri-line" disabled={isLoading} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button type="button" variant="outline" onClick={() => router.push(`/owner/testers/${testerId}`)} className="font-sans text-xs font-semibold h-10 px-4 rounded-lg" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-5 rounded-lg">
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
