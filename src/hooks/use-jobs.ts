/**
 * Jobs Hooks - Data fetching layer
 *
 * ARCHITECTURE:
 * - Hooks read filter/sort/pagination params from store
 * - Hooks pass ALL params to API (backend does filtering)
 * - Hooks write API response back to store
 * - React Query handles caching and re-fetching
 */

import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useJobsStore,
  useToast,
  selectJobsFilters,
  selectJobsSort,
  selectJobsPagination,
  type JobsState,
} from "@/stores";
import { jobsService } from "@/services";
import type { Job } from "@/types";

// ============================================
// Query Keys
// ============================================

export const jobsKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobsKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...jobsKeys.lists(), params] as const,
  details: () => [...jobsKeys.all, "detail"] as const,
  detail: (id: string) => [...jobsKeys.details(), id] as const,
  stats: () => [...jobsKeys.all, "stats"] as const,
};

// ============================================
// List Hook - Fetches jobs with current params
// ============================================

export function useJobs() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get current params from store using typed selectors
  const filters = useJobsStore(selectJobsFilters);
  const sort = useJobsStore(selectJobsSort);
  const pagination = useJobsStore(selectJobsPagination);

  // Store actions (typed with JobsState)
  const setJobs = useJobsStore((s: JobsState) => s.setJobs);
  const setLoading = useJobsStore((s: JobsState) => s.setLoading);
  const setError = useJobsStore((s: JobsState) => s.setError);

  // Build API params from store state
  const apiParams = {
    ...filters,
    page: pagination.page,
    page_size: pagination.pageSize,
    sort_by: sort.field,
    sort_direction: sort.direction,
  };

  const query = useQuery({
    queryKey: jobsKeys.list(apiParams),
    queryFn: () => jobsService.getJobs(apiParams),
  });

  // Sync query state with store
  useEffect(() => {
    if (query.isLoading) {
      setLoading(true);
    }
    if (query.data) {
      setJobs(query.data);
    }
    if (query.error) {
      setError((query.error as Error).message);
      toast.error("Failed to load jobs", (query.error as Error).message);
    }
  }, [query.data, query.isLoading, query.error, setJobs, setLoading, setError, toast]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
  }, [queryClient]);

  return {
    ...query,
    refetch,
  };
}

// ============================================
// Detail Hook - Fetches single job
// ============================================

export function useJob(id: string) {
  const toast = useToast();
  const setSelectedJob = useJobsStore((s: JobsState) => s.setSelectedJob);

  const query = useQuery({
    queryKey: jobsKeys.detail(id),
    queryFn: () => jobsService.getJob(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data) {
      setSelectedJob(query.data);
    }
    if (query.error) {
      toast.error("Failed to load job", (query.error as Error).message);
    }
  }, [query.data, query.error, setSelectedJob, toast]);

  return query;
}

// ============================================
// Mutation Hooks
// ============================================

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Job["status"] }) =>
      jobsService.updateJobStatus(id, status),
    onSuccess: () => {
      // Invalidate list to refetch from API (single source of truth)
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
      toast.success("Job status updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update job", error.message);
    },
  });
}

// ============================================
// Utility Hooks
// ============================================

export function useNewJobs(limit: number = 10) {
  return useQuery({
    queryKey: [...jobsKeys.all, "new", limit],
    queryFn: () => jobsService.getNewJobs(limit),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: jobsKeys.stats(),
    queryFn: () => jobsService.getDashboardStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
