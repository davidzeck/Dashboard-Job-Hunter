/**
 * Sources Store - API Response Cache + UI State
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
import type {
  JobSource,
  SourceFilters,
  SortConfig,
  PaginatedResponse,
  ScrapeLog,
} from "@/types";

// ============================================
// Types
// ============================================

export interface SourcesState {
  // API Response Data (from backend - READ ONLY, never modified client-side)
  sources: JobSource[];
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
  filters: SourceFilters;
  sort: SortConfig;

  // Selected source detail view
  selectedSource: JobSource | null;
  scrapeLogs: ScrapeLog[];

  // Actions - Data (called by hooks after API fetch)
  setSources: (response: PaginatedResponse<JobSource>) => void;
  setSelectedSource: (source: JobSource | null) => void;
  setScrapeLogs: (logs: ScrapeLog[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Params (trigger re-fetch via hook)
  setFilters: (filters: Partial<SourceFilters>) => void;
  setSort: (sort: SortConfig) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialFilters: SourceFilters = {
  search: undefined,
  company_id: undefined,
  source_type: undefined,
  scraper_status: undefined,
  is_active: undefined,
};

const initialSort: SortConfig = {
  field: "last_scraped_at",
  direction: "desc",
};

// ============================================
// Store
// ============================================

export const useSourcesStore = create<SourcesState>()(
  immer((set) => ({
    // Initial state - API data
    sources: [],
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

    // Detail view
    selectedSource: null,
    scrapeLogs: [],

    // Set API response (called by hook after fetch - ONLY way to update sources)
    setSources: (response) =>
      set((state) => {
        state.sources = response.items;
        state.pagination = {
          page: response.page,
          pageSize: response.page_size,
          total: response.total,
          totalPages: response.total_pages,
        };
        state.isLoading = false;
        state.error = null;
      }),

    // Set selected source for detail view
    setSelectedSource: (source) =>
      set((state) => {
        state.selectedSource = source;
      }),

    // Set scrape logs for selected source
    setScrapeLogs: (logs) =>
      set((state) => {
        state.scrapeLogs = logs;
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
        state.sources = [];
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
        state.selectedSource = null;
        state.scrapeLogs = [];
      }),
  }))
);

// ============================================
// Selectors (simple getters only - NO computation)
// ============================================

// Data selectors (from API response)
export const selectSources = (state: SourcesState) => state.sources;
export const selectSourcesPagination = (state: SourcesState) => state.pagination;
export const selectSelectedSource = (state: SourcesState) => state.selectedSource;
export const selectScrapeLogs = (state: SourcesState) => state.scrapeLogs;

// Request state selectors
export const selectSourcesLoading = (state: SourcesState) => state.isLoading;
export const selectSourcesError = (state: SourcesState) => state.error;

// Params selectors (for hook to use when fetching)
export const selectSourcesFilters = (state: SourcesState) => state.filters;
export const selectSourcesSort = (state: SourcesState) => state.sort;
