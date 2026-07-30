"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCertificationAction, updateCertificationStatusAction } from "@/server/actions/product-actions";
import { GOVERNING_BODY, CERTIFICATION_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Award, CheckCircle2 } from "lucide-react";

interface Certification {
  id: string;
  governingBody: string;
  status: string;
  submissionDate: string | null;
  approvalDate: string | null;
  expirationDate: string | null;
  approvedModelName: string | null;
  referenceOrListing: string | null;
}

interface CertificationPanelProps {
  revisionId: string;
  certifications: Certification[];
  isDual: boolean;
}

const bodyLabel = (body: string) => (body === GOVERNING_BODY.USAP ? "USAP" : "UPA-A");

function CertificationRow({ cert }: { cert: Certification }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(cert.status);
  const [approvalDate, setApprovalDate] = useState(cert.approvalDate || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateCertificationStatusAction(cert.id, {
        status,
        approvalDate: approvalDate || undefined,
        submissionDate: cert.submissionDate || undefined,
        expirationDate: cert.expirationDate || undefined,
        approvedModelName: cert.approvedModelName || undefined,
        referenceOrListing: cert.referenceOrListing || undefined,
      });
      toast.success(`${bodyLabel(cert.governingBody)} certification updated.`);
      setIsEditing(false);
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update certification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-kavri-line/60 last:border-0">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-kavri-ink">{bodyLabel(cert.governingBody)}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-kavri-surface-subtle border border-kavri-line text-kavri-muted">
          {cert.status.replace(/_/g, " ")}
        </span>
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-2 text-xs">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-9 text-xs" disabled={isLoading}>
            {Object.values(CERTIFICATION_STATUS).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          {status === "approved" && (
            <Input type="date" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} className="h-9 text-xs" disabled={isLoading} />
          )}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading} className="h-8 text-[11px] font-bold bg-kavri-ink text-white">Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading} className="h-8 text-[11px] font-semibold">Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)} className="text-[11px] font-semibold text-kavri-signal-ink hover:underline text-left">
          Update status
        </button>
      )}
    </div>
  );
}

export function CertificationPanel({ revisionId, certifications, isDual }: CertificationPanelProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newBody, setNewBody] = useState<string>(GOVERNING_BODY.USAP);
  const [isLoading, setIsLoading] = useState(false);

  const existingBodies = new Set(certifications.map((c) => c.governingBody));
  const availableBodies = Object.values(GOVERNING_BODY).filter((b) => !existingBodies.has(b));

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      await createCertificationAction({ revisionId, governingBody: newBody, status: CERTIFICATION_STATUS.NOT_SUBMITTED });
      toast.success(`${bodyLabel(newBody)} certification record created.`);
      setIsAdding(false);
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to create certification record.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-kavri-line pb-3">
        <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink flex items-center gap-1.5">
          <Award className="h-4 w-4 text-kavri-muted" />
          <span>Certifications</span>
        </h3>
        {isDual && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-kavri-signal-soft text-kavri-signal-ink border border-kavri-line px-2 py-0.5 rounded-md uppercase">
            <CheckCircle2 className="h-3 w-3" /> Dual
          </span>
        )}
      </div>

      {certifications.length === 0 ? (
        <p className="text-xs text-kavri-muted font-sans py-2">No certification records yet.</p>
      ) : (
        <div>{certifications.map((c) => <CertificationRow key={c.id} cert={c} />)}</div>
      )}

      {availableBodies.length > 0 && (
        isAdding ? (
          <div className="flex flex-col gap-2 pt-2 border-t border-kavri-line">
            <select value={newBody} onChange={(e) => setNewBody(e.target.value)} className="w-full rounded-lg border border-kavri-line bg-background px-3 h-9 text-xs" disabled={isLoading}>
              {availableBodies.map((b) => <option key={b} value={b}>{bodyLabel(b)}</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={isLoading} className="h-8 text-[11px] font-bold bg-kavri-ink text-white">Add Record</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isLoading} className="h-8 text-[11px] font-semibold">Cancel</Button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="text-[11px] font-semibold text-kavri-signal-ink hover:underline pt-2">
            + Add certification record
          </button>
        )
      )}
    </div>
  );
}
