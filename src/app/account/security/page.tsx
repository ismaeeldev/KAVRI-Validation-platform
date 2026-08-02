"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { changePasswordAction } from "@/server/actions/auth-actions";
import { PageHeader } from "@/components/brand/headers";
import { TechnicalDivider } from "@/components/brand/metadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const passwordSchema = zod.object({
  currentPassword: zod.string().min(8, "Password must be at least 8 characters"),
  newPassword: zod.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: zod.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormData = zod.infer<typeof passwordSchema>;

export default function SecurityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema) as unknown as Resolver<PasswordFormData>,
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await changePasswordAction(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully.");
      reset();
      router.push("/");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to change password. Double check your current credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-lg mx-auto w-full py-12 px-4">
      <PageHeader
        title="Security Settings"
        description="Manage your account password and security configuration."
      />
      <TechnicalDivider />

      <Card className="border-kavri-line mt-6 bg-kavri-surface dark:bg-card">
        <CardHeader>
          <CardTitle className="font-heading uppercase text-sm tracking-wider">Change Password</CardTitle>
          <CardDescription className="text-xs">
            Authenticate your current password to establish new secure credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
                className="font-mono text-sm"
              />
              {errors.currentPassword && (
                <p className="text-destructive text-xs font-mono">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                className="font-mono text-sm"
              />
              {errors.newPassword && (
                <p className="text-destructive text-xs font-mono">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="font-mono text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-xs font-mono">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-kavri-ink text-kavri-paper dark:bg-foreground dark:text-background font-mono uppercase tracking-wider text-xs h-10"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
