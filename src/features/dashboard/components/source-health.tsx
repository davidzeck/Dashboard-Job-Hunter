"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Pause, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  StatusBadge,
  Button,
} from "@/components/ui";
import type { JobSource } from "@/types";

// Dumb component - pure presentation
interface SourceHealthProps {
  sources: JobSource[];
  isLoading?: boolean;
  onRefresh?: (sourceId: string) => void;
  className?: string;
}

export function SourceHealth({
  sources,
  isLoading,
  onRefresh,
  className,
}: SourceHealthProps) {
  if (isLoading) {
    return <SourceHealthSkeleton />;
  }

  const errorSources = sources.filter((s) => s.scraper_status === "error");
  const activeSources = sources.filter((s) => s.scraper_status === "active");
  const pausedSources = sources.filter((s) => s.scraper_status === "paused");

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Source Health</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-xs">
              {activeSources.length} active
            </Badge>
            {errorSources.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorSources.length} errors
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errorSources.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sources requiring attention:
            </p>
            {errorSources.map((source, index) => (
              <SourceHealthItem
                key={source.id}
                source={source}
                index={index}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-10 w-10 text-success mb-3" />
            <p className="font-medium">All sources healthy</p>
            <p className="text-sm text-muted-foreground">
              {activeSources.length} sources actively scraping
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SourceHealthItemProps {
  source: JobSource;
  index: number;
  onRefresh?: (sourceId: string) => void;
}

function SourceHealthItem({ source, index, onRefresh }: SourceHealthItemProps) {
  const statusConfig = {
    active: { icon: CheckCircle, color: "text-success" },
    error: { icon: AlertCircle, color: "text-destructive" },
    paused: { icon: Pause, color: "text-warning" },
    inactive: { icon: Pause, color: "text-muted-foreground" },
  };

  const config = statusConfig[source.scraper_status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
    >
      <Icon className={cn("h-5 w-5 mt-0.5", config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">
            {source.company?.name || "Unknown Company"}
          </p>
          <StatusBadge status={source.scraper_status}>
            {source.scraper_status}
          </StatusBadge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-1">
          {source.source_url}
        </p>
        {source.last_error && (
          <p className="text-xs text-destructive mt-1 truncate">
            {source.last_error}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Last scraped: {source.last_scraped_at ? formatRelativeTime(source.last_scraped_at) : "Never"}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onRefresh?.(source.id)}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

function SourceHealthSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <div className="h-5 w-5 animate-pulse rounded bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
