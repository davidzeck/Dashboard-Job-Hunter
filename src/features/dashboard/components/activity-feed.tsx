"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Database,
  AlertCircle,
  CheckCircle,
  Bell,
  RefreshCw,
  Building2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";

// Activity types
type ActivityType = "job_found" | "scrape_completed" | "scrape_failed" | "source_added" | "alert_sent" | "company_added";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    companyName?: string;
    jobCount?: number;
    sourceName?: string;
    errorMessage?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function ActivityFeed({
  activities,
  isLoading,
  onRefresh,
  className,
}: ActivityFeedProps) {
  const [filter, setFilter] = React.useState<ActivityType | "all">("all");

  const filteredActivities = filter === "all"
    ? activities
    : activities.filter((a) => a.type === filter);

  if (isLoading) {
    return <ActivityFeedSkeleton />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <div className="flex items-center gap-2">
            <FilterDropdown value={filter} onChange={setFilter} />
            {onRefresh && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {filteredActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            filteredActivities.map((activity, index) => (
              <ActivityFeedItem
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface ActivityFeedItemProps {
  activity: ActivityItem;
  index: number;
}

function ActivityFeedItem({ activity, index }: ActivityFeedItemProps) {
  const config = getActivityConfig(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className={cn("p-2 rounded-lg shrink-0", config.bgColor)}>
        <config.icon className={cn("h-4 w-4", config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {activity.description}
        </p>
        {activity.metadata?.errorMessage && (
          <p className="text-xs text-destructive mt-1 truncate">
            {activity.metadata.errorMessage}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatRelativeTime(activity.timestamp)}
      </span>
    </motion.div>
  );
}

function getActivityConfig(type: ActivityType) {
  const configs: Record<ActivityType, {
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
  }> = {
    job_found: {
      icon: Briefcase,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    scrape_completed: {
      icon: CheckCircle,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    scrape_failed: {
      icon: AlertCircle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    source_added: {
      icon: Database,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    alert_sent: {
      icon: Bell,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    company_added: {
      icon: Building2,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  };

  return configs[type];
}

interface FilterDropdownProps {
  value: ActivityType | "all";
  onChange: (value: ActivityType | "all") => void;
}

function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);

  const options: Array<{ value: ActivityType | "all"; label: string }> = [
    { value: "all", label: "All Activity" },
    { value: "job_found", label: "Jobs Found" },
    { value: "scrape_completed", label: "Scrapes" },
    { value: "scrape_failed", label: "Errors" },
    { value: "alert_sent", label: "Alerts" },
  ];

  const selectedLabel = options.find((o) => o.value === value)?.label || "All";

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => setOpen(!open)}
      >
        <Filter className="h-3 w-3 mr-1" />
        {selectedLabel}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 rounded-md border bg-popover shadow-lg z-20">
            {options.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent",
                  value === option.value && "bg-accent"
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
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

// Generate mock data for development
export function generateMockActivityData(count: number = 10): ActivityItem[] {
  const types: ActivityType[] = [
    "job_found",
    "scrape_completed",
    "scrape_failed",
    "source_added",
    "alert_sent",
  ];

  const companies = ["Google", "Microsoft", "Amazon", "Meta", "Safaricom", "Deloitte"];

  return Array.from({ length: count }).map((_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const timestamp = new Date(Date.now() - i * 1000 * 60 * Math.floor(Math.random() * 60));

    const configs: Record<ActivityType, { title: string; description: string }> = {
      job_found: {
        title: `${Math.floor(Math.random() * 5) + 1} new jobs at ${company}`,
        description: `Software Engineer, Product Manager, and more`,
      },
      scrape_completed: {
        title: `${company} scrape completed`,
        description: `Found ${Math.floor(Math.random() * 10) + 1} jobs in ${Math.floor(Math.random() * 30) + 5}s`,
      },
      scrape_failed: {
        title: `${company} scrape failed`,
        description: `Unable to fetch careers page`,
      },
      source_added: {
        title: `New source added`,
        description: `${company} careers page`,
      },
      alert_sent: {
        title: `Alert sent`,
        description: `Notified 5 users about new ${company} jobs`,
      },
      company_added: {
        title: `Company added`,
        description: `${company} added to tracking`,
      },
    };

    return {
      id: `activity-${i}`,
      type,
      ...configs[type],
      timestamp: timestamp.toISOString(),
      metadata: type === "scrape_failed" ? { errorMessage: "Connection timeout" } : undefined,
    };
  });
}
