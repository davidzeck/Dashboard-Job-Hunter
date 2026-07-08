"use client";

/**
 * Full-page loading state shown while the session bootstraps on a cold load.
 * Mirrors the real app shell (240px sidebar + header + content) so the wait
 * reads as intentional loading, not a blank/broken screen.
 */

import { Skeleton } from "@/components/ui";

export function AppShellSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar rail */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col gap-6 border-r border-border p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
        <div className="mt-auto flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <Skeleton className="h-9 w-72 max-w-[40vw] rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 space-y-6 p-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
