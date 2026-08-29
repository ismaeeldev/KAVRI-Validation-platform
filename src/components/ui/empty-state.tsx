import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 border border-dashed border-kavri-line rounded-xl bg-kavri-surface text-center space-y-3",
        className
      )}
    >
      {Icon ? <Icon className="h-8 w-8 text-kavri-muted" strokeWidth={1.5} /> : null}
      <p className="text-xs font-sans font-semibold text-kavri-muted">{title}</p>
      {description ? (
        <p className="text-xs font-sans text-kavri-muted/80 max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
