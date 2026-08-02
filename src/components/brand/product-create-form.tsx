"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createProductSchema } from "@/lib/validation/schemas";
import { createProductAction } from "@/server/actions/product-actions";
import { SHAPE, PERFORMANCE_PROFILE, FIREPOWER_BALANCE, PUBLIC_STATE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ProductFormData = zod.infer<typeof createProductSchema>;

interface CreateFormProps {
  suppliers: {
    id: string;
    name: string;
    status: string;
  }[];
}

export function ProductCreateForm({ suppliers }: CreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(createProductSchema) as unknown as Resolver<ProductFormData>,
    defaultValues: {
      isPublic: false,
      publicState: PUBLIC_STATE.PRIVATE,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      await createProductAction(data);
      toast.success("Product successfully logged.");
      router.push("/owner/products");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to log product.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeSuppliers = suppliers.filter((s) => s.status !== "archived");

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="supplierId" className="text-xs font-semibold text-kavri-ink">
            Link Supplier <span className="text-red-500">*</span>
          </Label>
          <select
            id="supplierId"
            {...register("supplierId")}
            className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
            disabled={isLoading}
          >
            <option value="">Select a supplier...</option>
            {activeSuppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.supplierId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="internalName" className="text-xs font-semibold text-kavri-ink">
            Internal Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="internalName"
            {...register("internalName")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            placeholder="e.g. Carbon Weave Core v2"
            disabled={isLoading}
          />
          {errors.internalName && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.internalName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="publicAlias" className="text-xs font-semibold text-kavri-ink">
            Public Alias (Alias shown to public)
          </Label>
          <Input
            id="publicAlias"
            {...register("publicAlias")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            placeholder="e.g. AeroCore V2"
            disabled={isLoading}
          />
          {errors.publicAlias && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.publicAlias.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descriptionInternal" className="text-xs font-semibold text-kavri-ink">
            Internal Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="descriptionInternal"
            {...register("descriptionInternal")}
            className="text-xs min-h-[100px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Confidential carbon composites specification, validation testing targets, etc."
            disabled={isLoading}
          />
          {errors.descriptionInternal && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.descriptionInternal.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="publicSummary" className="text-xs font-semibold text-kavri-ink">
            Public Summary
          </Label>
          <Textarea
            id="publicSummary"
            {...register("publicSummary")}
            className="text-xs min-h-[100px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Brief summary shown on public updates page..."
            disabled={isLoading}
          />
          {errors.publicSummary && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.publicSummary.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2 py-2 select-none">
          <input
            id="isPublic"
            type="checkbox"
            {...register("isPublic")}
            className="h-4 w-4 rounded border-kavri-line text-kavri-signal focus:ring-kavri-signal focus:ring-2 focus:ring-offset-2 cursor-pointer"
            disabled={isLoading}
          />
          <Label htmlFor="isPublic" className="text-xs font-medium text-kavri-ink cursor-pointer">
            Expose this product structure in public updates?
          </Label>
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-4">
          <h4 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink">Defaults (revisions may override)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="shape" className="text-xs font-semibold text-kavri-ink">Shape</Label>
              <select id="shape" {...register("shape")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                <option value="">Not specified</option>
                {Object.entries(SHAPE).map(([key, val]) => (
                  <option key={val} value={val}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="performanceProfile" className="text-xs font-semibold text-kavri-ink">Performance Profile</Label>
              <select id="performanceProfile" {...register("performanceProfile")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                <option value="">Not specified</option>
                {Object.entries(PERFORMANCE_PROFILE).map(([key, val]) => (
                  <option key={val} value={val}>{key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="firepowerBalance" className="text-xs font-semibold text-kavri-ink">Firepower Balance</Label>
              <select id="firepowerBalance" {...register("firepowerBalance")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                <option value="">Not specified</option>
                {Object.entries(FIREPOWER_BALANCE).map(([key, val]) => (
                  <option key={val} value={val}>{key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publicState" className="text-xs font-semibold text-kavri-ink">Public State</Label>
              <select id="publicState" {...register("publicState")} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal" disabled={isLoading}>
                {Object.entries(PUBLIC_STATE).map(([key, val]) => (
                  <option key={val} value={val}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/owner/products")}
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
            {isLoading ? "Saving..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
