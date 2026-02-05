"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Edit2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Button, Badge, CompanyAvatar, Skeleton } from "@/components/ui";
import type { JobSource, ScraperStatus, JobSourceType, SortConfig, SortDirection } from "@/types";

interface SourceTableProps {
  sources: JobSource[];
  isLoading?: boolean;
  scrapingSourceIds?: string[];
  sort?: SortConfig;
  onSort?: (sort: SortConfig) => void;
  onSourceClick?: (source: JobSource) => void;
  onScrape?: (sourceId: string) => void;
  onToggleActive?: (sourceId: string, isActive: boolean) => void;
  onEdit?: (source: JobSource) => void;
  onDelete?: (sourceId: string) => void;
  className?: string;
}

export function SourceTable({
  sources,
  isLoading,
  scrapingSourceIds = [],
  sort,
  onSort,
  onSourceClick,
  onScrape,
  onToggleActive,
  onEdit,
  onDelete,
  className,
}: SourceTableProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const handleSort = (field: string) => {
    if (!onSort) return;
    const direction: SortDirection =
      sort?.field === field && sort?.direction === "asc" ? "desc" : "asc";
    onSort({ field, direction });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort?.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  if (isLoading) {
    return <SourceTableSkeleton />;
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                  onClick={() => handleSort("company.name")}
                >
                  Source
                  <SortIcon field="company.name" />
                </button>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium">Type</span>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium">Status</span>
              </th>
              <th className="text-left p-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                  onClick={() => handleSort("jobs_found_count")}
                >
                  Jobs
                  <SortIcon field="jobs_found_count" />
                </button>
              </th>
              <th className="text-left p-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                  onClick={() => handleSort("last_scraped_at")}
                >
                  Last Scraped
                  <SortIcon field="last_scraped_at" />
                </button>
              </th>
              <th className="w-32 p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sources.map((source) => {
              const isScraping = scrapingSourceIds.includes(source.id);
              return (
                <motion.tr
                  key={source.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "hover:bg-muted/30 cursor-pointer transition-colors",
                    source.scraper_status === "error" && "bg-destructive/5"
                  )}
                  onClick={() => onSourceClick?.(source)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <CompanyAvatar
                        name={source.company?.name || "Source"}
                        logoUrl={source.company?.logo_url}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">
                          {source.company?.name || "Unknown Company"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {source.source_url}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <SourceTypeBadge type={source.source_type} />
                  </td>
                  <td className="p-3">
                    <ScraperStatusBadge status={source.scraper_status} />
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{source.jobs_found_count}</span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {source.last_scraped_at
                      ? formatRelativeTime(source.last_scraped_at)
                      : "Never"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onScrape?.(source.id);
                        }}
                        disabled={isScraping}
                      >
                        {isScraping ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(source.source_url, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === source.id ? null : source.id);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {openMenuId === source.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                              }}
                            />
                            <div
                              className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-popover shadow-lg z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                                onClick={() => {
                                  onEdit?.(source);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                                onClick={() => {
                                  onToggleActive?.(source.id, !source.is_active);
                                  setOpenMenuId(null);
                                }}
                              >
                                {source.is_active ? (
                                  <>
                                    <Pause className="h-4 w-4" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4" />
                                    Resume
                                  </>
                                )}
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                                onClick={() => {
                                  onDelete?.(source.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Status badge component
function ScraperStatusBadge({ status }: { status: ScraperStatus }) {
  const configs: Record<ScraperStatus, { label: string; icon: React.ElementType; className: string }> = {
    active: {
      label: "Active",
      icon: CheckCircle,
      className: "bg-success/10 text-success",
    },
    error: {
      label: "Error",
      icon: AlertCircle,
      className: "bg-destructive/10 text-destructive",
    },
    paused: {
      label: "Paused",
      icon: PauseCircle,
      className: "bg-warning/10 text-warning",
    },
    inactive: {
      label: "Inactive",
      icon: Clock,
      className: "bg-muted text-muted-foreground",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// Source type badge
function SourceTypeBadge({ type }: { type: JobSourceType }) {
  const labels: Record<JobSourceType, string> = {
    careers_page: "Careers",
    linkedin: "LinkedIn",
    indeed: "Indeed",
    glassdoor: "Glassdoor",
    other: "Other",
  };

  return (
    <Badge variant="outline" className="text-xs">
      {labels[type]}
    </Badge>
  );
}

// Skeleton loader
function SourceTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 border-b p-3 flex gap-8">
        {["Source", "Type", "Status", "Jobs", "Last Scraped", ""].map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-3 flex gap-8 border-b last:border-b-0 items-center">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
