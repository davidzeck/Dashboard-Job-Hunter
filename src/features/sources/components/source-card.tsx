"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  RefreshCw,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  StatusBadge,
  CompanyAvatar,
  Button,
} from "@/components/ui";
import type { JobSource, ScraperStatus, JobSourceType } from "@/types";

// Dumb component - pure presentation
interface SourceCardProps {
  source: JobSource;
  onClick?: () => void;
  onScrape?: () => void;
  onToggleActive?: (isActive: boolean) => void;
  onDelete?: () => void;
  className?: string;
}

export function SourceCard({
  source,
  onClick,
  onScrape,
  onToggleActive,
  onDelete,
  className,
}: SourceCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        source.scraper_status === "error" && "border-destructive/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <CompanyAvatar
            name={source.company?.name || "Unknown"}
            logoUrl={source.company?.logo_url}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {source.company?.name || "Unknown Company"}
                </h3>
                <SourceTypeBadge type={source.source_type} />
              </div>
              <ScraperStatusBadge status={source.scraper_status} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-xs text-muted-foreground truncate">
          {source.source_url}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {source.last_scraped_at
              ? formatRelativeTime(source.last_scraped_at)
              : "Never scraped"}
          </div>
          <div>
            <span className="font-medium text-foreground">
              {source.jobs_found_count}
            </span>{" "}
            jobs
          </div>
        </div>
        {source.last_error && (
          <p className="text-xs text-destructive mt-2 truncate">
            {source.last_error}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onScrape?.();
            }}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Scrape
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
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-popover shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                onClick={() => {
                  onToggleActive?.(!source.is_active);
                  setShowMenu(false);
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
                  onDelete?.();
                  setShowMenu(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Scraper status badge
function ScraperStatusBadge({ status }: { status: ScraperStatus }) {
  return (
    <StatusBadge status={status === "inactive" ? "inactive" : status}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </StatusBadge>
  );
}

// Source type badge
function SourceTypeBadge({ type }: { type: JobSourceType }) {
  const labels: Record<JobSourceType, string> = {
    careers_page: "Careers Page",
    linkedin: "LinkedIn",
    indeed: "Indeed",
    glassdoor: "Glassdoor",
    other: "Other",
  };

  return (
    <span className="text-xs text-muted-foreground">{labels[type]}</span>
  );
}

// Loading skeleton
export function SourceCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-3 w-full animate-pulse rounded bg-muted" />
      <div className="flex justify-between">
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}
