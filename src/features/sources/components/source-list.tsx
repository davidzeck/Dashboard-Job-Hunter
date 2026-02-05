"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Database, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, Button } from "@/components/ui";
import { SourceCard, SourceCardSkeleton } from "./source-card";
import type { JobSource } from "@/types";

// Dumb component - pure presentation
interface SourceListProps {
  sources: JobSource[];
  isLoading?: boolean;
  onSourceClick?: (source: JobSource) => void;
  onScrape?: (sourceId: string) => void;
  onToggleActive?: (sourceId: string, isActive: boolean) => void;
  onDelete?: (sourceId: string) => void;
  onAddNew?: () => void;
  className?: string;
}

export function SourceList({
  sources,
  isLoading,
  onSourceClick,
  onScrape,
  onToggleActive,
  onDelete,
  onAddNew,
  className,
}: SourceListProps) {
  if (isLoading) {
    return <SourceListSkeleton />;
  }

  if (sources.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No job sources yet"
        description="Add your first job source to start tracking opportunities."
        action={
          onAddNew && (
            <Button onClick={onAddNew} leftIcon={<Plus className="h-4 w-4" />}>
              Add Source
            </Button>
          )
        }
        className={className}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {sources.map((source, index) => (
        <motion.div
          key={source.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          <SourceCard
            source={source}
            onClick={() => onSourceClick?.(source)}
            onScrape={() => onScrape?.(source.id)}
            onToggleActive={(isActive) => onToggleActive?.(source.id, isActive)}
            onDelete={() => onDelete?.(source.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function SourceListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SourceCardSkeleton key={i} />
      ))}
    </div>
  );
}
