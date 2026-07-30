"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { archiveSupplierAction } from "@/server/actions/supplier-actions";
import { toast } from "sonner";
import { ShieldAlert, Trash2 } from "lucide-react";

interface SupplierArchiveButtonProps {
  supplierId: string;
  linkedProductCount?: number;
  linkedSampleCount?: number;
}

export function SupplierArchiveButton({
  supplierId,
  linkedProductCount = 0,
  linkedSampleCount = 0,
}: SupplierArchiveButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasLinkedRecords = linkedProductCount > 0 || linkedSampleCount > 0;

  const handleArchive = async () => {
    setIsPending(true);
    try {
      await archiveSupplierAction(supplierId);
      toast.success("Supplier successfully archived.");
      router.push("/owner/suppliers");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to archive supplier.");
    } finally {
      setIsPending(false);
      setConfirmOpen(false);
    }
  };

  if (confirmOpen) {
    return (
      <div className="flex items-center gap-3 p-2 border border-red-200 bg-red-50/50 rounded-lg font-sans text-xs">
        <span className="font-semibold text-red-900 flex flex-col items-start gap-0.5">
          <span className="flex items-center gap-1">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span>Confirm Archive?</span>
          </span>
          {hasLinkedRecords && (
            <span className="text-[10px] font-medium text-red-700 normal-case">
              This supplier has {linkedProductCount} linked product{linkedProductCount === 1 ? "" : "s"} and{" "}
              {linkedSampleCount} linked sample{linkedSampleCount === 1 ? "" : "s"}. They will remain visible
              in historical records after archiving.
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleArchive}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-[10px] h-7 px-2.5 rounded-md transition-all"
          >
            Yes, Archive
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmOpen(false)}
            className="font-sans font-semibold text-[10px] h-7 px-2.5 border-red-200 bg-white hover:bg-red-50 text-red-800 rounded-md transition-all"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setConfirmOpen(true)}
      className="bg-[#f9e9e7] hover:bg-[#f2d7d4] text-[#b33a32] border border-[#f5d6d4] font-sans font-semibold text-xs h-9 px-4 rounded-lg transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#b33a32]"
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span>Archive Supplier</span>
    </Button>
  );
}
