"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-kavri-muted hover:text-kavri-ink transition-colors group mb-3 focus-visible:outline-2 focus-visible:outline-kavri-signal rounded-sm"
    >
      <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </Link>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  count?: number;
}

export function DashboardPageHeader({
  title,
  description,
  eyebrow,
  actions,
  backHref,
  backLabel,
  count,
}: PageHeaderProps) {
  return (
    <div className="space-y-3 pb-6 border-b border-kavri-line select-none">
      {backHref && backLabel && <BackLink href={backHref} label={backLabel} />}
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          {eyebrow && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-kavri-muted font-bold block">
              {eyebrow}
            </span>
          )}
          <h1 className="font-heading font-black uppercase text-2xl md:text-3xl text-kavri-ink leading-none flex items-baseline gap-2">
            <span>{title}</span>
            {count !== undefined && (
              <span className="font-mono text-xs font-semibold text-kavri-muted px-2 py-0.5 border border-kavri-line rounded-md bg-[#fafaf8]">
                {count}
              </span>
            )}
          </h1>
          {description && (
            <p className="text-xs text-kavri-muted max-w-2xl leading-relaxed pt-1">
              {description}
            </p>
          )}
        </div>
        
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="border border-kavri-line rounded-xl overflow-hidden bg-kavri-surface shadow-xs">
      <div className="h-12 border-b border-kavri-line bg-[#fafaf8]" />
      <div className="divide-y divide-kavri-line">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 px-6 flex items-center justify-between gap-4 animate-pulse">
            <div className="space-y-2 w-1/3">
              <div className="h-3 bg-[#ecefea] rounded w-3/4" />
              <div className="h-2.5 bg-[#ecefea] rounded w-1/2" />
            </div>
            <div className="h-3 bg-[#ecefea] rounded w-20" />
            <div className="h-7 bg-[#ecefea] rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      <div className="lg:col-span-8 space-y-6">
        <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-4">
          <div className="h-4 bg-[#ecefea] rounded w-1/4" />
          <div className="h-3 bg-[#ecefea] rounded w-full" />
          <div className="h-3 bg-[#ecefea] rounded w-5/6" />
        </div>
        <div className="border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-4">
          <div className="h-4 bg-[#ecefea] rounded w-1/3" />
          <div className="h-12 bg-[#ecefea] rounded w-full" />
        </div>
      </div>
      <div className="lg:col-span-4 border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-4">
        <div className="h-4 bg-[#ecefea] rounded w-1/2" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 bg-[#ecefea] rounded w-1/3" />
              <div className="h-3 bg-[#ecefea] rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-2xl border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-[#ecefea] rounded w-1/4" />
          <div className="h-10 bg-kavri-surface border border-kavri-line rounded-lg" />
        </div>
      ))}
      <div className="pt-4 flex justify-end gap-3">
        <div className="h-10 bg-[#ecefea] rounded-lg w-20" />
        <div className="h-10 bg-[#ecefea] rounded-lg w-24" />
      </div>
    </div>
  );
}
