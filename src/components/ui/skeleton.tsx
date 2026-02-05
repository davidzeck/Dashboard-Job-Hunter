"use client";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Card skeleton for loading states
function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// Table row skeleton
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center space-x-4 p-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

// Stats card skeleton
function StatsSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-2">
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-8 w-[60px]" />
      <Skeleton className="h-3 w-[80px]" />
    </div>
  );
}

export { Skeleton, CardSkeleton, TableRowSkeleton, StatsSkeleton };
