"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Database,
  Search,
  Filter,
  Plus,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui";

type EmptyStateVariant = "jobs" | "companies" | "sources" | "search" | "filter" | "generic";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: LucideIcon; title: string; description: string }
> = {
  jobs: {
    icon: Briefcase,
    title: "No jobs found",
    description: "There are no jobs matching your current filters. Try adjusting your search criteria or add new sources to discover more opportunities.",
  },
  companies: {
    icon: Building2,
    title: "No companies yet",
    description: "Start tracking companies you're interested in. Add companies to monitor their job postings and stay updated.",
  },
  sources: {
    icon: Database,
    title: "No sources configured",
    description: "Add job sources to start discovering opportunities. Sources are URLs or feeds that we'll scrape for new job listings.",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "We couldn't find anything matching your search. Try different keywords or check your spelling.",
  },
  filter: {
    icon: Filter,
    title: "No matches",
    description: "No items match your current filters. Try removing some filters or adjusting your criteria.",
  },
  generic: {
    icon: FileQuestion,
    title: "Nothing here yet",
    description: "This section is empty. Check back later or take an action to add content.",
  },
};

export function EmptyState({
  variant = "generic",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{title || config.title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description || config.description}
      </p>

      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-3">
          {onSecondaryAction && secondaryActionLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {onAction && actionLabel && (
            <Button onClick={onAction}>
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Inline empty state for smaller areas
export function InlineEmptyState({
  message = "No items",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`py-8 text-center text-sm text-muted-foreground ${className}`}
    >
      {message}
    </div>
  );
}
