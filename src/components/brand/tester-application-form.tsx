"use client";

import React, { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { testerApplicationSchema } from "@/lib/validation/schemas";
import { testerApplicationAction } from "@/server/actions/waitlist-actions";
import { WAITLIST_CONSENT_TEXT_VERSION, SKILL_LEVEL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ApplicationFormData = zod.infer<typeof testerApplicationSchema>;

const SKILL_LEVEL_LABELS: Record<string, string> = {
  [SKILL_LEVEL.L2_5]: "2.5 — Beginner",
  [SKILL_LEVEL.L3_0]: "3.0 — Advanced Beginner",
  [SKILL_LEVEL.L3_5]: "3.5 — Intermediate",
  [SKILL_LEVEL.L4_0]: "4.0 — Advanced Intermediate",
  [SKILL_LEVEL.L4_5]: "4.5 — Advanced",
  [SKILL_LEVEL.L5_0_PLUS]: "5.0+ — Elite",
};

interface TesterApplicationFormProps {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  refCode?: string;
  onSuccess?: () => void;
}

export function TesterApplicationForm({ utmSource, utmMedium, utmCampaign, refCode, onSuccess }: TesterApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(testerApplicationSchema) as unknown as Resolver<ApplicationFormData>,
    defaultValues: { consentGiven: false, consentTextVersion: WAITLIST_CONSENT_TEXT_VERSION },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true);
    try {
      await testerApplicationAction({
        ...data,
        utmSource,
        utmMedium,
        utmCampaign,
        ref: refCode,
        consentTextVersion: WAITLIST_CONSENT_TEXT_VERSION,
      });
      setIsSuccess(true);
      toast.success("Application received.");
      reset();
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to submit application.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-4 border border-kavri-signal/20 bg-kavri-signal/5 text-kavri-signal rounded-md font-mono text-xs text-center">
        Application received. We will reach out if you are a fit for an upcoming test round.
      </div>
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="hidden" aria-hidden="true">
        <input type="text" tabIndex={-1} autoComplete="off" placeholder="Do not fill this field" {...register("honeypot")} />
      </div>

      <div>
        <Label htmlFor="applicant-name" className="text-xs font-semibold">Name</Label>
        <Input id="applicant-name" {...register("name")} disabled={isLoading} className="mt-1" />
        {errors.name && <p className="text-destructive font-mono text-[10px] mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="applicant-email" className="text-xs font-semibold">Email</Label>
        <Input id="applicant-email" type="email" {...register("email")} disabled={isLoading} className="mt-1" />
        {errors.email && <p className="text-destructive font-mono text-[10px] mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="applicant-skill" className="text-xs font-semibold">Skill Level (optional)</Label>
        <select
          id="applicant-skill"
          {...register("skillLevel")}
          disabled={isLoading}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 h-10 text-xs"
        >
          <option value="">Prefer not to say</option>
          {Object.values(SKILL_LEVEL).map((level) => (
            <option key={level} value={level}>{SKILL_LEVEL_LABELS[level]}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="applicant-notes" className="text-xs font-semibold">Why do you want to test? (optional)</Label>
        <Textarea id="applicant-notes" {...register("applicationNotes")} disabled={isLoading} className="mt-1" rows={3} />
        {errors.applicationNotes && <p className="text-destructive font-mono text-[10px] mt-1">{errors.applicationNotes.message}</p>}
      </div>

      <div className="flex items-start gap-2">
        <Controller
          control={control}
          name="consentGiven"
          render={({ field }) => (
            <Checkbox
              id="applicant-consent"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={isLoading}
            />
          )}
        />
        <Label htmlFor="applicant-consent" className="text-[11px] font-normal leading-snug">
          I consent to secure data logging of my application and understand KAVRI may contact me about test opportunities.
        </Label>
      </div>
      {errors.consentGiven && <p className="text-destructive font-mono text-[10px]">{errors.consentGiven.message}</p>}

      <Button type="submit" disabled={isLoading} className="w-full font-mono text-xs uppercase tracking-wider">
        {isLoading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
