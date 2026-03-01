"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Database,
  Bell,
  FileText,
  ArrowRight,
} from "lucide-react";
import { PageHeader, DashboardGrid } from "@/components/layout";
import {
  StatsCard,
  StatsCardSkeleton,
  RecentJobsList,
  SourceHealth,
  JobsTimelineChart,
  SourcePerformanceChart,
  ScrapeActivityChart,
  ActivityFeed,
  QuickActions,
  generateMockJobsTimelineData,
  generateMockSourcePerformanceData,
  generateMockScrapeActivityData,
  generateMockActivityData,
} from "@/features/dashboard/components";
import { QuickActionsCompact } from "@/features/dashboard/components/quick-actions";
import { Sparkline } from "@/components/ui/charts";
import {
  useDashboardStats,
  useNewJobs,
  useErrorSources,
  useTriggerScrape,
} from "@/hooks";
import { useUIStore, useToast, useAuthStore, selectUser } from "@/stores";
import { useSettingsStore, type SettingsState } from "@/stores";
import type { Job } from "@/types";

export default function OverviewPage() {
  const router = useRouter();
  const toast = useToast();
  const openModal = useUIStore((state) => state.openModal);
  const user = useAuthStore(selectUser);
  const setActiveTab = useSettingsStore((s: SettingsState) => s.setActiveTab);

  // Data fetching hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: newJobs, isLoading: jobsLoading } = useNewJobs(10);
  const { data: errorSources, isLoading: sourcesLoading } = useErrorSources();
  const triggerScrape = useTriggerScrape();

  // Local state for scraping
  const [isScraping, setIsScraping] = React.useState(false);

  // Mock data for charts (replace with real API data)
  const jobsTimelineData = React.useMemo(() => generateMockJobsTimelineData(7), []);
  const sourcePerformanceData = React.useMemo(() => generateMockSourcePerformanceData(), []);
  const scrapeActivityData = React.useMemo(() => generateMockScrapeActivityData(), []);
  const activityData = React.useMemo(() => generateMockActivityData(15), []);

  // Sparkline data for stats cards
  const jobsSparkline = React.useMemo(
    () => jobsTimelineData.map((d) => d.newJobs),
    [jobsTimelineData]
  );

  // Handlers
  const handleJobClick = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleSourceRefresh = (sourceId: string) => {
    triggerScrape.mutate(sourceId);
  };

  const handleTriggerAllScrapes = async () => {
    setIsScraping(true);
    toast.info("Starting scrape", "Scraping all active sources...");

    // Simulate scrape delay (replace with real API call)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsScraping(false);
    toast.success("Scrape complete", "All sources have been scraped");
  };

  const handleAddSource = () => {
    openModal("add-source");
  };

  const handleAddCompany = () => {
    openModal("add-company");
  };

  const handleViewErrors = () => {
    router.push("/sources?status=error");
  };

  const handleExportJobs = () => {
    toast.info("Export started", "Preparing CSV download...");
  };

  const handleOpenSettings = () => {
    router.push("/settings");
  };

  const handleGoToDocuments = () => {
    setActiveTab("documents");
    router.push("/settings");
  };

  return (
    <div className="space-y-6">
      {/* CV onboarding banner — shown when user has no CV */}
      {user && !user.has_cv && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Upload your CV to unlock skill matching</p>
              <p className="text-xs text-muted-foreground">
                Your skills will be extracted automatically and matched against job requirements.
              </p>
            </div>
          </div>
          <button
            onClick={handleGoToDocuments}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Upload CV
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Dashboard Overview"
          description="Monitor job scraping activity and discover new opportunities"
        />
        <QuickActionsCompact
          onTriggerAllScrapes={handleTriggerAllScrapes}
          onAddSource={handleAddSource}
          onViewErrors={handleViewErrors}
          isScraping={isScraping}
          errorCount={errorSources?.length || 0}
        />
      </div>

      {/* Stats Grid */}
      <DashboardGrid columns={4}>
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Jobs"
              value={stats?.total_jobs || 0}
              description="Across all sources"
              icon={Briefcase}
            />
            <StatsCardWithSparkline
              title="New Today"
              value={stats?.new_jobs_today || 0}
              description="Jobs discovered today"
              icon={TrendingUp}
              variant={stats?.new_jobs_today ? "urgent" : "default"}
              sparklineData={jobsSparkline}
              trend={
                stats?.new_jobs_today
                  ? { value: 12, isPositive: true }
                  : undefined
              }
            />
            <StatsCard
              title="Active Sources"
              value={`${stats?.active_sources || 0}/${stats?.total_sources || 0}`}
              description="Sources actively scraping"
              icon={Database}
              variant={
                (stats?.active_sources || 0) < (stats?.total_sources || 0)
                  ? "warning"
                  : "success"
              }
            />
            <StatsCard
              title="Alerts Sent"
              value={stats?.alerts_sent_today || 0}
              description="Notifications sent today"
              icon={Bell}
            />
          </>
        )}
      </DashboardGrid>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <JobsTimelineChart data={jobsTimelineData} />
        <SourcePerformanceChart
          data={sourcePerformanceData.data}
          successRate={sourcePerformanceData.successRate}
        />
      </div>

      {/* Scrape Activity */}
      <ScrapeActivityChart data={scrapeActivityData} />

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Jobs */}
        <RecentJobsList
          jobs={newJobs || []}
          isLoading={jobsLoading}
          onJobClick={handleJobClick}
          className="lg:col-span-1"
        />

        {/* Activity Feed */}
        <ActivityFeed
          activities={activityData}
          className="lg:col-span-1"
        />

        {/* Quick Actions & Source Health */}
        <div className="space-y-6 lg:col-span-1">
          <QuickActions
            onTriggerAllScrapes={handleTriggerAllScrapes}
            onAddSource={handleAddSource}
            onAddCompany={handleAddCompany}
            onViewErrors={handleViewErrors}
            onExportJobs={handleExportJobs}
            onOpenSettings={handleOpenSettings}
            isScraping={isScraping}
            errorCount={errorSources?.length || 0}
          />

          <SourceHealth
            sources={errorSources || []}
            isLoading={sourcesLoading}
            onRefresh={handleSourceRefresh}
          />
        </div>
      </div>
    </div>
  );
}

// Stats card with sparkline
interface StatsCardWithSparklineProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ElementType;
  variant?: "default" | "urgent" | "success" | "warning";
  sparklineData?: number[];
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCardWithSparkline({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  sparklineData,
  trend,
}: StatsCardWithSparklineProps) {
  const variantStyles = {
    default: "border-border",
    urgent: "border-urgent/50 bg-urgent/5",
    success: "border-success/50 bg-success/5",
    warning: "border-warning/50 bg-warning/5",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    urgent: "bg-urgent/10 text-urgent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  const sparklineColors = {
    default: "hsl(var(--primary))",
    urgent: "hsl(var(--urgent))",
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 ${variantStyles[variant]}`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-success" : "text-destructive"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% from yesterday
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {Icon && (
              <div className={`rounded-lg p-3 ${iconStyles[variant]}`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            {sparklineData && sparklineData.length > 0 && (
              <Sparkline
                data={sparklineData}
                height={30}
                color={sparklineColors[variant]}
                className="w-20"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
