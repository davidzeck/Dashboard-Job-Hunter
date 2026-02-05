/**
 * Companies Service - Company related API calls
 */

import { apiClient } from "./api-client";
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
    return apiClient.get<Company>(`/companies/${id}`);
  },

  /**
   * Create a new company
   */
  async createCompany(data: CreateCompanyInput): Promise<Company> {
    return apiClient.post<Company>("/companies", data);
  },

  /**
   * Update a company
   */
  async updateCompany(
    id: string,
    data: UpdateCompanyInput
  ): Promise<Company> {
    return apiClient.patch<Company>(`/companies/${id}`, data);
  },

  /**
   * Delete a company
   */
  async deleteCompany(id: string): Promise<void> {
    return apiClient.delete(`/companies/${id}`);
  },

  /**
   * Toggle company active status
   */
  async toggleCompanyActive(id: string, isActive: boolean): Promise<Company> {
    return apiClient.patch<Company>(`/companies/${id}`, { is_active: isActive });
  },

  /**
   * Get all active companies (for dropdowns)
   */
  async getActiveCompanies(): Promise<Company[]> {
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
