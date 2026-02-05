"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Download,
  AlertTriangle,
  Zap,
  Settings,
  Building2,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  variant?: "default" | "primary" | "warning" | "destructive";
  onClick: () => void;
  isLoading?: boolean;
}

interface QuickActionsProps {
  onTriggerAllScrapes?: () => void;
  onAddSource?: () => void;
  onAddCompany?: () => void;
  onViewErrors?: () => void;
  onExportJobs?: () => void;
  onOpenSettings?: () => void;
  isScraping?: boolean;
  errorCount?: number;
  className?: string;
}

export function QuickActions({
  onTriggerAllScrapes,
  onAddSource,
  onAddCompany,
  onViewErrors,
  onExportJobs,
  onOpenSettings,
  isScraping = false,
  errorCount = 0,
  className,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "scrape-all",
      label: "Scrape All Sources",
      description: "Trigger immediate scrape",
      icon: RefreshCw,
      variant: "primary",
      onClick: () => onTriggerAllScrapes?.(),
      isLoading: isScraping,
    },
    {
      id: "add-source",
      label: "Add Source",
      description: "Add new job source",
      icon: Database,
      onClick: () => onAddSource?.(),
    },
    {
      id: "add-company",
      label: "Add Company",
      description: "Track new company",
      icon: Building2,
      onClick: () => onAddCompany?.(),
    },
    {
      id: "view-errors",
      label: `View Errors${errorCount > 0 ? ` (${errorCount})` : ""}`,
      description: "Check failing sources",
      icon: AlertTriangle,
      variant: errorCount > 0 ? "warning" : "default",
      onClick: () => onViewErrors?.(),
    },
    {
      id: "export-jobs",
      label: "Export Jobs",
      description: "Download as CSV",
      icon: Download,
      onClick: () => onExportJobs?.(),
    },
    {
      id: "settings",
      label: "Settings",
      description: "Configure dashboard",
      icon: Settings,
      onClick: () => onOpenSettings?.(),
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <QuickActionButton key={action.id} action={action} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionButtonProps {
  action: QuickAction;
  index: number;
}

function QuickActionButton({ action, index }: QuickActionButtonProps) {
  const variantStyles = {
    default: "hover:bg-accent hover:text-accent-foreground",
    primary: "hover:bg-primary/10 hover:text-primary",
    warning: "hover:bg-warning/10 hover:text-warning",
    destructive: "hover:bg-destructive/10 hover:text-destructive",
  };

  const iconStyles = {
    default: "text-muted-foreground group-hover:text-foreground",
    primary: "text-primary",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={action.onClick}
      disabled={action.isLoading}
      className={cn(
        "group flex flex-col items-start gap-1 p-3 rounded-lg border transition-all text-left",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[action.variant || "default"]
      )}
    >
      <div className="flex items-center gap-2">
        <action.icon
          className={cn(
            "h-4 w-4 transition-colors",
            action.isLoading && "animate-spin",
            iconStyles[action.variant || "default"]
          )}
        />
        <span className="text-sm font-medium">{action.label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{action.description}</span>
    </motion.button>
  );
}

// Compact version for smaller spaces
interface QuickActionsCompactProps {
  onTriggerAllScrapes?: () => void;
  onAddSource?: () => void;
  onViewErrors?: () => void;
  isScraping?: boolean;
  errorCount?: number;
  className?: string;
}

export function QuickActionsCompact({
  onTriggerAllScrapes,
  onAddSource,
  onViewErrors,
  isScraping = false,
  errorCount = 0,
  className,
}: QuickActionsCompactProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onTriggerAllScrapes}
        disabled={isScraping}
        leftIcon={
          <RefreshCw className={cn("h-4 w-4", isScraping && "animate-spin")} />
        }
      >
        {isScraping ? "Scraping..." : "Scrape All"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddSource}
        leftIcon={<Plus className="h-4 w-4" />}
      >
        Add Source
      </Button>
      {errorCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewErrors}
          className="text-warning border-warning/50"
          leftIcon={<AlertTriangle className="h-4 w-4" />}
        >
          {errorCount} Errors
        </Button>
      )}
    </div>
  );
}
