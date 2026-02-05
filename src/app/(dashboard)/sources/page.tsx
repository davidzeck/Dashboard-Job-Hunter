"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw, LayoutGrid, Table2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  SourceList,
  SourceTable,
  SourceFiltersBar,
} from "@/features/sources/components";
import { ViewToggle, type ViewMode } from "@/features/jobs/components";
import {
  useSources,
  useTriggerScrape,
  useUpdateSource,
  useDeleteSource,
} from "@/hooks";
import { useSourcesStore, useUIStore, useToast } from "@/stores";
import type { JobSource, SourceFilters, SortConfig } from "@/types";

export default function SourcesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isLoading, refetch } = useSources();

  // Store state
  const sources = useSourcesStore((state) => state.sources);
  const pagination = useSourcesStore((state) => state.pagination);
  const filters = useSourcesStore((state) => state.filters);
  const setFilters = useSourcesStore((state) => state.setFilters);
  const resetFilters = useSourcesStore((state) => state.resetFilters);
  const openModal = useUIStore((state) => state.openModal);

  // Local state
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [sort, setSort] = React.useState<SortConfig>({
    field: "company.name",
    direction: "asc",
  });
  const [scrapingSourceIds, setScrapingSourceIds] = React.useState<string[]>([]);

  // Hooks
  const triggerScrape = useTriggerScrape();
  const updateSource = useUpdateSource();
  const deleteSource = useDeleteSource();

  // Handle URL status filter
  React.useEffect(() => {
    const status = searchParams.get("status");
    if (status) {
      setFilters({ scraper_status: status as any });
    }
  }, [searchParams, setFilters]);

  // Calculate stats
  const activeCount = sources.filter((s) => s.scraper_status === "active").length;
  const errorCount = sources.filter((s) => s.scraper_status === "error").length;
  const totalJobs = sources.reduce((sum, s) => sum + s.jobs_found_count, 0);

  // Handlers
  const handleSourceClick = (source: JobSource) => {
    router.push(`/sources/${source.id}`);
  };

  const handleScrape = async (sourceId: string) => {
    setScrapingSourceIds((prev) => [...prev, sourceId]);
    toast.info("Scraping started", "Fetching jobs from source...");

    try {
      await triggerScrape.mutateAsync(sourceId);
      toast.success("Scrape complete", "Source has been scraped successfully");
    } catch (error) {
      toast.error("Scrape failed", "Failed to scrape source");
    } finally {
      setScrapingSourceIds((prev) => prev.filter((id) => id !== sourceId));
    }
  };

  const handleToggleActive = (sourceId: string, isActive: boolean) => {
    updateSource.mutate(
      { id: sourceId, data: { is_active: isActive } },
      {
        onSuccess: () => {
          toast.success(
            isActive ? "Source resumed" : "Source paused",
            isActive ? "Scraping has been resumed" : "Scraping has been paused"
          );
        },
      }
    );
  };

  const handleEdit = (source: JobSource) => {
    openModal("edit-source", { source });
  };

  const handleDelete = (sourceId: string) => {
    if (confirm("Are you sure you want to delete this source?")) {
      deleteSource.mutate(sourceId, {
        onSuccess: () => {
          toast.success("Source deleted", "The source has been removed");
        },
      });
    }
  };

  const handleAddNew = () => {
    openModal("add-source");
  };

  const handleFilterChange = (newFilters: Partial<SourceFilters>) => {
    setFilters(newFilters);
  };

  const handleScrapeAll = async () => {
    const activeSources = sources.filter((s) => s.is_active);
    toast.info("Scraping all sources", `Starting scrape for ${activeSources.length} sources...`);
    // Implement bulk scrape logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Job Sources"
        description={`${pagination.total} sources configured | ${activeCount} active | ${totalJobs} jobs found`}
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border rounded-lg bg-muted/50 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${
                  viewMode === "grid" ? "bg-background shadow-sm" : ""
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded ${
                  viewMode === "table" ? "bg-background shadow-sm" : ""
                }`}
              >
                <Table2 className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>
        }
      />

      {/* Error banner if any sources have errors */}
      {errorCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-destructive font-medium">
              {errorCount} source{errorCount > 1 ? "s" : ""} with errors
            </span>
            <span className="text-sm text-muted-foreground">
              Click to view and fix issues
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ scraper_status: "error" })}
          >
            View Errors
          </Button>
        </motion.div>
      )}

      {/* Filters */}
      <SourceFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Source List/Table */}
      {viewMode === "table" ? (
        <SourceTable
          sources={sources}
          isLoading={isLoading}
          scrapingSourceIds={scrapingSourceIds}
          sort={sort}
          onSort={setSort}
          onSourceClick={handleSourceClick}
          onScrape={handleScrape}
          onToggleActive={handleToggleActive}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <SourceList
          sources={sources}
          isLoading={isLoading}
          onSourceClick={handleSourceClick}
          onScrape={handleScrape}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
        />
      )}
    </div>
  );
}
