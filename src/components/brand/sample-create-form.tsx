"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createSampleSchema } from "@/lib/validation/schemas";
import { createSampleAction } from "@/server/actions/sample-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type SampleFormData = zod.infer<typeof createSampleSchema>;

interface CreateFormProps {
  suppliers: { id: string; name: string; status: string }[];
  products: { id: string; internalName: string; supplierId: string; status: string }[];
  revisions: { id: string; revisionCode: string; productId: string }[];
}

export function SampleCreateForm({ products, revisions }: CreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SampleFormData>({
    resolver: zodResolver(createSampleSchema as any),
    defaultValues: {
      receivedAt: new Date().toISOString().split("T")[0],
    },
  });

  // Filter active suppliers and products
  const activeProducts = useMemo(() => products.filter((p) => p.status !== "archived"), [products]);

  // Derived filtered revisions based on selected product
  const filteredRevisions = useMemo(() => {
    if (!selectedProductId) return [];
    return revisions.filter((r) => r.productId === selectedProductId);
  }, [selectedProductId, revisions]);

  // Handle product selection to auto-fill supplier
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    setValue("productId", prodId);

    // Auto-derive supplier id
    const productObj = products.find((p) => p.id === prodId);
    if (productObj) {
      setValue("supplierId", productObj.supplierId);
    } else {
      setValue("supplierId", "");
    }
    // Clear revision field on product swap
    setValue("revisionId", "");
  };

  const onSubmit = async (data: SampleFormData) => {
    setIsLoading(true);
    try {
      await createSampleAction(data);
      toast.success("Physical sample logged and ready for review.");
      router.push("/owner/samples");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to log physical sample. Mismatched relationships or duplicate code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sampleCode" className="text-xs font-semibold text-kavri-ink">
              Sample Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sampleCode"
              {...register("sampleCode")}
              className="font-mono text-xs uppercase focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="e.g. S-AERO-01"
              disabled={isLoading}
            />
            {errors.sampleCode && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.sampleCode.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="receivedAt" className="text-xs font-semibold text-kavri-ink">
              Received At Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="receivedAt"
              type="date"
              {...register("receivedAt")}
              className="text-xs font-sans focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              disabled={isLoading}
            />
            {errors.receivedAt && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.receivedAt.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="productSelect" className="text-xs font-semibold text-kavri-ink">
            Select Product <span className="text-red-500">*</span>
          </Label>
          <select
            id="productSelect"
            onChange={handleProductChange}
            value={selectedProductId}
            className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
            disabled={isLoading}
          >
            <option value="">Select a product...</option>
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.internalName}
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.productId.message}</p>
          )}
        </div>

        <input type="hidden" {...register("productId")} />
        <input type="hidden" {...register("supplierId")} />

        <div className="space-y-1.5">
          <Label htmlFor="revisionId" className="text-xs font-semibold text-kavri-ink">
            Select Revision <span className="text-red-500">*</span>
          </Label>
          <select
            id="revisionId"
            disabled={!selectedProductId || isLoading}
            {...register("revisionId")}
            className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal disabled:opacity-50"
          >
            <option value="">Select a revision...</option>
            {filteredRevisions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.revisionCode}
              </option>
            ))}
          </select>
          {errors.revisionId && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.revisionId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="receivingObservations" className="text-xs font-semibold text-kavri-ink">
            Receiving Observations <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="receivingObservations"
            {...register("receivingObservations")}
            className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Private observations during package inspection, wear parameters, packaging damage, etc."
            disabled={isLoading}
          />
          {errors.receivingObservations && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.receivingObservations.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="identifyingNotes" className="text-xs font-semibold text-kavri-ink">
            Identifying Notes
          </Label>
          <Textarea
            id="identifyingNotes"
            {...register("identifyingNotes")}
            className="text-xs min-h-[80px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Confidential identifying characteristics, material tags, serial keys, etc."
            disabled={isLoading}
          />
          {errors.identifyingNotes && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.identifyingNotes.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/owner/samples")}
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
            {isLoading ? "Saving..." : "Log Sample"}
          </Button>
        </div>
      </form>
    </div>
  );
}
