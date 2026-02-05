/**
 * Sources Service - Job source related API calls
 * Supports demo mode with mock data
 */

import { apiClient } from "./api-client";
import { isDemoMode, mockSourcesService } from "./mock-api-service";
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
    if (isDemoMode()) {
      return mockSourcesService.getSources(params);
    }

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
    if (isDemoMode()) {
      return mockSourcesService.getSource(id);
    }
    return apiClient.get<JobSource>(`/sources/${id}`);
  },

  /**
   * Create a new job source
   */
  async createSource(data: CreateJobSourceInput): Promise<JobSource> {
    if (isDemoMode()) {
      return mockSourcesService.createSource(data);
    }
    return apiClient.post<JobSource>("/sources", data);
  },

  /**
   * Update a job source
   */
  async updateSource(
    id: string,
    data: UpdateJobSourceInput
  ): Promise<JobSource> {
    if (isDemoMode()) {
      return mockSourcesService.updateSource(id, data);
    }
    return apiClient.patch<JobSource>(`/sources/${id}`, data);
  },

  /**
   * Delete a job source
   */
  async deleteSource(id: string): Promise<void> {
    if (isDemoMode()) {
      return mockSourcesService.deleteSource(id);
    }
    return apiClient.delete(`/sources/${id}`);
  },

  /**
   * Toggle source active status
   */
  async toggleSourceActive(id: string, isActive: boolean): Promise<JobSource> {
    if (isDemoMode()) {
      return mockSourcesService.updateSource(id, { is_active: isActive });
    }
    return apiClient.patch<JobSource>(`/sources/${id}`, { is_active: isActive });
  },

  /**
   * Trigger manual scrape for a source
   */
  async triggerScrape(id: string): Promise<{ message: string; task_id?: string }> {
    if (isDemoMode()) {
      return mockSourcesService.triggerScrape(id);
    }
    return apiClient.post(`/sources/${id}/scrape`);
  },

  /**
   * Get scrape logs for a source
   */
  async getScrapeLogs(
    sourceId: string,
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<ScrapeLog>> {
    if (isDemoMode()) {
      const logs = await mockSourcesService.getScrapeLogs(sourceId);
      return {
        items: logs,
        total: logs.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
    }

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
    if (isDemoMode()) {
      const response = await mockSourcesService.getSources({ company_id: companyId });
      return response.items;
    }

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
    if (isDemoMode()) {
      return mockSourcesService.getErrorSources();
    }

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
