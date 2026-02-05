"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatSalary } from "@/lib/utils";
import {
  EmptyState,
  Button,
  Badge,
  CompanyAvatar,
  Skeleton,
} from "@/components/ui";
import { JobCard, JobCardSkeleton } from "./job-card";
import type { ViewMode } from "./view-toggle";
import type { Job, SortConfig, SortDirection } from "@/types";

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  viewMode?: ViewMode;
  selectedJobs?: string[];
  savedJobs?: string[];
  onJobClick?: (job: Job) => void;
  onApply?: (job: Job) => void;
  onSave?: (job: Job) => void;
  onShare?: (job: Job) => void;
  onSelect?: (jobId: string) => void;
  onSelectAll?: () => void;
  sort?: SortConfig;
  onSort?: (sort: SortConfig) => void;
  className?: string;
}

export function JobList({
  jobs,
  isLoading,
  viewMode = "grid",
  selectedJobs = [],
  savedJobs = [],
  onJobClick,
  onApply,
  onSave,
  onShare,
  onSelect,
  onSelectAll,
  sort,
  onSort,
  className,
}: JobListProps) {
  if (isLoading) {
    return <JobListSkeleton viewMode={viewMode} />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No jobs found"
        description="Try adjusting your filters or check back later for new opportunities."
        className={className}
      />
    );
  }

  // Table view
  if (viewMode === "table") {
    return (
      <JobTable
        jobs={jobs}
        selectedJobs={selectedJobs}
        savedJobs={savedJobs}
        onJobClick={onJobClick}
        onApply={onApply}
        onSave={onSave}
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        sort={sort}
        onSort={onSort}
        className={className}
      />
    );
  }

  // List view
  if (viewMode === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        <AnimatePresence mode="popLayout">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <JobListItem
                job={job}
                isSelected={selectedJobs.includes(job.id)}
                isSaved={savedJobs.includes(job.id)}
                onClick={() => onJobClick?.(job)}
                onApply={() => onApply?.(job) ?? window.open(job.application_url, "_blank")}
                onSave={() => onSave?.(job)}
                onShare={() => onShare?.(job)}
                onSelect={() => onSelect?.(job.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      <AnimatePresence mode="popLayout">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <JobCard
              job={job}
              onClick={() => onJobClick?.(job)}
              onApply={() => onApply?.(job) ?? window.open(job.application_url, "_blank")}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// List item component for list view
interface JobListItemProps {
  job: Job;
  isSelected?: boolean;
  isSaved?: boolean;
  onClick?: () => void;
  onApply?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onSelect?: () => void;
}

function JobListItem({
  job,
  isSelected,
  isSaved,
  onClick,
  onApply,
  onSave,
  onShare,
  onSelect,
}: JobListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border rounded-lg bg-card cursor-pointer",
        "hover:shadow-sm hover:border-primary/30 transition-all",
        isSelected && "ring-2 ring-primary border-primary",
        job.status === "new" && "border-l-4 border-l-urgent"
      )}
      onClick={onClick}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            "h-5 w-5 rounded border flex items-center justify-center shrink-0",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-input hover:border-primary"
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>
      )}

      <CompanyAvatar
        name={job.company?.name || "Company"}
        logoUrl={job.company?.logo_url}
        size="md"
      />

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center">
        {/* Title & Company */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{job.title}</h3>
            {job.status === "new" && (
              <Badge variant="urgent" className="text-xs">New</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {job.company?.name || "Unknown Company"}
          </p>
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 shrink-0" />
              {formatJobType(job.job_type)}
            </span>
          )}
        </div>

        {/* Salary & Timing */}
        <div className="flex flex-col gap-1">
          {(job.salary_min || job.salary_max) && (
            <span className="text-sm font-medium text-success">
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </span>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(job.first_seen_at)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.();
            }}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApply?.();
            }}
          >
            Apply
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Table view component
interface JobTableProps {
  jobs: Job[];
  selectedJobs: string[];
  savedJobs: string[];
  onJobClick?: (job: Job) => void;
  onApply?: (job: Job) => void;
  onSave?: (job: Job) => void;
  onSelect?: (jobId: string) => void;
  onSelectAll?: () => void;
  sort?: SortConfig;
  onSort?: (sort: SortConfig) => void;
  className?: string;
}

