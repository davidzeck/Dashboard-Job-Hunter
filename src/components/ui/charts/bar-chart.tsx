"use client";

import * as React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  barColor?: string;
  barRadius?: number;
  className?: string;
}

export function BarChart({
  data,
  xKey,
  yKey,
  height = 300,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  barColor = "hsl(var(--primary))",
  barRadius = 4,
  className,
}: BarChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
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
            />
          )}
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
            />
          )}
          <Bar
            dataKey={yKey}
            fill={barColor}
            radius={[barRadius, barRadius, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Horizontal bar chart
interface HorizontalBarChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  height?: number;
  showTooltip?: boolean;
  colors?: string[];
  className?: string;
}

export function HorizontalBarChart({
  data,
  xKey,
  yKey,
  height = 200,
  showTooltip = true,
  colors,
  className,
}: HorizontalBarChartProps) {
  const defaultColors = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(var(--muted-foreground))",
  ];

  const barColors = colors || defaultColors;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey={xKey}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          {showTooltip && (
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
          )}
          <Bar dataKey={yKey} radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

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
