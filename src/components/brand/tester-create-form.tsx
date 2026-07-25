"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { createTesterSchema } from "@/lib/validation/schemas";
import { createTesterAction } from "@/server/actions/tester-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

type TesterFormData = zod.infer<typeof createTesterSchema>;

export function TesterCreateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TesterFormData>({
    resolver: zodResolver(createTesterSchema as any),
  });

  const onSubmit = async (data: TesterFormData) => {
    setIsLoading(true);
    try {
      await createTesterAction(data);
      toast.success("Pending tester profile created successfully.");
      reset();
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to onboard tester.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line bg-kavri-surface rounded-xl p-6 shadow-xs space-y-4">
      <div className="space-y-1 pb-3 border-b border-kavri-line">
        <h3 className="font-heading font-black uppercase text-sm text-kavri-ink tracking-wider flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-kavri-muted" />
          <span>Register Tester</span>
        </h3>
        <p className="text-[11px] text-kavri-muted font-sans">
          Onboard a pending play-tester by registering their details.
        </p>
      </div>

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
