"use client";

import * as React from "react";
import { RotateCcw, Building2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, SearchInput, Badge } from "@/components/ui";
import type { CompanyFilters } from "@/stores";

interface CompanyFiltersBarProps {
  filters: CompanyFilters;
  onFilterChange: (filters: Partial<CompanyFilters>) => void;
  onReset: () => void;
  className?: string;
}

export function CompanyFiltersBar({
  filters,
  onFilterChange,
  onReset,
  className,
}: CompanyFiltersBarProps) {
  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== undefined && value !== "" && key !== "search"
  ).length;

  // Handle search with debounce
  const [searchValue, setSearchValue] = React.useState(filters.search || "");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ search: searchValue || undefined });
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
            placeholder="Search companies by name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => {
              setSearchValue("");
              onFilterChange({ search: undefined });
            }}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filters.is_active === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ is_active: undefined })}
          >
            <Building2 className="h-4 w-4 mr-1.5" />
            All
          </Button>
          <Button
            variant={filters.is_active === true ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ is_active: true })}
          >
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Active
          </Button>
          <Button
            variant={filters.is_active === false ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ is_active: false })}
          >
            <XCircle className="h-4 w-4 mr-1.5" />
            Inactive
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

      {/* Active filters tags */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.is_active !== undefined && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => onFilterChange({ is_active: undefined })}
            >
              Status: {filters.is_active ? "Active" : "Inactive"}
              <XCircle className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
