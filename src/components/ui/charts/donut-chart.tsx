"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(0 84% 60%)",
  "hsl(217 91% 60%)",
];

export function DonutChart({
  data,
  height = 200,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
  showTooltip = true,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn("w-full relative", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          {showLegend && (
            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              height={36}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-2xl font-bold">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Progress ring (single value donut)
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = "hsl(var(--primary))",
  backgroundColor = "hsl(var(--muted))",
  showValue = true,
  label,
  className,
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-sm font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        Value: <span className="font-medium text-foreground">{data.value}</span>
      </p>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
