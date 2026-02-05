/**
 * Companies Hooks - Data fetching layer
 *
 * ARCHITECTURE: API-driven, no client-side filtering
 * - Reads params from store using typed selectors
 * - Passes ALL params to API endpoints
 * - Updates store with API responses
 * - Mutations invalidate queries (refetch from API)
 */

import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useCompaniesStore,
  useToast,
  selectCompaniesFilters,
  selectCompaniesPagination,
  selectCompaniesSort,
  type CompaniesState,
  type CompanyFilters,
} from "@/stores";
import { companiesService } from "@/services";
import type { CreateCompanyInput, UpdateCompanyInput } from "@/types";

// ============================================
// Query Keys
// ============================================

export const companiesKeys = {
  all: ["companies"] as const,
  lists: () => [...companiesKeys.all, "list"] as const,
  list: (filters: CompanyFilters, page: number, pageSize: number) =>
    [...companiesKeys.lists(), { filters, page, pageSize }] as const,
  details: () => [...companiesKeys.all, "detail"] as const,
  detail: (id: string) => [...companiesKeys.details(), id] as const,
  active: () => [...companiesKeys.all, "active"] as const,
};

// ============================================
// List Hook - Fetches companies with current params
// ============================================

export function useCompanies() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get current params from store using typed selectors
  const filters = useCompaniesStore(selectCompaniesFilters);
  const sort = useCompaniesStore(selectCompaniesSort);
  const pagination = useCompaniesStore(selectCompaniesPagination);

  // Store actions (typed with CompaniesState)
  const setCompanies = useCompaniesStore((s: CompaniesState) => s.setCompanies);
  const setLoading = useCompaniesStore((s: CompaniesState) => s.setLoading);
  const setError = useCompaniesStore((s: CompaniesState) => s.setError);

  // Build API params from store state
  const apiParams = {
    ...filters,
    page: pagination.page,
    page_size: pagination.pageSize,
    sort_by: sort.field,
    sort_direction: sort.direction,
  };

  const query = useQuery({
    queryKey: companiesKeys.list(filters, pagination.page, pagination.pageSize),
    queryFn: () => companiesService.getCompanies(apiParams),
  });

  // Sync query state with store
  useEffect(() => {
    if (query.isLoading) {
      setLoading(true);
    }
    if (query.data) {
      setCompanies(query.data);
    }
    if (query.error) {
      setError((query.error as Error).message);
      toast.error("Failed to load companies", (query.error as Error).message);
    }
  }, [query.data, query.isLoading, query.error, setCompanies, setLoading, setError, toast]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: companiesKeys.lists() });
  }, [queryClient]);

  return {
    ...query,
    refetch,
  };
}

// ============================================
// Detail Hook - Fetches single company
// ============================================

export function useCompany(id: string) {
  const toast = useToast();
  const setSelectedCompany = useCompaniesStore((s: CompaniesState) => s.setSelectedCompany);

  const query = useQuery({
    queryKey: companiesKeys.detail(id),
    queryFn: () => companiesService.getCompany(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data) {
      setSelectedCompany(query.data);
    }
    if (query.error) {
      toast.error("Failed to load company", (query.error as Error).message);
    }
  }, [query.data, query.error, setSelectedCompany, toast]);

  return query;
}

// ============================================
// Active Companies Hook - For dropdowns
// ============================================

export function useActiveCompanies() {
  return useQuery({
    queryKey: companiesKeys.active(),
    queryFn: () => companiesService.getActiveCompanies(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// ============================================
// Mutation Hooks
// ============================================

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateCompanyInput) => companiesService.createCompany(data),
    onSuccess: () => {
      // Invalidate queries to refetch from API - single source of truth
      queryClient.invalidateQueries({ queryKey: companiesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companiesKeys.active() });
      toast.success("Company created", "The company has been added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create company", error.message);
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyInput }) =>
      companiesService.updateCompany(id, data),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch from API - single source of truth
      queryClient.invalidateQueries({ queryKey: companiesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companiesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: companiesKeys.active() });
      toast.success("Company updated", "The company has been updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update company", error.message);
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => companiesService.deleteCompany(id),
    onSuccess: () => {
      // Invalidate queries to refetch from API - single source of truth
      queryClient.invalidateQueries({ queryKey: companiesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companiesKeys.active() });
      toast.success("Company deleted", "The company has been removed");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete company", error.message);
    },
  });
}

export function useToggleCompanyActive() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      companiesService.toggleCompanyActive(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companiesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companiesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: companiesKeys.active() });
      toast.success(
        variables.isActive ? "Company activated" : "Company deactivated",
        variables.isActive ? "The company is now active" : "The company has been deactivated"
      );
    },
    onError: (error: Error) => {
      toast.error("Failed to update company status", error.message);
    },
  });
}
