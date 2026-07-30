"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createProductSchema } from "@/lib/validation/schemas";
import { updateProductAction } from "@/server/actions/product-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ProductFormData = zod.infer<typeof createProductSchema>;

interface EditFormProps {
  product: {
    id: string;
    supplierId: string;
    internalName: string;
    publicAlias: string | null;
    descriptionInternal: string;
    publicSummary: string | null;
    isPublic: boolean;
  };
}

export function ProductEditForm({ product }: EditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(createProductSchema) as unknown as Resolver<ProductFormData>,
    defaultValues: {
      supplierId: product.supplierId,
      internalName: product.internalName,
      publicAlias: product.publicAlias || "",
      descriptionInternal: product.descriptionInternal,
      publicSummary: product.publicSummary || "",
      isPublic: product.isPublic,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      await updateProductAction(product.id, data);
      toast.success("Product configurations updated.");
      router.push(`/owner/products/${product.id}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update product details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="internalName" className="text-xs font-semibold text-kavri-ink">
            Internal Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="internalName"
            {...register("internalName")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            disabled={isLoading}
          />
          {errors.internalName && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.internalName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="publicAlias" className="text-xs font-semibold text-kavri-ink">
            Public Alias
          </Label>
          <Input
            id="publicAlias"
            {...register("publicAlias")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/owner/products/${product.id}`)}
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
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
