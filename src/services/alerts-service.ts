/**
 * Alerts Service — the user's job-alert feed (user_job_alerts).
 *
 * Backend routes (all authenticated):
 *   GET   /alerts?unread_only&page&limit  → PaginatedResponse[AlertResponse]
 *   PATCH /alerts/{id}/read | /saved | /applied
 *   POST  /alerts/read-all
 */
import { apiClient } from "./api-client";
import { transformJob } from "./jobs-service";
import type { PaginatedResponse, UserJobAlert } from "@/types";

interface GetAlertsParams {
  unread_only?: boolean;
  page?: number;
  page_size?: number;
}

export const alertsService = {
  async getAlerts(
    params: GetAlertsParams = {}
  ): Promise<PaginatedResponse<UserJobAlert>> {
    const response = await apiClient.get<
      PaginatedResponse<UserJobAlert & { job: Record<string, unknown> }>
    >("/alerts", {
      unread_only: params.unread_only || undefined,
      page: params.page || 1,
      limit: params.page_size || 20,
    });
    // Normalize the embedded job (apply_url → application_url, etc.)
    return {
      ...response,
      items: response.items.map((a) => ({ ...a, job: transformJob(a.job) })),
    };
  },

  async markRead(alertId: string): Promise<{ message: string }> {
    return apiClient.patch(`/alerts/${alertId}/read`);
  },

  async toggleSaved(alertId: string): Promise<{ message: string }> {
    return apiClient.patch(`/alerts/${alertId}/saved`);
  },

  async markApplied(alertId: string): Promise<{ message: string }> {
    return apiClient.patch(`/alerts/${alertId}/applied`);
  },

  async markAllRead(): Promise<{ message: string }> {
    return apiClient.post("/alerts/read-all");
  },
};
