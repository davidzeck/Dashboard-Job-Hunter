/**
 * Settings Service - User preferences and notification settings API calls
 * Handles all settings-related operations including notifications,
 * alert preferences, and user configurations
 */

import { apiClient } from "./api-client";

// ============================================
// Types
// ============================================

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  email_frequency: "instant" | "daily" | "weekly";
  alert_on_new_jobs: boolean;
  alert_on_matching_jobs: boolean;
  alert_on_scrape_errors: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // HH:mm format
  quiet_hours_end?: string; // HH:mm format
}

export interface JobAlertPreferences {
  keywords: string[];
  locations: string[];
  job_types: string[];
  experience_levels: string[];
  min_salary?: number;
  salary_currency: string;
  company_ids: string[];
}

export interface UserPreferences {
  default_view: "card" | "table";
  items_per_page: number;
  default_sort_field: string;
  default_sort_direction: "asc" | "desc";
  show_expired_jobs: boolean;
  auto_refresh_interval: number; // minutes, 0 = disabled
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  location?: string;
  last_active: string;
  is_current: boolean;
}

export interface UpdateNotificationSettingsInput {
  push_enabled?: boolean;
  email_enabled?: boolean;
  email_frequency?: "instant" | "daily" | "weekly";
  alert_on_new_jobs?: boolean;
  alert_on_matching_jobs?: boolean;
  alert_on_scrape_errors?: boolean;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface UpdateJobAlertPreferencesInput {
  keywords?: string[];
  locations?: string[];
  job_types?: string[];
  experience_levels?: string[];
  min_salary?: number;
  salary_currency?: string;
  company_ids?: string[];
}

export interface UpdateUserPreferencesInput {
  default_view?: "card" | "table";
  items_per_page?: number;
  default_sort_field?: string;
  default_sort_direction?: "asc" | "desc";
  show_expired_jobs?: boolean;
  auto_refresh_interval?: number;
}

// ============================================
// Settings Service
// ============================================

export const settingsService = {
  // ==========================================
  // Notification Settings
  // ==========================================

  /**
   * Get user's notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    return apiClient.get<NotificationSettings>("/users/me/notifications");
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    data: UpdateNotificationSettingsInput
  ): Promise<NotificationSettings> {
    return apiClient.patch<NotificationSettings>("/users/me/notifications", data);
  },

  /**
   * Test push notification
   */
  async testPushNotification(): Promise<{ message: string }> {
    return apiClient.post("/users/me/notifications/test-push");
  },

  /**
   * Test email notification
   */
  async testEmailNotification(): Promise<{ message: string }> {
    return apiClient.post("/users/me/notifications/test-email");
  },

  // ==========================================
  // Job Alert Preferences
  // ==========================================

  /**
   * Get user's job alert preferences
   */
  async getJobAlertPreferences(): Promise<JobAlertPreferences> {
    return apiClient.get<JobAlertPreferences>("/users/me/alert-preferences");
  },

  /**
   * Update job alert preferences
   */
  async updateJobAlertPreferences(
    data: UpdateJobAlertPreferencesInput
  ): Promise<JobAlertPreferences> {
    return apiClient.patch<JobAlertPreferences>("/users/me/alert-preferences", data);
  },

  // ==========================================
  // User Preferences
  // ==========================================

  /**
   * Get user's display/UI preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>("/users/me/preferences");
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    data: UpdateUserPreferencesInput
  ): Promise<UserPreferences> {
    return apiClient.patch<UserPreferences>("/users/me/preferences", data);
  },

  // ==========================================
  // Session Management
  // ==========================================

  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<Session[]> {
    return apiClient.get<Session[]>("/auth/sessions");
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<{ message: string }> {
    return apiClient.post("/auth/sessions/revoke-all");
  },

  // ==========================================
  // Account Actions
  // ==========================================

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(): Promise<{ download_url: string; expires_at: string }> {
    return apiClient.post("/users/me/export");
  },

  /**
   * Request account deletion
   */
  async requestAccountDeletion(): Promise<{ message: string; confirmation_required: boolean }> {
    return apiClient.post("/users/me/delete-request");
  },

  /**
   * Confirm account deletion with password
   */
  async confirmAccountDeletion(password: string): Promise<{ message: string }> {
    return apiClient.post("/users/me/delete-confirm", { password });
  },
};
