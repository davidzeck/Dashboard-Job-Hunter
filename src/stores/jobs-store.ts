/**
 * Jobs Store - API Response Cache + UI State
 *
 * ARCHITECTURE PRINCIPLES:
 * - Store holds API responses (single source of truth from backend)
 * - Store holds UI state (filter params, pagination params, sort params)
 * - NO client-side filtering - all filtering done by backend
 * - Components just display what's in the store
 * - Hooks fetch data and populate store
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Job, JobFilters, SortConfig, PaginatedResponse } from "@/types";

// ============================================
// Types (exported for use in hooks)
// ============================================

export interface JobsState {
  // API Response Data (from backend - READ ONLY, never modified client-side)
  jobs: Job[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // Request State
  isLoading: boolean;
  error: string | null;

  // UI State (parameters to send to API)
  filters: JobFilters;
  sort: SortConfig;

  // Selected item (for detail view)
  selectedJob: Job | null;

  // Actions - Data (called by hooks after API fetch)
  setJobs: (response: PaginatedResponse<Job>) => void;
  setSelectedJob: (job: Job | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Params (trigger re-fetch via hook)
  setFilters: (filters: Partial<JobFilters>) => void;
  setSort: (sort: SortConfig) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialFilters: JobFilters = {
  search: undefined,
  company_id: undefined,
  source_id: undefined,
  status: undefined,
  experience_level: undefined,
  job_type: undefined,
  location: undefined,
  date_from: undefined,
  date_to: undefined,
};

const initialSort: SortConfig = {
  field: "first_seen_at",
  direction: "desc",
};

// ============================================
// Store
// ============================================

export const useJobsStore = create<JobsState>()(
  immer((set) => ({
    // Initial state - API data
    jobs: [],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },

    // Request state
    isLoading: false,
    error: null,

    // UI state - params for API
    filters: initialFilters,
    sort: initialSort,

    // Selected job
    selectedJob: null,

    // Set API response (called by hook after fetch - ONLY way to update jobs)
    setJobs: (response) =>
      set((state) => {
        state.jobs = response.items;
        state.pagination = {
          page: response.page,
          pageSize: response.page_size,
          total: response.total,
          totalPages: response.total_pages,
        };
        state.isLoading = false;
        state.error = null;
      }),

    // Set selected job for detail view
    setSelectedJob: (job) =>
      set((state) => {
        state.selectedJob = job;
      }),

    // Set loading state
    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),

    // Set error state
    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    // Update filters (resets page to 1, triggers re-fetch via hook)
    setFilters: (filters) =>
      set((state) => {
        state.filters = { ...state.filters, ...filters };
        state.pagination.page = 1;
      }),

    // Update sort (resets page to 1, triggers re-fetch via hook)
    setSort: (sort) =>
      set((state) => {
        state.sort = sort;
        state.pagination.page = 1;
      }),

    // Update page (triggers re-fetch via hook)
    setPage: (page) =>
      set((state) => {
        state.pagination.page = page;
      }),

    // Update page size (resets page to 1, triggers re-fetch via hook)
    setPageSize: (pageSize) =>
      set((state) => {
        state.pagination.pageSize = pageSize;
        state.pagination.page = 1;
      }),

    // Reset filters to initial values
    resetFilters: () =>
      set((state) => {
        state.filters = initialFilters;
        state.pagination.page = 1;
      }),

    // Reset entire store
    reset: () =>
      set((state) => {
        state.jobs = [];
        state.pagination = {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
        };
        state.isLoading = false;
        state.error = null;
        state.filters = initialFilters;
        state.sort = initialSort;
        state.selectedJob = null;
      }),
  }))
);

// ============================================
// Selectors (simple getters only - NO computation)
// ============================================

// Data selectors (from API response)
export const selectJobs = (state: JobsState) => state.jobs;
export const selectJobsPagination = (state: JobsState) => state.pagination;
export const selectSelectedJob = (state: JobsState) => state.selectedJob;

// Request state selectors
export const selectJobsLoading = (state: JobsState) => state.isLoading;
export const selectJobsError = (state: JobsState) => state.error;

// Params selectors (for hook to use when fetching)
export const selectJobsFilters = (state: JobsState) => state.filters;
export const selectJobsSort = (state: JobsState) => state.sort;
