"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui";

// Dumb component - pure presentation
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "urgent" | "success" | "warning";
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatsCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(variantStyles[variant], className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trend && (
                <p
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}% from yesterday
                </p>
              )}
            </div>
            {Icon && (
              <div className={cn("rounded-lg p-3", iconStyles[variant])}>
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading skeleton for stats card
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
