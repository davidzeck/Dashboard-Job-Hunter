"use client";

import * as React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  [key: string]: string | number;
}

interface AreaChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  strokeColor?: string;
  className?: string;
}

export function AreaChart({
  data,
  xKey,
  yKey,
  height = 300,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  gradientFrom = "hsl(var(--primary))",
  gradientTo = "hsl(var(--primary) / 0.1)",
  strokeColor = "hsl(var(--primary))",
  className,
}: AreaChartProps) {
  const gradientId = React.useId();

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.3} />
              <stop offset="95%" stopColor={gradientTo} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
          )}
          {showYAxis && (
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
          )}
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
            />
          )}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Mini sparkline chart for stats cards
interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  height = 40,
  color = "hsl(var(--primary))",
  className,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const gradientId = React.useId();

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-sm font-medium">{label}</p>
      {payload.map((item: any, index: number) => (
        <p key={index} className="text-sm text-muted-foreground">
          {item.name}: <span className="font-medium text-foreground">{item.value}</span>
        </p>
      ))}
    </div>
  );
}
