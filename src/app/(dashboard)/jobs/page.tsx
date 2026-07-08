"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RefreshCw,
  Download,
  Share2,
  Trash2,
  MoreHorizontal,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout";
import { Button, Badge } from "@/components/ui";
import {
  JobFiltersBar,
  JobList,
  Pagination,
  ViewToggle,
  type ViewMode,
} from "@/features/jobs/components";
import { useJobs, useToggleSaveJob } from "@/hooks";
import { useJobsStore, useUIStore, useToast } from "@/stores";
import type { Job, JobFilters, SortConfig } from "@/types";

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isLoading, refetch } = useJobs();
  const saveJob = useToggleSaveJob();

  // Store state
  const jobs = useJobsStore((state) => state.jobs);
  const filters = useJobsStore((state) => state.filters);
  const pagination = useJobsStore((state) => state.pagination);
  const sort = useJobsStore((state) => state.sort);
  const setFilters = useJobsStore((state) => state.setFilters);
  const resetFilters = useJobsStore((state) => state.resetFilters);
  const setPage = useJobsStore((state) => state.setPage);
  const setPageSize = useJobsStore((state) => state.setPageSize);
  const setSort = useJobsStore((state) => state.setSort);

  // Local state
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [selectedJobs, setSelectedJobs] = React.useState<string[]>([]);
  // Saved state is server-driven — derive from the jobs' persisted `saved` flag
  const savedJobs = React.useMemo(
    () => jobs.filter((j) => j.saved).map((j) => j.id),
    [jobs]
  );

  // Selection handlers
  const handleSelectJob = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map((j) => j.id));
    }
  };

  const clearSelection = () => {
    setSelectedJobs([]);
  };

  // "New (24h)" vs "All" segmented toggle — drives the backend days_ago filter
  const isNewOnly = filters.days_ago === 1;
  const showNewOnly = () => {
    setFilters({ days_ago: 1 });
    setPage(1);
  };
  const showAll = () => {
    setFilters({ days_ago: undefined });
    setPage(1);
  };

  // Deep link from the Overview "New Jobs" card: /jobs?new=1 lands pre-filtered.
  const appliedNewParam = React.useRef(false);
  React.useEffect(() => {
    if (!appliedNewParam.current && searchParams.get("new") === "1") {
      appliedNewParam.current = true;
      setFilters({ days_ago: 1 });
    }
  }, [searchParams, setFilters]);

  // Job actions
  const handleJobClick = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleSaveJob = (job: Job) => {
    // Toggle persisted saved state; toast + refetch handled by the mutation
    saveJob.mutate({ id: job.id, saved: !job.saved });
  };

  const handleShareJob = (job: Job) => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied", "Job link copied to clipboard");
  };

  const handleApplyJob = (job: Job) => {
    window.open(job.application_url, "_blank");
  };

  const handleFilterChange = (newFilters: Partial<JobFilters>) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortConfig) => {
    setSort(newSort);
  };

  // Bulk actions
  const handleBulkExport = () => {
    toast.info("Exporting jobs", `Exporting ${selectedJobs.length} jobs to CSV...`);
    // Implement export logic
    clearSelection();
  };

  const handleBulkSave = () => {
    selectedJobs.forEach((id) => saveJob.mutate({ id, saved: true }));
    toast.success("Jobs saved", `${selectedJobs.length} jobs added to saved list`);
    clearSelection();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Jobs"
        description={
          isNewOnly
            ? `${pagination.total} new in the last 24 hours`
            : `${pagination.total} jobs discovered from all sources`
        }
        actions={
          <div className="flex items-center gap-2">
            {/* All | New (24h) segmented toggle */}
            <div className="inline-flex items-center rounded-md border border-border p-0.5">
              <Button
                variant={isNewOnly ? "ghost" : "secondary"}
                size="sm"
                className="h-7"
                onClick={showAll}
              >
                All
              </Button>
              <Button
                variant={isNewOnly ? "secondary" : "ghost"}
                size="sm"
                className="h-7 gap-1.5"
                onClick={showNewOnly}
              >
                <Sparkles className="h-3.5 w-3.5" />
                New (24h)
              </Button>
            </div>
            <ViewToggle value={viewMode} onChange={setViewMode} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Badge variant="default" className="h-6">
                {selectedJobs.length} selected
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkSave}>
                <CheckSquare className="h-4 w-4 mr-1" />
                Save All
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <JobFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Job List */}
      <JobList
        jobs={jobs}
        isLoading={isLoading}
        viewMode={viewMode}
        selectedJobs={selectedJobs}
        savedJobs={savedJobs}
        onJobClick={handleJobClick}
        onApply={handleApplyJob}
        onSave={handleSaveJob}
        onShare={handleShareJob}
        onSelect={handleSelectJob}
        onSelectAll={handleSelectAll}
        sort={sort}
        onSort={handleSortChange}
      />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        totalItems={pagination.total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