function JobTable({
  jobs,
  selectedJobs,
  savedJobs,
  onJobClick,
  onApply,
  onSave,
  onSelect,
  onSelectAll,
  sort,
  onSort,
  className,
}: JobTableProps) {
  const allSelected = jobs.length > 0 && selectedJobs.length === jobs.length;
  const someSelected = selectedJobs.length > 0 && selectedJobs.length < jobs.length;

  const handleSort = (field: string) => {
    if (!onSort) return;
    const direction: SortDirection =
      sort?.field === field && sort?.direction === "asc" ? "desc" : "asc";
    onSort({ field, direction });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort?.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {onSelect && (
                <th className="w-12 p-3">
                  <button
                    onClick={onSelectAll}
                    className={cn(
                      "h-5 w-5 rounded border flex items-center justify-center",
                      allSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : someSelected
                        ? "bg-primary/50 border-primary"
                        : "border-input hover:border-primary"
                    )}
                  >
                    {allSelected && <Check className="h-3 w-3" />}
                    {someSelected && <div className="h-2 w-2 bg-primary-foreground rounded-sm" />}
                  </button>
                </th>
              )}
              <th className="text-left p-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                  onClick={() => handleSort("title")}
                >
                  Job
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="text-left p-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                  onClick={() => handleSort("company")}
                >
                  Company
                  <SortIcon field="company" />
                </button>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium">Location</span>
              </th>
              <th className="text-left p-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                  onClick={() => handleSort("salary_min")}
                >
                  Salary
                  <SortIcon field="salary_min" />
                </button>
              </th>
              <th className="text-left p-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                  onClick={() => handleSort("first_seen_at")}
                >
                  Posted
                  <SortIcon field="first_seen_at" />
                </button>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium">Status</span>
              </th>
              <th className="w-24 p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className={cn(
                  "hover:bg-muted/30 cursor-pointer transition-colors",
                  selectedJobs.includes(job.id) && "bg-primary/5"
                )}
                onClick={() => onJobClick?.(job)}
              >
                {onSelect && (
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(job.id);
                      }}
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center",
                        selectedJobs.includes(job.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input hover:border-primary"
                      )}
                    >
                      {selectedJobs.includes(job.id) && <Check className="h-3 w-3" />}
                    </button>
                  </td>
                )}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate max-w-[200px]">{job.title}</span>
                    {job.status === "new" && (
                      <Badge variant="urgent" className="text-[10px] px-1.5">New</Badge>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <CompanyAvatar
                      name={job.company?.name || "Company"}
                      logoUrl={job.company?.logo_url}
                      size="sm"
                    />
                    <span className="text-sm truncate max-w-[150px]">
                      {job.company?.name || "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {job.location || "-"}
                </td>
                <td className="p-3 text-sm">
                  {(job.salary_min || job.salary_max) ? (
                    <span className="text-success font-medium">
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {formatRelativeTime(job.first_seen_at)}
                </td>
                <td className="p-3">
                  <StatusBadge status={job.status} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSave?.(job);
                      }}
                    >
                      {savedJobs.includes(job.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply?.(job) ?? window.open(job.application_url, "_blank");
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: Job["status"] }) {
  const variants: Record<Job["status"], { label: string; className: string }> = {
    new: { label: "New", className: "bg-urgent/10 text-urgent" },
    active: { label: "Active", className: "bg-success/10 text-success" },
    expired: { label: "Expired", className: "bg-warning/10 text-warning" },
    filled: { label: "Filled", className: "bg-muted text-muted-foreground" },
  };

  const { label, className } = variants[status];
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", className)}>
      {label}
    </span>
  );
}

// Skeleton loaders
function JobListSkeleton({ viewMode = "grid" }: { viewMode?: ViewMode }) {
  if (viewMode === "table") {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 border-b p-3 flex gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3 flex gap-4 border-b last:border-b-0">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-20" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Pagination component
interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function Pagination({
  page,
  totalPages,
  pageSize = 20,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = React.useMemo(() => {
    const range = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }, [page, totalPages]);

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems || page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Items info */}
      {totalItems && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> jobs
        </p>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages[0] > 1 && (
          <>
            <Button
              variant={page === 1 ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {pages[0] > 2 && (
              <span className="px-1 text-muted-foreground">...</span>
            )}
          </>
        )}

        {pages.map((p) => (
          <Button
            key={p}
            variant={page === p ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-muted-foreground">...</span>
            )}
            <Button
              variant={page === totalPages ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page size selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatJobType(type: string): string {
  const labels: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    internship: "Internship",
    remote: "Remote",
  };
  return labels[type] || type;
}
