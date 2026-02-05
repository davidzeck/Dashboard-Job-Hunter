/**
 * Jobs Service - Job related API calls
 */

import { apiClient } from "./api-client";
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

export const jobsService = {
  /**
   * Get paginated list of jobs with filters
   */
  async getJobs(params: GetJobsParams = {}): Promise<PaginatedResponse<Job>> {
    return apiClient.get<PaginatedResponse<Job>>("/jobs", {
      page: params.page || 1,
      page_size: params.page_size || 20,
      search: params.search,
      company_id: params.company_id,
      source_id: params.source_id,
      status: params.status,
      experience_level: params.experience_level,
      job_type: params.job_type,
      location: params.location,
      date_from: params.date_from,
      date_to: params.date_to,
      sort_by: params.sort_by || "first_seen_at",
      sort_direction: params.sort_direction || "desc",
    });
  },

  /**
   * Get a single job by ID
   */
  async getJob(id: string): Promise<Job> {
    return apiClient.get<Job>(`/jobs/${id}`);
  },

  /**
   * Get jobs by company
   */
  async getJobsByCompany(
    companyId: string,
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<Job>> {
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
    return apiClient.get<PaginatedResponse<Job>>(`/sources/${sourceId}/jobs`, {
      page: params.page || 1,
      page_size: params.page_size || 20,
    });
  },

  /**
   * Update job status
   */
  async updateJobStatus(id: string, status: Job["status"]): Promise<Job> {
    return apiClient.patch<Job>(`/jobs/${id}`, { status });
  },

  /**
   * Get new jobs (jobs seen in the last 24 hours)
   */
  async getNewJobs(limit: number = 10): Promise<Job[]> {
    const response = await apiClient.get<PaginatedResponse<Job>>("/jobs", {
      page: 1,
      page_size: limit,
      status: "new",
      sort_by: "first_seen_at",
      sort_direction: "desc",
    });
    return response.items;
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>("/dashboard/stats");
  },
};
