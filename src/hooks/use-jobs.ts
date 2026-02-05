/**
 * Jobs Hooks - Data fetching layer
 *
 * ARCHITECTURE:
 * - Hooks read filter/sort/pagination params from store
 * - Hooks pass ALL params to API (backend does filtering)
 * - React Query handles caching and state
 * - Store updates happen on successful queries only
 */

import { useCallback, useEffect, useRef } from "react";
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
import type { Job, PaginatedResponse } from "@/types";

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

  // Get current params from store using typed selectors
  const filters = useJobsStore(selectJobsFilters);
  const sort = useJobsStore(selectJobsSort);
  const pagination = useJobsStore(selectJobsPagination);

  // Store actions - get once to avoid re-renders
  const storeActions = useJobsStore((s: JobsState) => ({
    setJobs: s.setJobs,
    setLoading: s.setLoading,
    setError: s.setError,
  }));

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

  // Track previous data to avoid unnecessary updates
  const prevDataRef = useRef<PaginatedResponse<Job> | null>(null);

  // Sync query state with store - only when data actually changes
  useEffect(() => {
    if (query.data && query.data !== prevDataRef.current) {
      prevDataRef.current = query.data;
      storeActions.setJobs(query.data);
      storeActions.setLoading(false);
    }
  }, [query.data, storeActions]);

  useEffect(() => {
    if (query.isLoading) {
      storeActions.setLoading(true);
    }
  }, [query.isLoading, storeActions]);

  useEffect(() => {
    if (query.error) {
      storeActions.setError((query.error as Error).message);
      storeActions.setLoading(false);
    }
  }, [query.error, storeActions]);

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
  const setSelectedJob = useJobsStore((s: JobsState) => s.setSelectedJob);

  const query = useQuery({
    queryKey: jobsKeys.detail(id),
    queryFn: () => jobsService.getJob(id),
    enabled: !!id,
  });

  // Track previous data
  const prevDataRef = useRef<Job | null>(null);

  useEffect(() => {
    if (query.data && query.data !== prevDataRef.current) {
      prevDataRef.current = query.data;
      setSelectedJob(query.data);
    }
  }, [query.data, setSelectedJob]);

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
