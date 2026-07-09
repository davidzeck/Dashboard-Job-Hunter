"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Pause,
  Play,
  Edit2,
  Trash2,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  BarChart3,
  Loader2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CompanyAvatar,
  Skeleton,
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/stores";
import {
  useSource,
  useScrapeLogs,
  useTriggerScrape,
  useUpdateSource,
  useDeleteSource,
} from "@/hooks";
import type { ScrapeLog, ScraperStatus } from "@/types";

export default function SourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const sourceId = params.id as string;

  // Real data — fetch source + scrape logs by id
  const { data: currentSource, isLoading } = useSource(sourceId);
  const { data: scrapeLogsPage } = useScrapeLogs(sourceId);
  const scrapeHistory = scrapeLogsPage?.items ?? [];

  const triggerScrape = useTriggerScrape();
  const updateSource = useUpdateSource();
  const deleteSource = useDeleteSource();
  const isScraping = triggerScrape.isPending;

  // Handlers
  const handleBack = () => {
    router.back();
  };

  const handleScrapeNow = () => {
    triggerScrape.mutate(sourceId);
  };

  const handleToggleActive = () => {
    if (!currentSource) return;
    updateSource.mutate({ id: sourceId, data: { is_active: !currentSource.is_active } });
  };

  const handleEdit = () => {
    toast.info("Edit source", "Use the sources list to edit for now.");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this source?")) {
      deleteSource.mutate(sourceId, {
        onSuccess: () => router.push("/sources"),
      });
    }
  };

  if (isLoading) {
    return <SourceDetailSkeleton />;
  }

  if (!currentSource) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Source not found</h2>
        <p className="text-muted-foreground mb-4">
          The source you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  // Calculate stats
  const totalJobsFound = scrapeHistory.reduce((sum, log) => sum + log.jobs_found, 0);
  const successRate = scrapeHistory.length > 0
    ? Math.round(
        (scrapeHistory.filter((log) => log.status === "completed").length /
          scrapeHistory.length) *
          100
      )
    : 100;
  const avgDuration = scrapeHistory.length > 0
    ? Math.round(
        scrapeHistory.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) /
          scrapeHistory.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Sources
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <CompanyAvatar
                name={currentSource.company?.name || "Source"}
                logoUrl={currentSource.company?.logo_url}
                size="xl"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">
                        {currentSource.company?.name || "Unknown Company"}
                      </h1>
                      <ScraperStatusBadge status={currentSource.scraper_status} />
                    </div>
                    <p className="text-muted-foreground">
                      {formatSourceType(currentSource.source_type)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(currentSource.source_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleActive}
                    >
                      {currentSource.is_active ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleScrapeNow}
                      disabled={isScraping}
                    >
                      {isScraping ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Scrape Now
                    </Button>
                  </div>
                </div>

                {/* URL */}
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <a
                    href={currentSource.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {currentSource.source_url}
                  </a>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {currentSource.jobs_found_count} jobs found
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last scraped {currentSource.last_scraped_at
                      ? formatRelativeTime(currentSource.last_scraped_at)
                      : "never"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Added {formatDate(currentSource.created_at)}
                  </span>
                </div>

                {/* Error message */}
                {currentSource.last_error && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{currentSource.last_error}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Jobs Found"
          value={totalJobsFound}
          icon={Briefcase}
        />
        <StatsCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={TrendingUp}
          variant={successRate >= 90 ? "success" : successRate >= 70 ? "warning" : "error"}
        />
        <StatsCard
          title="Avg. Duration"
          value={`${avgDuration}s`}
          icon={Clock}
        />
        <StatsCard
          title="Total Scrapes"
          value={scrapeHistory.length}
          icon={BarChart3}
        />
      </div>

      {/* Scrape History */}
      <Card>
        <CardHeader>
          <CardTitle>Scrape History</CardTitle>
          <CardDescription>
            Recent scraping activity for this source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrapeHistoryTable history={scrapeHistory} />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for this source
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete this source</p>
            <p className="text-sm text-muted-foreground">
              This will permanently remove the source and all associated data.
            </p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Source
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "error";
}

function StatsCard({ title, value, icon: Icon, variant = "default" }: StatsCardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error: "text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", variantStyles[variant])}>{value}</p>
          </div>
          <div className={cn("p-3 rounded-lg bg-muted", variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Scrape history table
function ScrapeHistoryTable({ history }: { history: ScrapeLog[] }) {
  if (history.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No scrape history yet
      </p>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left p-3 text-sm font-medium">Status</th>
            <th className="text-left p-3 text-sm font-medium">Started</th>
            <th className="text-left p-3 text-sm font-medium">Duration</th>
            <th className="text-left p-3 text-sm font-medium">Jobs Found</th>
            <th className="text-left p-3 text-sm font-medium">New</th>
            <th className="text-left p-3 text-sm font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {history.map((log) => (
            <tr key={log.id} className="hover:bg-muted/30">
              <td className="p-3">
                <ScrapeStatusBadge status={log.status} />
              </td>
              <td className="p-3 text-sm">
                {formatRelativeTime(log.started_at)}
              </td>
              <td className="p-3 text-sm">
                {log.duration_seconds ? `${log.duration_seconds}s` : "-"}
              </td>
              <td className="p-3 text-sm font-medium">{log.jobs_found}</td>
              <td className="p-3 text-sm text-success font-medium">
                +{log.jobs_new}
              </td>
              <td className="p-3 text-sm text-muted-foreground">
                {log.jobs_updated}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Status badges
function ScraperStatusBadge({ status }: { status: ScraperStatus }) {
  const configs: Record<ScraperStatus, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-success/10 text-success" },
    error: { label: "Error", className: "bg-destructive/10 text-destructive" },
    paused: { label: "Paused", className: "bg-warning/10 text-warning" },
    inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  };

  const config = configs[status];
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

function ScrapeStatusBadge({ status }: { status: ScrapeLog["status"] }) {
  const configs: Record<ScrapeLog["status"], { icon: React.ElementType; className: string }> = {
    started: { icon: Loader2, className: "text-primary" },
    completed: { icon: CheckCircle, className: "text-success" },
    success: { icon: CheckCircle, className: "text-success" },
    partial: { icon: CheckCircle, className: "text-warning" },
    failed: { icon: XCircle, className: "text-destructive" },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={cn("flex items-center gap-1 text-sm font-medium", config.className)}>
      <Icon className={cn("h-4 w-4", status === "started" && "animate-spin")} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Helper functions
function formatSourceType(type: string): string {
  const labels: Record<string, string> = {
    careers_page: "Careers Page",
    linkedin: "LinkedIn",
    indeed: "Indeed",
    glassdoor: "Glassdoor",
    other: "Other",
  };
  return labels[type] || type;
}

// Skeleton loader
function SourceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
