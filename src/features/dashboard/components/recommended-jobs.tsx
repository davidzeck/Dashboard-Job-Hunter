"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  CompanyAvatar,
} from "@/components/ui";
import { useRecommendedJobs } from "@/hooks";
import type { RecommendedJob } from "@/types";

// Self-contained: fetches its own data, hides itself when there's nothing to show
interface RecommendedJobsProps {
  hasCv: boolean;
  onJobClick?: (job: RecommendedJob) => void;
  className?: string;
}

function scoreVariant(score: number): "success" | "warning" | "secondary" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "secondary";
}

export function RecommendedJobs({ hasCv, onJobClick, className }: RecommendedJobsProps) {
  const { data, isLoading } = useRecommendedJobs(6);
  const jobs = data?.items ?? [];

  // No CV → the overview onboarding banner already owns this state.
  if (!hasCv) return null;
  if (!isLoading && jobs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <RecommendedTitle />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No skill matches in the current jobs yet — check back as new roles are scraped.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <RecommendedTitle />
          {!isLoading && <Badge variant="secondary">{data?.total ?? 0} matches</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <RecommendedJobsSkeleton />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <RecommendedJobItem
                key={job.id}
                job={job}
                index={index}
                onClick={() => onJobClick?.(job)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendedTitle() {
  return (
    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
      <Sparkles className="h-4 w-4 text-primary" />
      Recommended for you
    </CardTitle>
  );
}

function RecommendedJobItem({
  job,
  index,
  onClick,
}: {
  job: RecommendedJob;
  index: number;
  onClick?: () => void;
}) {
  const shownSkills = job.matched_skills.slice(0, 4);
  const extra = job.matched_skills.length - shownSkills.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CompanyAvatar
            name={job.company?.name || "Unknown"}
            logoUrl={job.company?.logo_url}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{job.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {job.company?.name} • {job.location || "Remote"}
            </p>
          </div>
        </div>
        <Badge variant={scoreVariant(job.match_score)} className="shrink-0">
          {Math.round(job.match_score)}%
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {shownSkills.map((skill) => (
          <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0">
            {skill}
          </Badge>
        ))}
        {extra > 0 && (
          <span className="text-[10px] text-muted-foreground self-center">+{extra} more</span>
        )}
      </div>
    </motion.div>
  );
}

function RecommendedJobsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={cn("rounded-lg border p-3 space-y-2")}>
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
