"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatSalary } from "@/lib/utils";
import {
  MotionCard,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  CompanyAvatar,
  Button,
} from "@/components/ui";
import type { Job, JobStatus, ExperienceLevel, JobType } from "@/types";

// Dumb component - pure presentation
interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onApply?: () => void;
  className?: string;
}

export function JobCard({ job, onClick, onApply, className }: JobCardProps) {
  return (
    <MotionCard
      className={cn("cursor-pointer", className)}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <CompanyAvatar
            name={job.company?.name || "Unknown"}
            logoUrl={job.company?.logo_url}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base leading-tight truncate">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {job.company?.name}
                </p>
              </div>
              <JobStatusBadge status={job.status} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </div>
          )}
          {job.job_type && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <JobTypeBadge type={job.job_type} />
            </div>
          )}
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </div>
          )}
        </div>

        {job.experience_level && (
          <div className="mt-2">
            <ExperienceBadge level={job.experience_level} />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {formatRelativeTime(job.first_seen_at)}
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onApply?.();
          }}
          rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
        >
          Apply
        </Button>
      </CardFooter>
    </MotionCard>
  );
}

// Status badge component
function JobStatusBadge({ status }: { status: JobStatus }) {
  const statusConfig: Record<
    JobStatus,
    { label: string; variant: "new" | "active" | "expired" | "filled" }
  > = {
    new: { label: "New", variant: "new" },
    active: { label: "Active", variant: "active" },
    expired: { label: "Expired", variant: "expired" },
    filled: { label: "Filled", variant: "filled" },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Job type badge
function JobTypeBadge({ type }: { type: JobType }) {
  const labels: Record<JobType, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    internship: "Internship",
    remote: "Remote",
  };
  return <span>{labels[type]}</span>;
}

// Experience level badge
function ExperienceBadge({ level }: { level: ExperienceLevel }) {
  const config: Record<
    ExperienceLevel,
    { label: string; color: string }
  > = {
    entry: { label: "Entry Level", color: "bg-green-500/10 text-green-500" },
    mid: { label: "Mid Level", color: "bg-blue-500/10 text-blue-500" },
    senior: { label: "Senior", color: "bg-purple-500/10 text-purple-500" },
    lead: { label: "Lead", color: "bg-orange-500/10 text-orange-500" },
    executive: { label: "Executive", color: "bg-red-500/10 text-red-500" },
  };

  const { label, color } = config[level];
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", color)}>
      {label}
    </span>
  );
}

// Loading skeleton
export function JobCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
