"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { createPublicUpdateSchema } from "@/lib/validation/schemas";
import { createPublicUpdateAction, updatePublicUpdateAction } from "@/server/actions/public-update-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DEVELOPMENT_STAGE } from "@/lib/constants";

type UpdateFormData = zod.infer<typeof createPublicUpdateSchema>;

interface PublicUpdateFormProps {
  products: { id: string; internalName: string }[];
  revisions: { id: string; revisionCode: string; productId: string }[];
  initialData?: {
    id: string;
    title: string;
    summary: string;
    statusLabel: string;
    developmentStage?: string | null;
    productId?: string | null;
    revisionId?: string | null;
    publishedState: "draft" | "published" | "archived";
    sortOrder: number;
  };
}

export function PublicUpdateForm({ products, revisions, initialData }: PublicUpdateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(initialData?.productId || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(createPublicUpdateSchema) as unknown as Resolver<UpdateFormData>,
    defaultValues: {
      title: initialData?.title || "",
      summary: initialData?.summary || "",
      statusLabel: initialData?.statusLabel || "",
      developmentStage: (initialData?.developmentStage as "concept" | "design" | "prototype" | "field_testing" | "production" | "launch" | "") || "",
      productId: initialData?.productId || "",
      revisionId: initialData?.revisionId || "",
      publishedState: initialData?.publishedState || "draft",
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  // Filter revisions belonging to selected product
  const filteredRevisions = revisions.filter((rev) => rev.productId === selectedProductId);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedProductId(pId);
    setValue("productId", pId);
    setValue("revisionId", ""); // Reset revision
  };

  const onSubmit = async (data: UpdateFormData) => {
    setIsLoading(true);
    try {
      if (initialData) {
        await updatePublicUpdateAction(initialData.id, data);
        toast.success("Public update successfully updated.");
      } else {
        await createPublicUpdateAction(data);
        toast.success("Public update created.");
      }
      router.push("/owner/updates");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to save public update.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 font-sans text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-semibold text-kavri-ink">
            Update Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            placeholder="e.g. Core weave testing completed"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="statusLabel" className="text-xs font-semibold text-kavri-ink">
            Status Label <span className="text-red-500">*</span>
          </Label>
          <Input
            id="statusLabel"
            {...register("statusLabel")}
            className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
            placeholder="e.g. PASSED, IN PROGRESS, FOUND BUG"
            disabled={isLoading}
          />
          {errors.statusLabel && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.statusLabel.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="publishedState" className="text-xs font-semibold text-kavri-ink">
              Publish State <span className="text-red-500">*</span>
            </Label>
            <select
              id="publishedState"
              {...register("publishedState")}
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
              disabled={isLoading}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {errors.publishedState && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.publishedState.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sortOrder" className="text-xs font-semibold text-kavri-ink">
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="0"
              disabled={isLoading}
            />
            {errors.sortOrder && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.sortOrder.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="developmentStage" className="text-xs font-semibold text-kavri-ink">
            Development Stage (Optional)
          </Label>
          <select
            id="developmentStage"
            {...register("developmentStage")}
            className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
            disabled={isLoading}
          >
            <option value="">Select a stage...</option>
            {Object.values(DEVELOPMENT_STAGE).map((stg) => (
              <option key={stg} value={stg}>
                {stg}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="productSelect" className="text-xs font-semibold text-kavri-ink">
              Link Product (Optional)
            </Label>
            <select
              id="productSelect"
              onChange={handleProductChange}
              value={selectedProductId}
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
              disabled={isLoading}
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.internalName}
                </option>
              ))}
            </select>
            <input type="hidden" {...register("productId")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="revisionId" className="text-xs font-semibold text-kavri-ink">
              Link Revision (Optional)
            </Label>
            <select
              id="revisionId"
              {...register("revisionId")}
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal disabled:opacity-50"
              disabled={!selectedProductId || isLoading}
            >
              <option value="">Select a revision...</option>
              {filteredRevisions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.revisionCode}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary" className="text-xs font-semibold text-kavri-ink">
            Update Summary <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="summary"
            {...register("summary")}
            className="text-xs min-h-[100px] focus-visible:ring-kavri-signal p-3 rounded-lg border-kavri-line resize-y"
            placeholder="Provide safe customer-facing summary."
            disabled={isLoading}
          />
          {errors.summary && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.summary.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/owner/updates")}
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
            {isLoading ? "Saving..." : initialData ? "Save Update" : "Create Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
