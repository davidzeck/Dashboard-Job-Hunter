"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { AreaChart } from "@/components/ui/charts";

interface JobsTimelineData {
  [key: string]: string | number;
  date: string;
  jobs: number;
  newJobs: number;
}

interface JobsTimelineChartProps {
  data: JobsTimelineData[];
  isLoading?: boolean;
  className?: string;
}

export function JobsTimelineChart({
  data,
  isLoading,
  className,
}: JobsTimelineChartProps) {
  // Calculate trend
  const trend = React.useMemo(() => {
    if (data.length < 2) return { value: 0, direction: "neutral" as const };

    const recent = data.slice(-3).reduce((sum, d) => sum + d.newJobs, 0);
    const previous = data.slice(-6, -3).reduce((sum, d) => sum + d.newJobs, 0);

    if (previous === 0) return { value: 0, direction: "neutral" as const };

    const percentChange = ((recent - previous) / previous) * 100;
    const direction = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral";
    return {
      value: Math.abs(Math.round(percentChange)),
      direction: direction as "up" | "down" | "neutral",
    };
  }, [data]);

  const totalNewJobs = data.reduce((sum, d) => sum + d.newJobs, 0);

  if (isLoading) {
    return <JobsTimelineChartSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Jobs Discovered</CardTitle>
            <TrendIndicator trend={trend} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalNewJobs}</span>
            <span className="text-sm text-muted-foreground">new jobs this week</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <AreaChart
            data={data}
            xKey="date"
            yKey="newJobs"
            height={200}
            showYAxis={false}
            gradientFrom="hsl(var(--primary))"
            strokeColor="hsl(var(--primary))"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface TrendIndicatorProps {
  trend: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
}

function TrendIndicator({ trend }: TrendIndicatorProps) {
  const config = {
    up: {
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      label: "increase",
    },
    down: {
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "decrease",
    },
    neutral: {
      icon: Minus,
      color: "text-muted-foreground",
      bg: "bg-muted",
      label: "no change",
    },
  };

  const { icon: Icon, color, bg, label } = config[trend.direction];

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", bg, color)}>
      <Icon className="h-3.5 w-3.5" />
      {trend.value > 0 && <span>{trend.value}%</span>}
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

function JobsTimelineChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <div className="h-9 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[200px] w-full animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

// Generate mock data for development
export function generateMockJobsTimelineData(days: number = 7): JobsTimelineData[] {
  const data: JobsTimelineData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      jobs: Math.floor(Math.random() * 50) + 100,
      newJobs: Math.floor(Math.random() * 20) + 5,
    });
  }

  return data;
}
