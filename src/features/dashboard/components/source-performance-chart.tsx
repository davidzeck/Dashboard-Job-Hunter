"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, PauseCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { DonutChart, ProgressRing } from "@/components/ui/charts";

interface SourcePerformanceData {
  active: number;
  error: number;
  paused: number;
  inactive: number;
}

interface SourcePerformanceChartProps {
  data: SourcePerformanceData;
  successRate: number;
  isLoading?: boolean;
  className?: string;
}

export function SourcePerformanceChart({
  data,
  successRate,
  isLoading,
  className,
}: SourcePerformanceChartProps) {
  const chartData = [
    { name: "Active", value: data.active, color: "hsl(var(--success))" },
    { name: "Error", value: data.error, color: "hsl(var(--destructive))" },
    { name: "Paused", value: data.paused, color: "hsl(var(--warning))" },
    { name: "Inactive", value: data.inactive, color: "hsl(var(--muted-foreground))" },
  ].filter((item) => item.value > 0);

  const total = data.active + data.error + data.paused + data.inactive;

  if (isLoading) {
    return <SourcePerformanceChartSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Source Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            {/* Donut chart */}
            <div className="flex-1">
              <DonutChart
                data={chartData}
                height={160}
                innerRadius={45}
                outerRadius={65}
                showLegend={false}
                centerValue={total}
                centerLabel="sources"
              />
            </div>

            {/* Success rate ring */}
            <div className="flex flex-col items-center gap-2">
              <ProgressRing
                value={successRate}
                size={100}
                strokeWidth={8}
                color={successRate >= 80 ? "hsl(var(--success))" : successRate >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                label="Success"
              />
            </div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <StatusItem
              icon={CheckCircle}
              label="Active"
              value={data.active}
              color="text-success"
            />
            <StatusItem
              icon={AlertCircle}
              label="Error"
              value={data.error}
              color="text-destructive"
            />
            <StatusItem
              icon={PauseCircle}
              label="Paused"
              value={data.paused}
              color="text-warning"
            />
            <StatusItem
              icon={Clock}
              label="Inactive"
              value={data.inactive}
              color="text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatusItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}

function StatusItem({ icon: Icon, label, value, color }: StatusItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <Icon className={cn("h-4 w-4", color)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SourcePerformanceChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="h-[160px] w-[160px] animate-pulse rounded-full bg-muted" />
          <div className="h-[100px] w-[100px] animate-pulse rounded-full bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Generate mock data for development
export function generateMockSourcePerformanceData(): {
  data: SourcePerformanceData;
  successRate: number;
} {
  return {
    data: {
      active: Math.floor(Math.random() * 10) + 15,
      error: Math.floor(Math.random() * 3),
      paused: Math.floor(Math.random() * 2),
      inactive: Math.floor(Math.random() * 3),
    },
    successRate: Math.floor(Math.random() * 20) + 75,
  };
}
