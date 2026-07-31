"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

type ForgotPasswordFormData = zod.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema) as unknown as Resolver<ForgotPasswordFormData>,
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result?.error) {
        toast.error(result.error.message || "Failed to send reset email.");
        return;
      }
      setIsSubmitted(true);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-kavri-line bg-kavri-surface dark:bg-card w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-heading uppercase tracking-widest text-sm">Check Your Email</CardTitle>
          <CardDescription className="text-xs">
            If this email exists in our system, a password reset link has been sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <a href="/login" className="font-mono text-[10px] uppercase tracking-wider text-kavri-signal hover:underline">
            Return to Access Portal
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-kavri-line bg-kavri-surface dark:bg-card w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-heading uppercase tracking-widest text-sm">Forgot Password</CardTitle>
        <CardDescription className="text-xs">
          Enter your account email and we will send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="font-mono text-xs"
              placeholder="e.g. name@domain.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-destructive font-mono text-[10px]">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kavri-ink text-kavri-paper dark:bg-foreground dark:text-background font-mono uppercase tracking-wider text-xs h-10"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
