/**
 * Companies Store - API Response Cache + UI State
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
import type { Company, SortConfig, PaginatedResponse } from "@/types";

// ============================================
// Types (exported for use in hooks)
// ============================================

export interface CompanyFilters {
  search?: string;
  is_active?: boolean;
}

export interface CompaniesState {
  // API Response Data (from backend - READ ONLY, never modified client-side)
  companies: Company[];
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
  filters: CompanyFilters;
  sort: SortConfig;

  // Selected item (for detail view)
  selectedCompany: Company | null;

  // Actions - Data (called by hooks after API fetch)
  setCompanies: (response: PaginatedResponse<Company>) => void;
  setSelectedCompany: (company: Company | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Params (trigger re-fetch via hook)
  setFilters: (filters: Partial<CompanyFilters>) => void;
  setSort: (sort: SortConfig) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialFilters: CompanyFilters = {
  search: undefined,
  is_active: undefined,
};

const initialSort: SortConfig = {
  field: "name",
  direction: "asc",
};

// ============================================
// Store
// ============================================

export const useCompaniesStore = create<CompaniesState>()(
  immer((set) => ({
    // Initial state - API data
    companies: [],
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

    // Selected company
    selectedCompany: null,

    // Set API response (called by hook after fetch - ONLY way to update companies)
    setCompanies: (response) =>
      set((state) => {
        state.companies = response.items;
        state.pagination = {
          page: response.page,
          pageSize: response.page_size,
          total: response.total,
          totalPages: response.total_pages,
        };
        state.isLoading = false;
        state.error = null;
      }),

    // Set selected company for detail view
    setSelectedCompany: (company) =>
      set((state) => {
        state.selectedCompany = company;
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
        state.companies = [];
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
        state.selectedCompany = null;
      }),
  }))
);

// ============================================
// Selectors (simple getters only - NO computation)
// ============================================

// Data selectors (from API response)
export const selectCompanies = (state: CompaniesState) => state.companies;
export const selectCompaniesPagination = (state: CompaniesState) => state.pagination;
export const selectSelectedCompany = (state: CompaniesState) => state.selectedCompany;

// Request state selectors
export const selectCompaniesLoading = (state: CompaniesState) => state.isLoading;
export const selectCompaniesError = (state: CompaniesState) => state.error;

// Params selectors (for hook to use when fetching)
export const selectCompaniesFilters = (state: CompaniesState) => state.filters;
export const selectCompaniesSort = (state: CompaniesState) => state.sort;
