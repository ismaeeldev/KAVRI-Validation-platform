import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-kavri-line pb-5">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-kavri-ink dark:text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-kavri-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 mt-4 md:mt-0">{actions}</div>}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1 border-l-2 border-kavri-ink dark:border-foreground pl-3 my-4">
      <h2 className="font-heading text-lg font-bold tracking-tight text-kavri-ink dark:text-foreground uppercase">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-kavri-muted font-mono uppercase tracking-wider">
          {subtitle}
        </p>
      )}
    </div>
  );
}
