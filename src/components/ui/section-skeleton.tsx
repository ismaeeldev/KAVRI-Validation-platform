import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function TableSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-kavri-line rounded-xl bg-kavri-surface shadow-xs",
        className
      )}
    >
      <div className="p-4 border-b border-kavri-line">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-kavri-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1 max-w-xs" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardGridSkeleton({ cards = 3, className }: { cards?: number; className?: string }) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="border border-kavri-line rounded-xl bg-kavri-surface shadow-xs p-6 space-y-4"
        >
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="border border-kavri-line rounded-xl bg-kavri-surface shadow-xs p-6 space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <TableSkeleton />
    </div>
  );
}

export { TableSkeleton, CardGridSkeleton, DetailSkeleton, PageSkeleton };
