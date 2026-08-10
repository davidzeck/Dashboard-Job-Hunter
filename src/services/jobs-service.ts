/**
 * Jobs Service - Job related API calls (real backend only)
 */

import { apiClient } from "./api-client";
import type {
  Job,
  JobInteraction,
  JobFilters,
  PaginatedResponse,
  DashboardStats,
  RecommendedJob,
  UserStats,
} from "@/types";

interface GetJobsParams extends JobFilters {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

// Backend returns different field names — normalize to dashboard Job type
export function transformJob(raw: Record<string, unknown>): Job {
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
    // per-user persisted actions
    saved: Boolean(raw.saved),
    applied: Boolean(raw.applied),
  };
}

export const jobsService = {
  /**
   * Get paginated list of jobs with filters
   */
  async getJobs(params: GetJobsParams = {}): Promise<PaginatedResponse<Job>> {
    // Backend params: page, limit, role (keyword), location, location_type, days_ago
    // (backend serves /jobs without a trailing slash — no 307 redirect)
    const response = await apiClient.get<PaginatedResponse<Record<string, unknown>>>("/jobs", {
      page: params.page || 1,
      limit: params.page_size || 20,
      role: params.search,
      location: params.location,
      location_type: params.location_type,
      days_ago: params.days_ago,
      company: params.company, // company slug filter
      validation_status: params.validation_status, // admin review filter
    });

    return {
      ...response,
      items: response.items.map(transformJob),
    };
  },

  /**
   * Jobs ranked by skill overlap with the current user's CV skills.
   * Empty for users without extracted skills (no CV yet).
   */
  async getRecommendedJobs(
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<RecommendedJob>> {
    const response = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(
      "/jobs/recommended",
      { page: params.page || 1, limit: params.page_size || 6 }
    );
    return {
      ...response,
      items: response.items.map((raw) => ({
        ...transformJob(raw),
        match_score: (raw.match_score as number) ?? 0,
        matched_skills: (raw.matched_skills as string[]) ?? [],
      })),
    };
  },

  /**
   * Get a single job by ID
   */
  async getJob(id: string): Promise<Job> {
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
   * Save / unsave a job for the current user (persisted)
   */
  async setJobSaved(id: string, saved: boolean): Promise<JobInteraction> {
    return apiClient.put<JobInteraction>(`/jobs/${id}/saved`, { saved });
  },

  /**
   * Mark a job applied / not-applied for the current user (persisted)
   */
  async setJobApplied(id: string, applied: boolean): Promise<JobInteraction> {
    return apiClient.put<JobInteraction>(`/jobs/${id}/applied`, { applied });
  },

  /**
   * Get the jobs the current user has saved
   */
  async getSavedJobs(
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(
      "/jobs/saved",
      { page: params.page || 1, limit: params.page_size || 20 }
    );
    return { ...response, items: response.items.map(transformJob) };
  },

  /**
   * Get the jobs the current user has marked as applied
   */
  async getAppliedJobs(
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(
      "/jobs/applied",
      { page: params.page || 1, limit: params.page_size || 20 }
    );
    return { ...response, items: response.items.map(transformJob) };
  },

  /**
   * Per-user activity counts (saved/applied jobs, unread alerts)
   */
  async getUserStats(): Promise<UserStats> {
    return apiClient.get<UserStats>("/users/me/stats");
  },

  /**
   * Get new jobs (jobs seen in the last 24 hours)
   */
  async getNewJobs(limit: number = 10): Promise<Job[]> {
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
    return apiClient.get<DashboardStats>("/dashboard/stats");
  },
};
