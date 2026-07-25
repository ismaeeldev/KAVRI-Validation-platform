import React from "react";

interface MetadataLabelProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export function MetadataLabel({ label, value, className = "" }: MetadataLabelProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] font-mono uppercase tracking-widest text-kavri-muted select-none">
        {label}
      </span>
      <span className="font-mono text-xs font-semibold text-kavri-ink dark:text-foreground">
        {value}
      </span>
    </div>
  );
}

export function TechnicalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-between my-6 select-none ${className}`}>
      {/* Left calibration tick */}
      <span className="w-1 h-3 bg-kavri-line-strong dark:bg-muted" />
      {/* Center line */}
      <div className="absolute inset-x-0 h-[1px] bg-kavri-line dark:bg-muted/50 -z-10" />
      {/* Right calibration tick */}
      <span className="w-1 h-3 bg-kavri-line-strong dark:bg-muted" />
    </div>
  );
}
