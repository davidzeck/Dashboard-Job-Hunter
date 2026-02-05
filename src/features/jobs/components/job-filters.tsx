"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Briefcase,
  ChevronDown,
  RotateCcw,
  Bookmark,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button,
  Input,
  SearchInput,
  Badge,
} from "@/components/ui";
import type { JobFilters, JobStatus, ExperienceLevel, JobType, Company } from "@/types";

interface JobFiltersBarProps {
  filters: JobFilters;
  onFilterChange: (filters: Partial<JobFilters>) => void;
  onReset: () => void;
  companies?: Company[];
  className?: string;
}

// Filter presets for quick access
const FILTER_PRESETS = [
  { id: "new_today", label: "New Today", filters: { status: "new" as JobStatus } },
  { id: "remote", label: "Remote", filters: { job_type: "remote" as JobType } },
  { id: "senior", label: "Senior+", filters: { experience_level: "senior" as ExperienceLevel } },
  { id: "entry", label: "Entry Level", filters: { experience_level: "entry" as ExperienceLevel } },
];

export function JobFiltersBar({
  filters,
  onFilterChange,
  onReset,
  companies = [],
  className,
}: JobFiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Count active filters (excluding search)
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

  const handlePresetClick = (preset: typeof FILTER_PRESETS[0]) => {
    onFilterChange(preset.filters);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search jobs by title, company..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => {
              setSearchValue("");
              onFilterChange({ search: "" });
            }}
          />
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <FilterSelect
            value={filters.status || ""}
            onChange={(value) =>
              onFilterChange({ status: value === "" ? undefined : (value as JobStatus) })
            }
            options={[
              { value: "", label: "All Status" },
              { value: "new", label: "New" },
              { value: "active", label: "Active" },
              { value: "expired", label: "Expired" },
              { value: "filled", label: "Filled" },
            ]}
            className="w-[120px]"
          />

          {/* Job Type filter */}
          <FilterSelect
            value={filters.job_type || ""}
            onChange={(value) =>
              onFilterChange({ job_type: value === "" ? undefined : (value as JobType) })
            }
            options={[
              { value: "", label: "All Types" },
              { value: "full_time", label: "Full Time" },
              { value: "part_time", label: "Part Time" },
              { value: "contract", label: "Contract" },
              { value: "internship", label: "Internship" },
              { value: "remote", label: "Remote" },
            ]}
            className="w-[130px]"
          />

          {/* Advanced filters toggle */}
          <Button
            variant={showAdvanced ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
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

      {/* Filter presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">Quick filters:</span>
        {FILTER_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handlePresetClick(preset)}
          >
            <Bookmark className="h-3 w-3 mr-1" />
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border rounded-lg bg-card space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Experience Level
                  </label>
                  <FilterSelect
                    value={filters.experience_level || ""}
                    onChange={(value) =>
                      onFilterChange({
                        experience_level: value === "" ? undefined : (value as ExperienceLevel),
                      })
                    }
                    options={[
                      { value: "", label: "All Levels" },
                      { value: "entry", label: "Entry Level" },
                      { value: "mid", label: "Mid Level" },
                      { value: "senior", label: "Senior" },
                      { value: "lead", label: "Lead" },
                      { value: "executive", label: "Executive" },
                    ]}
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Company
                  </label>
                  <FilterSelect
                    value={filters.company_id || ""}
                    onChange={(value) =>
                      onFilterChange({ company_id: value === "" ? undefined : value })
                    }
                    options={[
                      { value: "", label: "All Companies" },
                      ...companies.map((company) => ({
                        value: company.id,
                        label: company.name,
                      })),
                    ]}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </label>
                  <Input
                    placeholder="City, country, or remote"
                    value={filters.location || ""}
                    onChange={(e) => onFilterChange({ location: e.target.value || undefined })}
                    className="h-9"
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Posted Date
                  </label>
                  <DateRangePicker
                    from={filters.date_from}
                    to={filters.date_to}
                    onChange={(from, to) => onFilterChange({ date_from: from, date_to: to })}
                  />
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Salary Range (KES)
                </label>
                <SalaryRangeFilter
                  min={(filters as any).salary_min}
                  max={(filters as any).salary_max}
                  onChange={(min, max) =>
                    onFilterChange({ salary_min: min, salary_max: max } as any)
                  }
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
  options: Array<{ value: string; label: string }>;
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

// Date range picker component
interface DateRangePickerProps {
  from?: string;
  to?: string;
  onChange: (from?: string, to?: string) => void;
}

function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const presets = [
    { label: "Today", days: 0 },
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
    { label: "90d", days: 90 },
  ];

  const handlePreset = (days: number) => {
    const now = new Date();
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() - days);
    onChange(fromDate.toISOString().split("T")[0], now.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handlePreset(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={from || ""}
          onChange={(e) => onChange(e.target.value || undefined, to)}
          className="flex-1 h-9"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          value={to || ""}
          onChange={(e) => onChange(from, e.target.value || undefined)}
          className="flex-1 h-9"
        />
      </div>
    </div>
  );
}

// Salary range filter component
interface SalaryRangeFilterProps {
  min?: number;
  max?: number;
  onChange: (min?: number, max?: number) => void;
}

function SalaryRangeFilter({ min, max, onChange }: SalaryRangeFilterProps) {
  const formatSalary = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <label className="text-xs text-muted-foreground">Minimum</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            KES
          </span>
          <Input
            type="number"
            value={min || ""}
            onChange={(e) => onChange(parseInt(e.target.value) || undefined, max)}
            className="pl-12 h-9"
            placeholder="0"
          />
        </div>
      </div>
      <div className="flex-1">
        <label className="text-xs text-muted-foreground">Maximum</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            KES
          </span>
          <Input
            type="number"
            value={max || ""}
            onChange={(e) => onChange(min, parseInt(e.target.value) || undefined)}
            className="pl-12 h-9"
            placeholder="No limit"
          />
        </div>
      </div>
    </div>
  );
}

// Helper to format filter labels
function formatFilterLabel(key: string, value: string): string {
  const labels: Record<string, string> = {
    status: `Status: ${value}`,
    job_type: `Type: ${value.replace("_", " ")}`,
    experience_level: `Level: ${value}`,
    company_id: `Company`,
    location: `Location: ${value}`,
    date_from: `From: ${value}`,
    date_to: `To: ${value}`,
    salary_min: `Min salary`,
    salary_max: `Max salary`,
  };
  return labels[key] || `${key}: ${value}`;
}
