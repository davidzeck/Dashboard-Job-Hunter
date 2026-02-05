"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Download,
  Share2,
  Trash2,
  MoreHorizontal,
  CheckSquare,
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
import { useJobs } from "@/hooks";
import { useJobsStore, useUIStore, useToast } from "@/stores";
import type { Job, JobFilters, SortConfig } from "@/types";

export default function JobsPage() {
  const router = useRouter();
  const toast = useToast();
  const { isLoading, refetch } = useJobs();

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
  const [savedJobs, setSavedJobs] = React.useState<string[]>([]);

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

  // Job actions
  const handleJobClick = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleSaveJob = (job: Job) => {
    const isSaved = savedJobs.includes(job.id);
    setSavedJobs((prev) =>
      prev.includes(job.id)
        ? prev.filter((id) => id !== job.id)
        : [...prev, job.id]
    );
    toast.success(
      isSaved ? "Job removed" : "Job saved",
      isSaved
        ? "Job removed from saved list"
        : "Job added to your saved list"
    );
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
    setSavedJobs((prev) => [...new Set([...prev, ...selectedJobs])]);
    toast.success("Jobs saved", `${selectedJobs.length} jobs added to saved list`);
    clearSelection();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Jobs"
        description={`${pagination.total} jobs discovered from all sources`}
        actions={
          <div className="flex items-center gap-2">
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
