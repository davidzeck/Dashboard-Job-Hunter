/**
 * Jobs Service - Job related API calls
 * Supports demo mode with mock data
 */

import { apiClient } from "./api-client";
import { isDemoMode, mockJobsService } from "./mock-api-service";
import type {
  Job,
  JobFilters,
  SortConfig,
  PaginatedResponse,
  DashboardStats,
} from "@/types";

interface GetJobsParams extends JobFilters {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

// Backend returns different field names — normalize to dashboard Job type
function transformJob(raw: Record<string, unknown>): Job {
  const company = raw.company as Record<string, unknown> | undefined;
  return {
    ...(raw as unknown as Job),
    // apply_url → application_url
    application_url: (raw.apply_url ?? raw.application_url) as string,
    // embedded company object → company_id string
    company_id: company?.id as string ?? (raw.company_id as string) ?? "",
    company: company as unknown as Job["company"],
    // discovered_at / posted_at → first_seen_at / last_seen_at
    first_seen_at: (raw.posted_at ?? raw.discovered_at ?? raw.first_seen_at) as string,
    last_seen_at: (raw.discovered_at ?? raw.last_seen_at) as string,
    // is_active boolean → status enum
    status: (raw.status as Job["status"]) ?? (raw.is_active ? "active" : "expired"),
    // source_id not present in list response — default to empty
    source_id: (raw.source_id as string) ?? "",
  };
}

export const jobsService = {
  /**
   * Get paginated list of jobs with filters
   */
  async getJobs(params: GetJobsParams = {}): Promise<PaginatedResponse<Job>> {
    if (isDemoMode()) {
      return mockJobsService.getJobs(params);
    }

    // Backend params: page, limit, role (keyword), location, location_type, days_ago
    const response = await apiClient.get<PaginatedResponse<Record<string, unknown>>>("/jobs", {
      page: params.page || 1,
      limit: params.page_size || 20,
      role: params.search,
      location: params.location,
    });

    return {
      ...response,
      items: response.items.map(transformJob),
    };
  },

  /**
   * Get a single job by ID
   */
  async getJob(id: string): Promise<Job> {
    if (isDemoMode()) {
      return mockJobsService.getJob(id);
    }
    const raw = await apiClient.get<Record<string, unknown>>(`/jobs/${id}`);
    return transformJob(raw);
  },

  /**
   * Get jobs by company
   */
  async getJobsByCompany(
    companyId: string,
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<Job>> {
    if (isDemoMode()) {
      return mockJobsService.getJobs({ company_id: companyId, ...params });
    }
    return apiClient.get<PaginatedResponse<Job>>(`/companies/${companyId}/jobs`, {
      page: params.page || 1,
      page_size: params.page_size || 20,
    });
  },

  /**
   * Get jobs by source
   */
  async getJobsBySource(
    sourceId: string,
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<Job>> {
    if (isDemoMode()) {
      return mockJobsService.getJobs({ source_id: sourceId, ...params });
    }
    return apiClient.get<PaginatedResponse<Job>>(`/sources/${sourceId}/jobs`, {
      page: params.page || 1,
      page_size: params.page_size || 20,
    });
  },

  /**
   * Update job status
   */
  async updateJobStatus(id: string, status: Job["status"]): Promise<Job> {
    if (isDemoMode()) {
      return mockJobsService.updateJobStatus(id, status);
    }
    return apiClient.patch<Job>(`/jobs/${id}`, { status });
  },

  /**
   * Get new jobs (jobs seen in the last 24 hours)
   */
  async getNewJobs(limit: number = 10): Promise<Job[]> {
    if (isDemoMode()) {
      return mockJobsService.getNewJobs(limit);
    }

    const response = await apiClient.get<PaginatedResponse<Record<string, unknown>>>("/jobs", {
      page: 1,
      limit,
      days_ago: 1,
    });
    return response.items.map(transformJob);
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    if (isDemoMode()) {
      return mockJobsService.getDashboardStats();
    }
    return apiClient.get<DashboardStats>("/dashboard/stats");
  },
};
