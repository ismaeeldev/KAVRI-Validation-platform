"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { waitlistSignupSchema } from "@/lib/validation/schemas";
import { waitlistSignupAction } from "@/server/actions/waitlist-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type SignupFormData = zod.infer<typeof waitlistSignupSchema>;

export function WaitlistForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    // @ts-expect-error - Zod version mismatch
    resolver: zodResolver(waitlistSignupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await waitlistSignupAction(data);
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
      <div className="p-4 border border-kavri-signal/20 bg-kavri-signal/5 text-kavri-signal rounded-md font-mono text-xs text-center">
        Thank you. You have been added to the build follow feed.
      </div>
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
          {isLoading ? "SUBSCRIBING..." : "FOLLOW THE BUILD >"}
        </Button>
      </div>
      <p className="text-[10px] text-neutral-500 font-mono">
        By subscribing, you consent to secure data logging of your subscription timestamp.
      </p>
    </form>
  );
}
