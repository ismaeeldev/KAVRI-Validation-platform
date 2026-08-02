"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

type ResetPasswordFormData = zod.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema) as unknown as Resolver<ResetPasswordFormData>,
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });
      if (result?.error) {
        toast.error(result.error.message || "Failed to reset password. The link may have expired.");
        return;
      }
      toast.success("Password reset successfully. Log in with your new password.");
      router.push("/login");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-kavri-line bg-kavri-surface dark:bg-card w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-heading uppercase tracking-widest text-sm">Reset Password</CardTitle>
        <CardDescription className="text-xs">Set a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className="font-mono text-xs"
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && <p className="text-destructive font-mono text-[10px]">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="font-mono text-xs"
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-destructive font-mono text-[10px]">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kavri-ink text-kavri-paper dark:bg-foreground dark:text-background font-mono uppercase tracking-wider text-xs h-10"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
