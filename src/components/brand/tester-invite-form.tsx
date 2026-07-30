"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { acceptInvitationSchema } from "@/lib/validation/schemas";
import { acceptInvitationAction } from "@/server/actions/tester-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type InviteFormData = zod.infer<typeof acceptInvitationSchema>;

interface InviteFormProps {
  token: string;
  initialName: string;
  email: string;
}

export function TesterInviteForm({ token, initialName, email }: InviteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(initialName);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(acceptInvitationSchema) as unknown as Resolver<InviteFormData>,
  });

  const onSubmit = async (data: InviteFormData) => {
    if (!name.trim()) {
      toast.error("Please confirm your display name.");
      return;
    }
    setIsLoading(true);
    try {
      await acceptInvitationAction(token, name.trim(), data);
      toast.success("Account activated successfully. Log in with your credentials.");
      router.push("/login");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to accept invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-kavri-line bg-kavri-surface dark:bg-card w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-heading uppercase tracking-widest text-sm">Activate Tester Account</CardTitle>
        <CardDescription className="text-xs">
          Establish credentials for the KAVRI Validation portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={email}
              className="font-mono text-xs bg-kavri-line/20 cursor-not-allowed text-kavri-muted"
              disabled
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Confirm Display Name</Label>
            <Input
              id="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Set Password *</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className="font-mono text-xs"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-destructive font-mono text-[10px]">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="font-mono text-xs"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-destructive font-mono text-[10px]">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kavri-ink text-kavri-paper dark:bg-foreground dark:text-background font-mono text-xs uppercase h-10 mt-4"
          >
            {isLoading ? "Activating..." : "Activate Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
