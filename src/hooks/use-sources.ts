/**
 * Custom hooks for sources data management
 *
 * ARCHITECTURE: API-driven, no client-side filtering
 * - Reads params from store using typed selectors
 * - Passes all params to API endpoints
 * - Updates store with API responses
 * - Mutations invalidate queries (refetch from API)
 */

import { useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSourcesStore,
  useToast,
  selectSourcesFilters,
  selectSourcesPagination,
  selectSourcesSort,
  type SourcesState,
} from "@/stores";
import { sourcesService } from "@/services";
import type { SourceFilters, CreateJobSourceInput, UpdateJobSourceInput, JobSource, PaginatedResponse } from "@/types";

// Query keys
export const sourcesKeys = {
  all: ["sources"] as const,
  lists: () => [...sourcesKeys.all, "list"] as const,
  list: (filters: SourceFilters, page: number, pageSize: number) =>
    [...sourcesKeys.lists(), { filters, page, pageSize }] as const,
  details: () => [...sourcesKeys.all, "detail"] as const,
  detail: (id: string) => [...sourcesKeys.details(), id] as const,
  logs: (sourceId: string) => [...sourcesKeys.all, "logs", sourceId] as const,
  errors: () => [...sourcesKeys.all, "errors"] as const,
  byCompany: (companyId: string) => [...sourcesKeys.all, "company", companyId] as const,
};

/**
 * Hook for fetching paginated sources with filters
 * All filtering/sorting done by API - store just holds params and results
 */
export function useSources() {
  const queryClient = useQueryClient();

  // Get current params from store using typed selectors
  const filters = useSourcesStore(selectSourcesFilters);
  const sort = useSourcesStore(selectSourcesSort);
  const pagination = useSourcesStore(selectSourcesPagination);

  // Store actions - get once to avoid re-renders
  const storeActions = useSourcesStore((s: SourcesState) => ({
    setSources: s.setSources,
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
    queryKey: sourcesKeys.list(filters, pagination.page, pagination.pageSize),
    queryFn: () => sourcesService.getSources(apiParams),
  });

  // Track previous data to avoid unnecessary updates
  const prevDataRef = useRef<PaginatedResponse<JobSource> | null>(null);

  useEffect(() => {
    if (query.data && query.data !== prevDataRef.current) {
      prevDataRef.current = query.data;
      storeActions.setSources(query.data);
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
    queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
  }, [queryClient]);

  return {
    ...query,
    refetch,
  };
}

/**
 * Hook for fetching a single source
 */
export function useSource(id: string) {
  const setSelectedSource = useSourcesStore((s: SourcesState) => s.setSelectedSource);
  const prevDataRef = useRef<JobSource | null>(null);

  const query = useQuery({
    queryKey: sourcesKeys.detail(id),
    queryFn: () => sourcesService.getSource(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data && query.data !== prevDataRef.current) {
      prevDataRef.current = query.data;
      setSelectedSource(query.data);
    }
  }, [query.data, setSelectedSource]);

  return query;
}

/**
 * Hook for creating a new source
 * After success, invalidates queries to refetch from API (no client-side modification)
 */
export function useCreateSource() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateJobSourceInput) => sourcesService.createSource(data),
    onSuccess: () => {
      // Invalidate queries to refetch from API - single source of truth
      queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
      toast.success("Source created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create source", error.message);
    },
  });
}

/**
 * Hook for updating a source
 * After success, invalidates queries to refetch from API (no client-side modification)
 */
export function useUpdateSource() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobSourceInput }) =>
      sourcesService.updateSource(id, data),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch from API - single source of truth
      queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sourcesKeys.detail(variables.id) });
      toast.success("Source updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update source", error.message);
    },
  });
}

/**
 * Hook for deleting a source
 * After success, invalidates queries to refetch from API (no client-side modification)
 */
export function useDeleteSource() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => sourcesService.deleteSource(id),
    onSuccess: () => {
      // Invalidate queries to refetch from API - single source of truth
      queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
      toast.success("Source deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete source", error.message);
    },
  });
}

/**
 * Hook for triggering manual scrape
 */
export function useTriggerScrape() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => sourcesService.triggerScrape(id),
    onSuccess: (data) => {
      toast.success("Scrape started", data.task_id ? `Task ID: ${data.task_id}` : "Processing...");
      // Invalidate logs after a delay to show new log
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: sourcesKeys.all });
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error("Failed to start scrape", error.message);
    },
  });
}

/**
 * Hook for fetching scrape logs
 */
export function useScrapeLogs(sourceId: string) {
  const setScrapeLogs = useSourcesStore((s: SourcesState) => s.setScrapeLogs);

  const query = useQuery({
    queryKey: sourcesKeys.logs(sourceId),
    queryFn: () => sourcesService.getScrapeLogs(sourceId),
    enabled: !!sourceId,
  });

  useEffect(() => {
    if (query.data) {
      setScrapeLogs(query.data.items);
    }
  }, [query.data, setScrapeLogs]);

  return query;
}

/**
 * Hook for fetching error sources
 */
export function useErrorSources() {
  return useQuery({
    queryKey: sourcesKeys.errors(),
    queryFn: () => sourcesService.getErrorSources(),
    refetchInterval: 60000, // Refresh every minute
  });
}
