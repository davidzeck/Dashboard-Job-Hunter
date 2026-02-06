"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { BarChart } from "@/components/ui/charts";

interface ScrapeActivityData {
  [key: string]: string | number;
  hour: string;
  scrapes: number;
  success: number;
  failed: number;
}

interface ScrapeActivityChartProps {
  data: ScrapeActivityData[];
  isLoading?: boolean;
  className?: string;
}

export function ScrapeActivityChart({
  data,
  isLoading,
  className,
}: ScrapeActivityChartProps) {
  const totalScrapes = data.reduce((sum, d) => sum + d.scrapes, 0);
  const totalFailed = data.reduce((sum, d) => sum + d.failed, 0);
  const successRate = totalScrapes > 0
    ? Math.round(((totalScrapes - totalFailed) / totalScrapes) * 100)
    : 100;

  if (isLoading) {
    return <ScrapeActivityChartSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Scrape Activity
            </CardTitle>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalScrapes}</p>
              <p className="text-xs text-muted-foreground">
                scrapes today ({successRate}% success)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <BarChart
            data={data}
            xKey="hour"
            yKey="scrapes"
            height={180}
            showYAxis={false}
            barColor="hsl(var(--primary))"
            barRadius={2}
          />
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Total Scrapes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-success" />
              <span className="text-muted-foreground">
                Success: {totalScrapes - totalFailed}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Failed: {totalFailed}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ScrapeActivityChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="text-right space-y-1">
            <div className="h-8 w-12 animate-pulse rounded bg-muted ml-auto" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[180px] w-full animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

// Generate mock data for development
export function generateMockScrapeActivityData(): ScrapeActivityData[] {
  const data: ScrapeActivityData[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(now.getHours() - i);

    const scrapes = Math.floor(Math.random() * 15) + 2;
    const failed = Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0;

    data.push({
      hour: hour.toLocaleTimeString("en-US", { hour: "numeric" }),
      scrapes,
      success: scrapes - failed,
      failed,
    });
  }

  return data;
}
