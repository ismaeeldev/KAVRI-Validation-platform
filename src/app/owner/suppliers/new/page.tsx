"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createSupplierSchema } from "@/lib/validation/schemas";
import { createSupplierAction } from "@/server/actions/supplier-actions";
import { DashboardPageHeader } from "@/components/brand/dashboard-layout-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type SupplierFormData = zod.infer<typeof createSupplierSchema>;

export default function NewSupplierPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(createSupplierSchema as any),
  });

  const onSubmit = async (data: SupplierFormData) => {
    setIsLoading(true);
    try {
      await createSupplierAction(data);
      toast.success("Supplier successfully logged.");
      router.push("/owner/suppliers");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to log supplier. Duplicate code may be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <DashboardPageHeader
        title="Add New Supplier"
        eyebrow="Supplier Profile"
        description="Establish credentials and logs for a validation partner."
        backHref="/owner/suppliers"
        backLabel="Back to suppliers"
      />

      <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-kavri-ink">
              Supplier Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="e.g. Acme Fabrications"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-semibold text-kavri-ink">
              Supplier Code
            </Label>
            <Input
              id="code"
              {...register("code")}
              className="font-mono text-xs uppercase focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="e.g. ACME-FAB"
              disabled={isLoading}
            />
            {errors.code && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.code.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactName" className="text-xs font-semibold text-kavri-ink">
                Contact Name
              </Label>
              <Input
                id="contactName"
                {...register("contactName")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                placeholder="e.g. John Doe"
                disabled={isLoading}
              />
              {errors.contactName && (
                <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.contactName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="text-xs font-semibold text-kavri-ink">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                {...register("contactEmail")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                placeholder="e.g. john@acme.com"
                disabled={isLoading}
              />
              {errors.contactEmail && (
                <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.contactEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-kavri-ink">
              Internal Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              {...register("notes")}
              className="text-xs min-h-[100px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
              placeholder="Private observation notes, materials quality background, etc."
              disabled={isLoading}
            />
            {errors.notes && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/owner/suppliers")}
              className="font-sans text-xs font-semibold h-10 px-4 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-5 rounded-lg flex items-center justify-center gap-1.5"
            >
              {isLoading ? "Saving..." : "Create Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
