"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useRouter } from "next/navigation";
import { createSupplierSchema } from "@/lib/validation/schemas";
import { updateSupplierAction } from "@/server/actions/supplier-actions";
import { SUPPLIER_TYPE, SUPPLIER_RELATIONSHIP_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type SupplierFormData = zod.infer<typeof createSupplierSchema>;

interface EditFormProps {
  supplier: {
    id: string;
    name: string;
    code: string | null;
    contactName: string | null;
    contactEmail: string | null;
    notes: string;
    supplierType: string | null;
    website: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    relationshipStatus: string;
  };
}

export function SupplierEditForm({ supplier }: EditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(createSupplierSchema) as unknown as Resolver<SupplierFormData>,
    defaultValues: {
      name: supplier.name,
      code: supplier.code || "",
      contactName: supplier.contactName || "",
      contactEmail: supplier.contactEmail || "",
      notes: supplier.notes,
      supplierType: supplier.supplierType || "",
      website: supplier.website || "",
      phone: supplier.phone || "",
      addressLine1: supplier.addressLine1 || "",
      addressLine2: supplier.addressLine2 || "",
      city: supplier.city || "",
      region: supplier.region || "",
      postalCode: supplier.postalCode || "",
      country: supplier.country || "",
      relationshipStatus: supplier.relationshipStatus,
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    setIsLoading(true);
    try {
      await updateSupplierAction(supplier.id, data);
      toast.success("Supplier details updated.");
      router.push(`/owner/suppliers/${supplier.id}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update supplier.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            disabled={isLoading}
          />
          {errors.notes && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.notes.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="supplierType" className="text-xs font-semibold text-kavri-ink">
              Supplier Type
            </Label>
            <select
              id="supplierType"
              {...register("supplierType")}
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
              disabled={isLoading}
            >
              <option value="">Not specified</option>
              {Object.entries(SUPPLIER_TYPE).map(([key, val]) => (
                <option key={val} value={val}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="relationshipStatus" className="text-xs font-semibold text-kavri-ink">
              Relationship Status <span className="text-red-500">*</span>
            </Label>
            <select
              id="relationshipStatus"
              {...register("relationshipStatus")}
              className="w-full rounded-lg border border-kavri-line bg-background px-3 h-10 text-xs font-sans focus-visible:outline-2 focus-visible:outline-kavri-signal"
              disabled={isLoading}
            >
              {Object.entries(SUPPLIER_RELATIONSHIP_STATUS).map(([key, val]) => (
                <option key={val} value={val}>
                  {key.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                </option>
              ))}
            </select>
            {errors.relationshipStatus && (
              <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.relationshipStatus.message}</p>
            )}
          </div>
        </div>

        <div className="border-t border-kavri-line pt-4 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-kavri-muted">
            Contact &amp; Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-semibold text-kavri-ink">
                Website
              </Label>
              <Input
                id="website"
                {...register("website")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                placeholder="https://acme.com"
                disabled={isLoading}
              />
              {errors.website && (
                <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-kavri-ink">
                Phone
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                placeholder="+1 555 123 4567"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addressLine1" className="text-xs font-semibold text-kavri-ink">
              Address Line 1
            </Label>
            <Input
              id="addressLine1"
              {...register("addressLine1")}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="Street address"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addressLine2" className="text-xs font-semibold text-kavri-ink">
              Address Line 2
            </Label>
            <Input
              id="addressLine2"
              {...register("addressLine2")}
              className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
              placeholder="Suite, unit, building (optional)"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-semibold text-kavri-ink">
                City
              </Label>
              <Input
                id="city"
                {...register("city")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="region" className="text-xs font-semibold text-kavri-ink">
                Region / State
              </Label>
              <Input
                id="region"
                {...register("region")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postalCode" className="text-xs font-semibold text-kavri-ink">
                Postal Code
              </Label>
              <Input
                id="postalCode"
                {...register("postalCode")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-xs font-semibold text-kavri-ink">
                Country
              </Label>
              <Input
                id="country"
                {...register("country")}
                className="text-xs focus-visible:ring-kavri-signal h-10 px-3 rounded-lg border-kavri-line"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-kavri-line mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/owner/suppliers/${supplier.id}`)}
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
