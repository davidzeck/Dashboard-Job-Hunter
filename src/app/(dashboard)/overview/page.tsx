"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Database,
  Bell,
  Bookmark,
  CheckCircle2,
  Sparkles,
  FileText,
  Search,
  Brain,
  ArrowRight,
} from "lucide-react";
import { PageHeader, DashboardGrid } from "@/components/layout";
import {
  StatsCard,
  StatsCardSkeleton,
  RecentJobsList,
  RecommendedJobs,
  SourceHealth,
  JobsTimelineChart,
  SourcePerformanceChart,
  ScrapeActivityChart,
  ActivityFeed,
  QuickActions,
} from "@/features/dashboard/components";
import { QuickActionsCompact } from "@/features/dashboard/components/quick-actions";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { Sparkline } from "@/components/ui/charts";
import {
  useDashboardStats,
  useNewJobs,
  useErrorSources,
  useTriggerScrape,
  useJobsTimeline,
  useScrapeActivity,
  useSourcePerformance,
  useActivity,
  useUserStats,
  useAiUsage,
} from "@/hooks";
import {
  useUIStore,
  useToast,
  useAuthStore,
  selectUser,
  selectIsAdmin,
} from "@/stores";
import type { Job } from "@/types";

export default function OverviewPage() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const isAdmin = useAuthStore(selectIsAdmin);

  // Client data
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: aiUsage } = useAiUsage();
  const { data: newJobs, isLoading: jobsLoading } = useNewJobs(10);

  const handleJobClick = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };

  const firstName = user?.full_name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Overview"}
        description="Your job search at a glance"
      />

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
            onClick={() => router.push("/cvs")}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Upload CV
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Personal activity tiles — all clickable */}
      <DashboardGrid columns={4}>
        {userStatsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Link href="/my-jobs">
              <StatsCard
                title="Saved Jobs"
                value={userStats?.saved_count ?? 0}
                description="Bookmarked for later"
                icon={Bookmark}
              />
            </Link>
            <Link href="/my-jobs?tab=applied">
              <StatsCard
                title="Applications"
                value={userStats?.applied_count ?? 0}
                description="Jobs you've applied to"
                icon={CheckCircle2}
              />
            </Link>
            <Link href="/alerts">
              <StatsCard
                title="Unread Alerts"
                value={userStats?.unread_alerts ?? 0}
                description="New job matches"
                icon={Bell}
                variant={userStats?.unread_alerts ? "urgent" : "default"}
              />
            </Link>
            <Link href="/cvs">
              <StatsCard
                title="AI Credits"
                value={
                  aiUsage ? `${aiUsage.remaining}/${aiUsage.limit}` : "—"
                }
                description="Analyze & tailor calls left today"
                icon={Sparkles}
                variant={aiUsage?.exhausted ? "warning" : "default"}
              />
            </Link>
          </>
        )}
      </DashboardGrid>

      {/* Skill-matched recommendations (hidden until the user has a CV) */}
      <RecommendedJobs hasCv={Boolean(user?.has_cv)} onJobClick={handleJobClick} />

      {/* Recent jobs + client quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentJobsList
          jobs={newJobs || []}
          isLoading={jobsLoading}
          onJobClick={handleJobClick}
          onViewAll={() => router.push("/jobs?new=1")}
          className="lg:col-span-2"
        />
        <ClientQuickActions />
      </div>

      {/* Platform analytics — admin only */}
      {isAdmin && <AdminPlatformSection onJobClick={handleJobClick} />}
    </div>
  );
}

// ─── Client quick actions ─────────────────────────────────────

function ClientQuickActions() {
  const router = useRouter();
  const actions = [
    { label: "Browse jobs", icon: Search, href: "/jobs" },
    { label: "Manage CVs", icon: FileText, href: "/cvs" },
    { label: "Review alerts", icon: Bell, href: "/alerts" },
    { label: "Edit skills & profile", icon: Brain, href: "/settings" },
  ];
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map(({ label, icon: Icon, href }) => (
          <Button
            key={href}
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => router.push(href)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Admin platform section (unchanged widgets, gated) ────────

function AdminPlatformSection({ onJobClick }: { onJobClick: (job: Job) => void }) {
  const router = useRouter();
  const toast = useToast();
  const openModal = useUIStore((state) => state.openModal);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: errorSources, isLoading: sourcesLoading } = useErrorSources();
  const triggerScrape = useTriggerScrape();
  const [isScraping, setIsScraping] = React.useState(false);

  const { data: jobsTimelineData, isLoading: timelineLoading } = useJobsTimeline(7);
  const { data: sourcePerformanceData, isLoading: perfLoading } = useSourcePerformance();
  const { data: scrapeActivityData, isLoading: scrapeActivityLoading } = useScrapeActivity(24);
  const { data: activityData, isLoading: activityLoading } = useActivity(15);

  const jobsSparkline = React.useMemo(
    () => (jobsTimelineData ?? []).map((d) => d.newJobs),
    [jobsTimelineData]
  );

  const handleTriggerAllScrapes = async () => {
    setIsScraping(true);
    toast.info("Starting scrape", "Scraping all active sources...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsScraping(false);
    toast.success("Scrape complete", "All sources have been scraped");
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Platform</h2>
          <p className="text-sm text-muted-foreground">
            Scraping activity and source health (admin)
          </p>
        </div>
        <QuickActionsCompact
          onTriggerAllScrapes={handleTriggerAllScrapes}
          onAddSource={() => openModal("add-source")}
          onViewErrors={() => router.push("/sources?status=error")}
          isScraping={isScraping}
          errorCount={errorSources?.length || 0}
        />
      </div>

      {/* Platform stats */}
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
        <JobsTimelineChart data={jobsTimelineData ?? []} isLoading={timelineLoading} />
        <SourcePerformanceChart
          data={sourcePerformanceData?.data ?? { active: 0, error: 0, paused: 0, inactive: 0 }}
          successRate={sourcePerformanceData?.successRate ?? 0}
          isLoading={perfLoading}
        />
      </div>

      <ScrapeActivityChart data={scrapeActivityData ?? []} isLoading={scrapeActivityLoading} />

      {/* Activity + admin actions + source health */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ActivityFeed
          activities={activityData ?? []}
          isLoading={activityLoading}
          className="lg:col-span-2"
        />
        <div className="space-y-6 lg:col-span-1">
          <QuickActions
            onTriggerAllScrapes={handleTriggerAllScrapes}
            onAddSource={() => openModal("add-source")}
            onAddCompany={() => openModal("add-company")}
            onViewErrors={() => router.push("/sources?status=error")}
            onExportJobs={() =>
              toast.info("Export started", "Preparing CSV download...")
            }
            onOpenSettings={() => router.push("/settings")}
            isScraping={isScraping}
            errorCount={errorSources?.length || 0}
          />
          <SourceHealth
            sources={errorSources || []}
            isLoading={sourcesLoading}
            onRefresh={(sourceId) => triggerScrape.mutate(sourceId)}
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
