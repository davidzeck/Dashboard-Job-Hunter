/**
 * Companies Service - Company related API calls
 * Supports demo mode with mock data
 */

import { apiClient } from "./api-client";
import { isDemoMode, mockCompaniesService } from "./mock-api-service";
import type {
  Company,
  PaginatedResponse,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "@/types";

interface GetCompaniesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export const companiesService = {
  /**
   * Get paginated list of companies
   */
  async getCompanies(
    params: GetCompaniesParams = {}
  ): Promise<PaginatedResponse<Company>> {
    if (isDemoMode()) {
      return mockCompaniesService.getCompanies(params);
    }

    return apiClient.get<PaginatedResponse<Company>>("/companies", {
      page: params.page || 1,
      page_size: params.page_size || 20,
      search: params.search,
      is_active: params.is_active,
      sort_by: params.sort_by || "name",
      sort_direction: params.sort_direction || "asc",
    });
  },

  /**
   * Get a single company by ID
   */
  async getCompany(id: string): Promise<Company> {
    if (isDemoMode()) {
      return mockCompaniesService.getCompany(id);
    }
    return apiClient.get<Company>(`/companies/${id}`);
  },

  /**
   * Create a new company
   */
  async createCompany(data: CreateCompanyInput): Promise<Company> {
    if (isDemoMode()) {
      return mockCompaniesService.createCompany(data);
    }
    return apiClient.post<Company>("/companies", data);
  },

  /**
   * Update a company
   */
  async updateCompany(
    id: string,
    data: UpdateCompanyInput
  ): Promise<Company> {
    if (isDemoMode()) {
      return mockCompaniesService.updateCompany(id, data);
    }
    return apiClient.patch<Company>(`/companies/${id}`, data);
  },

  /**
   * Delete a company
   */
  async deleteCompany(id: string): Promise<void> {
    if (isDemoMode()) {
      return mockCompaniesService.deleteCompany(id);
    }
    return apiClient.delete(`/companies/${id}`);
  },

  /**
   * Toggle company active status
   */
  async toggleCompanyActive(id: string, isActive: boolean): Promise<Company> {
    if (isDemoMode()) {
      return mockCompaniesService.toggleCompanyActive(id, isActive);
    }
    return apiClient.patch<Company>(`/companies/${id}`, { is_active: isActive });
  },

  /**
   * Get all active companies (for dropdowns)
   */
  async getActiveCompanies(): Promise<Company[]> {
    if (isDemoMode()) {
      return mockCompaniesService.getActiveCompanies();
    }

    const response = await apiClient.get<PaginatedResponse<Company>>(
      "/companies",
      {
        is_active: true,
        page_size: 100,
        sort_by: "name",
        sort_direction: "asc",
      }
    );
    return response.items;
  },
};
