"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, QrCode } from "lucide-react";

interface Props {
  sampleCode: string;
  shortCode: string | null;
  qrDataUrl: string | null;
}

export function SampleQrLabel({ sampleCode, shortCode, qrDataUrl }: Props) {
  if (!qrDataUrl || !shortCode) {
    return (
      <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs text-xs font-sans text-kavri-muted">
        QR code not available for this sample.
      </div>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=500");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>${sampleCode} Label</title></head>
        <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <img src="${qrDataUrl}" style="width:180px;height:180px;" />
          <p style="font-weight:bold;font-size:14px;letter-spacing:1px;margin-top:8px;">${sampleCode}</p>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${sampleCode}-qr.png`;
    link.click();
  };

  return (
    <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 shadow-xs space-y-4">
      <h3 className="font-heading text-xs font-black uppercase tracking-wider text-kavri-ink border-b border-kavri-line pb-3 flex items-center gap-1.5">
        <QrCode className="h-4 w-4 text-kavri-muted" />
        <span>Sample Label</span>
      </h3>
      <div className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt={`QR code for ${sampleCode}`} className="w-32 h-32 border border-kavri-line rounded-lg" />
        <p className="font-mono text-xs font-bold text-kavri-ink">{shortCode}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handlePrint} variant="outline" className="flex-1 h-9 text-[11px] font-semibold gap-1.5">
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1 h-9 text-[11px] font-semibold gap-1.5">
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
      </div>
    </div>
  );
}
