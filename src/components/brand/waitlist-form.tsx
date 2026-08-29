"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { waitlistSignupSchema } from "@/lib/validation/schemas";
import { waitlistSignupAction } from "@/server/actions/waitlist-actions";
import { WAITLIST_CONSENT_TEXT_VERSION } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUtmAttribution } from "@/components/brand/landing-utm-context";

type SignupFormData = zod.infer<typeof waitlistSignupSchema>;

interface WaitlistFormProps {
  /** Which CTA instance rendered this form (hero/navigation/footer/update). */
  ctaSource?: string;
  /** Premium landing styling: glass input + lime submit. */
  variant?: "default" | "premium" | "premium-banner";
}

export function WaitlistForm({ ctaSource, variant = "default" }: WaitlistFormProps) {
  const { utmSource, utmMedium, utmCampaign, refCode } = useUtmAttribution();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(waitlistSignupSchema) as unknown as Resolver<SignupFormData>,
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await waitlistSignupAction({
        ...data,
        ctaSource,
        utmSource,
        utmMedium,
        utmCampaign,
        ref: refCode,
        consentTextVersion: WAITLIST_CONSENT_TEXT_VERSION,
      });
      setIsSuccess(true);
      toast.success("Subscription processed successfully.");
      reset();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to submit subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={
          variant === "premium"
            ? "p-4 border border-[var(--lp-sage)]/30 bg-[var(--lp-sage-soft)] text-[var(--lp-sage)] rounded-md font-mono text-xs text-center"
            : "p-4 border border-kavri-signal/20 bg-kavri-signal/5 text-kavri-signal rounded-md font-mono text-xs text-center"
        }
      >
        Thank you. You have been added to the build follow feed.
      </div>
    );
  }

  if (variant === "premium" || variant === "premium-banner") {
    const banner = variant === "premium-banner";
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-3 w-full">
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            placeholder="Do not fill this field"
            {...register("honeypot")}
          />
        </div>
        <div className={`flex gap-2 ${banner ? "flex-col sm:flex-row max-w-xl mx-auto" : "max-w-md"}`}>
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="w-full h-12 bg-black/40 border-[var(--lp-line-strong)] text-[var(--lp-text)] placeholder:text-[var(--lp-muted)]/60 font-sans text-sm rounded-xl focus-visible:ring-[var(--lp-sage)] focus-visible:border-[var(--lp-sage)]"
              required
              disabled={isLoading}
              aria-label="Email address"
            />
            {errors.email && (
              <p className="text-red-400 font-mono text-[10px] mt-1">{errors.email.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            aria-label={isLoading ? "Subscribing" : "Join the build"}
            className={
              banner
                ? "shrink-0 h-12 px-6 rounded-xl bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] hover:bg-[var(--lp-sage-bright)] transition-colors font-mono text-[11px] font-bold uppercase tracking-wider disabled:opacity-60 shadow-[0_0_24px_-4px_var(--lp-sage-glow)] lp-focus-ring active:scale-[0.985]"
                : "shrink-0 h-12 w-12 rounded-xl bg-[var(--lp-sage)] text-[var(--lp-sage-ink)] hover:bg-[var(--lp-sage-bright)] transition-colors flex items-center justify-center font-bold text-lg disabled:opacity-60 lp-focus-ring active:scale-[0.985]"
            }
          >
            {isLoading ? "…" : banner ? "Join the Build" : "→"}
          </button>
        </div>
        <p className={`text-[10px] text-[var(--lp-muted)] font-mono ${banner ? "text-center" : ""}`}>
          By joining, you consent to secure logging of your subscription timestamp.
        </p>
      </form>
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-3">
      {/* Honeypot field - hidden from human eyes */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          placeholder="Do not fill this field"
          {...register("honeypot")}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email address"
            {...register("email")}
            className="w-full bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 font-mono text-xs focus:ring-kavri-signal h-11"
            required
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-destructive font-mono text-[10px] mt-1">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-kavri-signal text-kavri-signal-ink hover:bg-kavri-signal-hover hover:opacity-90 font-mono text-xs uppercase tracking-wider h-11 px-6 min-h-[44px] font-black cursor-pointer rounded-sm flex items-center justify-center gap-1"
        >
          {isLoading ? "SUBSCRIBING..." : "JOIN THE BUILD >"}
        </Button>
      </div>
      <p className="text-[10px] text-neutral-500 font-mono">
        By subscribing, you consent to secure data logging of your subscription timestamp.
      </p>
    </form>
  );
}
