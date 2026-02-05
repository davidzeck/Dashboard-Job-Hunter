"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  CompanyAvatar,
  Button,
} from "@/components/ui";
import type { Job } from "@/types";

// Dumb component - pure presentation
interface RecentJobsListProps {
  jobs: Job[];
  isLoading?: boolean;
  onJobClick?: (job: Job) => void;
  className?: string;
}

export function RecentJobsList({
  jobs,
  isLoading,
  onJobClick,
  className,
}: RecentJobsListProps) {
  if (isLoading) {
    return <RecentJobsListSkeleton />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">New Jobs</CardTitle>
          <Badge variant="urgent" className="animate-pulse-urgent">
            {jobs.length} new
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No new jobs found
          </p>
        ) : (
          jobs.map((job, index) => (
            <RecentJobItem
              key={job.id}
              job={job}
              index={index}
              onClick={() => onJobClick?.(job)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface RecentJobItemProps {
  job: Job;
  index: number;
  onClick?: () => void;
}

function RecentJobItem({ job, index, onClick }: RecentJobItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="group flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CompanyAvatar
        name={job.company?.name || "Unknown"}
        logoUrl={job.company?.logo_url}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{job.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {job.company?.name} • {job.location || "Remote"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {formatRelativeTime(job.first_seen_at)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            window.open(job.application_url, "_blank");
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function RecentJobsListSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
