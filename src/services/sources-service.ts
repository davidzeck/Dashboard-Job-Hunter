/**
 * Sources Service - Job source related API calls
 */

import { apiClient } from "./api-client";
import type {
  JobSource,
  SourceFilters,
  PaginatedResponse,
  ScrapeLog,
  CreateJobSourceInput,
  UpdateJobSourceInput,
} from "@/types";

interface GetSourcesParams extends SourceFilters {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export const sourcesService = {
  /**
   * Get paginated list of job sources
   */
  async getSources(
    params: GetSourcesParams = {}
  ): Promise<PaginatedResponse<JobSource>> {
    return apiClient.get<PaginatedResponse<JobSource>>("/sources", {
      page: params.page || 1,
      page_size: params.page_size || 20,
      search: params.search,
      company_id: params.company_id,
      source_type: params.source_type,
      scraper_status: params.scraper_status,
      is_active: params.is_active,
      sort_by: params.sort_by || "last_scraped_at",
      sort_direction: params.sort_direction || "desc",
    });
  },

  /**
   * Get a single source by ID
   */
  async getSource(id: string): Promise<JobSource> {
    return apiClient.get<JobSource>(`/sources/${id}`);
  },

  /**
   * Create a new job source
   */
  async createSource(data: CreateJobSourceInput): Promise<JobSource> {
    return apiClient.post<JobSource>("/sources", data);
  },

  /**
   * Update a job source
   */
  async updateSource(
    id: string,
    data: UpdateJobSourceInput
  ): Promise<JobSource> {
    return apiClient.patch<JobSource>(`/sources/${id}`, data);
  },

  /**
   * Delete a job source
   */
  async deleteSource(id: string): Promise<void> {
    return apiClient.delete(`/sources/${id}`);
  },

  /**
   * Toggle source active status
   */
  async toggleSourceActive(id: string, isActive: boolean): Promise<JobSource> {
    return apiClient.patch<JobSource>(`/sources/${id}`, { is_active: isActive });
  },

  /**
   * Trigger manual scrape for a source
   */
  async triggerScrape(id: string): Promise<{ message: string; task_id: string }> {
    return apiClient.post(`/sources/${id}/scrape`);
  },

  /**
   * Get scrape logs for a source
   */
  async getScrapeLogs(
    sourceId: string,
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<ScrapeLog>> {
    return apiClient.get<PaginatedResponse<ScrapeLog>>(
      `/sources/${sourceId}/logs`,
      {
        page: params.page || 1,
        page_size: params.page_size || 20,
      }
    );
  },

  /**
   * Get sources by company
   */
  async getSourcesByCompany(companyId: string): Promise<JobSource[]> {
    const response = await apiClient.get<PaginatedResponse<JobSource>>(
      `/companies/${companyId}/sources`,
      { page_size: 100 }
    );
    return response.items;
  },

  /**
   * Get sources with errors
   */
  async getErrorSources(): Promise<JobSource[]> {
    const response = await apiClient.get<PaginatedResponse<JobSource>>(
      "/sources",
      {
        scraper_status: "error",
        page_size: 50,
      }
    );
    return response.items;
  },
};
