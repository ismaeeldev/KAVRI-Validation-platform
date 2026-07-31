"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSampleInspectionAction } from "@/server/actions/sample-actions";
import { uploadPhotoAction } from "@/server/actions/attachment-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ClipboardCheck, Camera } from "lucide-react";

interface InspectionAttachment {
  id: string;
  storageUrl: string;
  caption: string | null;
}

interface Props {
  sampleId: string;
  inspection: {
    inspectionPackagingOk: boolean | null;
    inspectionPackagingNotes: string | null;
    inspectionCosmeticOk: boolean | null;
    inspectionCosmeticNotes: string | null;
    inspectionConstructionOk: boolean | null;
    inspectionConstructionNotes: string | null;
    inspectionSoundOk: boolean | null;
    inspectionSoundNotes: string | null;
  };
  attachments: InspectionAttachment[];
}

const CHECKLIST_ITEMS = [
  { key: "Packaging", okField: "inspectionPackagingOk", notesField: "inspectionPackagingNotes" },
  { key: "Cosmetic", okField: "inspectionCosmeticOk", notesField: "inspectionCosmeticNotes" },
  { key: "Construction", okField: "inspectionConstructionOk", notesField: "inspectionConstructionNotes" },
  { key: "Sound", okField: "inspectionSoundOk", notesField: "inspectionSoundNotes" },
] as const;

export function SampleInspectionForm({ sampleId, inspection, attachments }: Props) {
  const router = useRouter();
  const [checks, setChecks] = useState<Record<string, boolean | null>>({
    inspectionPackagingOk: inspection.inspectionPackagingOk,
    inspectionCosmeticOk: inspection.inspectionCosmeticOk,
    inspectionConstructionOk: inspection.inspectionConstructionOk,
    inspectionSoundOk: inspection.inspectionSoundOk,
  });
  const [notes, setNotes] = useState<Record<string, string>>({
    inspectionPackagingNotes: inspection.inspectionPackagingNotes || "",
    inspectionCosmeticNotes: inspection.inspectionCosmeticNotes || "",
    inspectionConstructionNotes: inspection.inspectionConstructionNotes || "",
    inspectionSoundNotes: inspection.inspectionSoundNotes || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSampleInspectionAction(sampleId, { ...checks, ...notes });
      toast.success("Inspection checklist saved.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to save inspection checklist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadPhotoAction("sample", sampleId, formData);
      toast.success("Photo uploaded.");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
      <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
        <ClipboardCheck className="h-4 w-4 text-kavri-muted" />
        <span>Inspection</span>
      </h3>

      <div className="space-y-4 font-sans text-xs">
        {CHECKLIST_ITEMS.map(({ key, okField, notesField }) => (
          <div key={key} className="space-y-1.5 pb-3 border-b border-kavri-line/60 last:border-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-kavri-ink">{key}</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setChecks((c) => ({ ...c, [okField]: true }))}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${checks[okField] === true ? "bg-kavri-signal text-kavri-ink border-kavri-signal" : "bg-white border-kavri-line text-kavri-muted"}`}
                  disabled={isLoading}
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setChecks((c) => ({ ...c, [okField]: false }))}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${checks[okField] === false ? "bg-red-600 text-white border-red-600" : "bg-white border-kavri-line text-kavri-muted"}`}
                  disabled={isLoading}
                >
                  Issue
                </button>
              </div>
            </div>
            <Textarea
              value={notes[notesField]}
              onChange={(e) => setNotes((n) => ({ ...n, [notesField]: e.target.value }))}
              placeholder={`${key} notes (optional)`}
              className="text-xs min-h-[50px] p-2.5 rounded-lg border-kavri-line resize-y"
              disabled={isLoading}
            />
          </div>
        ))}

        <div className="space-y-2">
          <span className="font-semibold text-kavri-ink flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" /> Photos
          </span>
          {attachments.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {attachments.map((a) => (
                <a key={a.id} href={`/api/attachments/${a.id}`} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-kavri-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/attachments/${a.id}`} alt={a.caption || "Sample inspection photo"} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
          <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-kavri-signal-ink cursor-pointer hover:underline">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? "Uploading..." : "+ Add photo"}
          </label>
        </div>

        <div className="flex justify-end pt-2 border-t border-kavri-line">
          <Button onClick={handleSave} disabled={isLoading} className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-9 px-4 rounded-lg">
            {isLoading ? "Saving..." : "Save Inspection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
