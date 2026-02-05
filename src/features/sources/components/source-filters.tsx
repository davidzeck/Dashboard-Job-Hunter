"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  ChevronDown,
  Database,
  Globe,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, SearchInput, Badge } from "@/components/ui";
import type { SourceFilters, JobSourceType, ScraperStatus } from "@/types";

interface SourceFiltersBarProps {
  filters: SourceFilters;
  onFilterChange: (filters: Partial<SourceFilters>) => void;
  onReset: () => void;
  className?: string;
}

export function SourceFiltersBar({
  filters,
  onFilterChange,
  onReset,
  className,
}: SourceFiltersBarProps) {
  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== undefined && value !== "" && key !== "search"
  ).length;

  // Handle search with debounce
  const [searchValue, setSearchValue] = React.useState(filters.search || "");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ search: searchValue });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search sources by name or URL..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => {
              setSearchValue("");
              onFilterChange({ search: "" });
            }}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect
            value={filters.scraper_status || ""}
            onChange={(value) =>
              onFilterChange({
                scraper_status: value === "" ? undefined : (value as ScraperStatus),
              })
            }
            options={[
              { value: "", label: "All Status", icon: Database },
              { value: "active", label: "Active", icon: CheckCircle },
              { value: "error", label: "Error", icon: AlertCircle },
              { value: "paused", label: "Paused", icon: PauseCircle },
              { value: "inactive", label: "Inactive", icon: Clock },
            ]}
            className="w-[140px]"
          />

          {/* Source type filter */}
          <FilterSelect
            value={filters.source_type || ""}
            onChange={(value) =>
              onFilterChange({
                source_type: value === "" ? undefined : (value as JobSourceType),
              })
            }
            options={[
              { value: "", label: "All Types" },
              { value: "careers_page", label: "Careers Page" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "indeed", label: "Indeed" },
              { value: "glassdoor", label: "Glassdoor" },
              { value: "other", label: "Other" },
            ]}
            className="w-[150px]"
          />

          {/* Active only toggle */}
          <Button
            variant={filters.is_active === true ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFilterChange({
                is_active: filters.is_active === true ? undefined : true,
              })
            }
          >
            Active Only
          </Button>

          {/* Reset button */}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Status quick filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">Quick filters:</span>
        <StatusQuickFilter
          label="Errors"
          count={0}
          icon={AlertCircle}
          isActive={filters.scraper_status === "error"}
          variant="destructive"
          onClick={() =>
            onFilterChange({
              scraper_status: filters.scraper_status === "error" ? undefined : "error",
            })
          }
        />
        <StatusQuickFilter
          label="Paused"
          count={0}
          icon={PauseCircle}
          isActive={filters.scraper_status === "paused"}
          variant="warning"
          onClick={() =>
            onFilterChange({
              scraper_status: filters.scraper_status === "paused" ? undefined : "paused",
            })
          }
        />
        <StatusQuickFilter
          label="Inactive"
          count={0}
          icon={Clock}
          isActive={filters.scraper_status === "inactive"}
          variant="default"
          onClick={() =>
            onFilterChange({
              scraper_status: filters.scraper_status === "inactive" ? undefined : "inactive",
            })
          }
        />
      </div>

      {/* Active filters tags */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === "search") return null;
            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => onFilterChange({ [key]: undefined })}
              >
                {formatFilterLabel(key, value as string)}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Filter select component
interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: React.ElementType }>;
  className?: string;
}

function FilterSelect({ value, onChange, options, className }: FilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// Status quick filter button
interface StatusQuickFilterProps {
  label: string;
  count: number;
  icon: React.ElementType;
  isActive: boolean;
  variant: "default" | "destructive" | "warning";
  onClick: () => void;
}

function StatusQuickFilter({
  label,
  count,
  icon: Icon,
  isActive,
  variant,
  onClick,
}: StatusQuickFilterProps) {
  const variantColors = {
    default: "text-muted-foreground",
    destructive: "text-destructive",
    warning: "text-warning",
  };

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className="h-7 text-xs gap-1.5"
      onClick={onClick}
    >
      <Icon className={cn("h-3 w-3", !isActive && variantColors[variant])} />
      {label}
    </Button>
  );
}

// Helper to format filter labels
function formatFilterLabel(key: string, value: string): string {
  const labels: Record<string, string> = {
    scraper_status: `Status: ${value}`,
    source_type: `Type: ${value.replace("_", " ")}`,
    is_active: value === "true" ? "Active only" : "Inactive",
    company_id: "Company",
  };
  return labels[key] || `${key}: ${value}`;
}
