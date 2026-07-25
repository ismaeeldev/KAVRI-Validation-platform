"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { publishPublicUpdateAction, archivePublicUpdateAction } from "@/server/actions/public-update-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Trash2 } from "lucide-react";

interface PublicUpdateActionsProps {
  updateId: string;
  currentState: string;
}

export function PublicUpdateActions({ updateId, currentState }: PublicUpdateActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handlePublish = async () => {
    setIsPending(true);
    try {
      await publishPublicUpdateAction(updateId);
      toast.success("Public update published to the landing page.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to publish update.");
    } finally {
      setIsPending(false);
    }
  };

  const handleArchive = async () => {
    setIsPending(true);
    try {
      await archivePublicUpdateAction(updateId);
      toast.success("Public update archived.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to archive update.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {currentState !== "published" && (
        <Button
          onClick={handlePublish}
          disabled={isPending}
          className="bg-kavri-signal text-kavri-ink font-sans font-bold hover:bg-[#c4dd40] text-xs h-9 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-kavri-signal transition-all flex items-center gap-1.5"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Publish Update</span>
        </Button>
      )}

      {currentState !== "archived" && (
        <Button
          onClick={handleArchive}
          disabled={isPending}
          className="bg-[#f9e9e7] hover:bg-[#f2d7d4] text-[#b33a32] border border-[#f5d6d4] font-sans font-semibold text-xs h-9 px-4 rounded-lg focus-visible:outline-2 focus-visible:outline-[#b33a32] transition-all flex items-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Archive Update</span>
        </Button>
      )}
    </div>
  );
}
