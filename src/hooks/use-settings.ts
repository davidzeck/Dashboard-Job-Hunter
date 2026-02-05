/**
 * Settings Hooks - Data fetching layer for user settings
 *
 * ARCHITECTURE: API-driven pattern
 * - Reads state from store using typed selectors
 * - Passes params to API endpoints
 * - Updates store with API responses
 * - Mutations invalidate queries (refetch from API)
 */

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSettingsStore,
  useAuthStore,
  useToast,
  selectNotificationSettings,
  selectSessions,
  type SettingsState,
} from "@/stores";
import {
  settingsService,
  authService,
  type UpdateNotificationSettingsInput,
  type UpdateJobAlertPreferencesInput,
  type UpdateUserPreferencesInput,
} from "@/services";

// ============================================
// Query Keys
// ============================================

export const settingsKeys = {
  all: ["settings"] as const,
  notifications: () => [...settingsKeys.all, "notifications"] as const,
  alertPreferences: () => [...settingsKeys.all, "alertPreferences"] as const,
  userPreferences: () => [...settingsKeys.all, "userPreferences"] as const,
  sessions: () => [...settingsKeys.all, "sessions"] as const,
  profile: () => [...settingsKeys.all, "profile"] as const,
};

// ============================================
// Notification Settings Hooks
// ============================================

export function useNotificationSettings() {
  const toast = useToast();
  const setNotificationSettings = useSettingsStore(
    (s: SettingsState) => s.setNotificationSettings
  );
  const setLoading = useSettingsStore(
    (s: SettingsState) => s.setLoadingNotifications
  );

  const query = useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: () => settingsService.getNotificationSettings(),
  });

  useEffect(() => {
    setLoading(query.isLoading);
    if (query.data) {
      setNotificationSettings(query.data);
    }
    if (query.error) {
      toast.error("Failed to load notification settings", (query.error as Error).message);
    }
  }, [query.data, query.isLoading, query.error, setNotificationSettings, setLoading, toast]);

  return query;
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const setSaving = useSettingsStore((s: SettingsState) => s.setSaving);

  return useMutation({
    mutationFn: (data: UpdateNotificationSettingsInput) =>
      settingsService.updateNotificationSettings(data),
    onMutate: () => {
      setSaving(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
      toast.success("Settings saved", "Your notification settings have been updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to save settings", error.message);
    },
    onSettled: () => {
      setSaving(false);
    },
  });
}

export function useTestNotification() {
  const toast = useToast();

  return useMutation({
    mutationFn: (type: "push" | "email") =>
      type === "push"
        ? settingsService.testPushNotification()
        : settingsService.testEmailNotification(),
    onSuccess: (_, type) => {
      toast.success(
        "Test sent",
        type === "push"
          ? "Check your device for a push notification"
          : "Check your email for a test notification"
      );
    },
    onError: (error: Error) => {
      toast.error("Failed to send test", error.message);
    },
  });
}

// ============================================
// Job Alert Preferences Hooks
// ============================================

export function useJobAlertPreferences() {
  const toast = useToast();
  const setJobAlertPreferences = useSettingsStore(
    (s: SettingsState) => s.setJobAlertPreferences
  );

  const query = useQuery({
    queryKey: settingsKeys.alertPreferences(),
    queryFn: () => settingsService.getJobAlertPreferences(),
  });

  useEffect(() => {
    if (query.data) {
      setJobAlertPreferences(query.data);
    }
    if (query.error) {
      toast.error("Failed to load alert preferences", (query.error as Error).message);
    }
  }, [query.data, query.error, setJobAlertPreferences, toast]);

  return query;
}

export function useUpdateJobAlertPreferences() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const setSaving = useSettingsStore((s: SettingsState) => s.setSaving);

  return useMutation({
    mutationFn: (data: UpdateJobAlertPreferencesInput) =>
      settingsService.updateJobAlertPreferences(data),
    onMutate: () => {
      setSaving(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.alertPreferences() });
      toast.success("Preferences saved", "Your job alert preferences have been updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to save preferences", error.message);
    },
    onSettled: () => {
      setSaving(false);
    },
  });
}

// ============================================
// User Preferences Hooks
// ============================================

export function useUserPreferences() {
  const toast = useToast();
  const setUserPreferences = useSettingsStore(
    (s: SettingsState) => s.setUserPreferences
  );
  const setLoading = useSettingsStore(
    (s: SettingsState) => s.setLoadingPreferences
  );

  const query = useQuery({
    queryKey: settingsKeys.userPreferences(),
    queryFn: () => settingsService.getUserPreferences(),
  });

  useEffect(() => {
    setLoading(query.isLoading);
    if (query.data) {
      setUserPreferences(query.data);
    }
    if (query.error) {
      toast.error("Failed to load preferences", (query.error as Error).message);
    }
  }, [query.data, query.isLoading, query.error, setUserPreferences, setLoading, toast]);

  return query;
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const setSaving = useSettingsStore((s: SettingsState) => s.setSaving);

  return useMutation({
    mutationFn: (data: UpdateUserPreferencesInput) =>
      settingsService.updateUserPreferences(data),
    onMutate: () => {
      setSaving(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.userPreferences() });
      toast.success("Preferences saved", "Your display preferences have been updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to save preferences", error.message);
    },
    onSettled: () => {
      setSaving(false);
    },
  });
}

// ============================================
// Profile Hooks
// ============================================

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (data: { full_name?: string; email?: string }) =>
      authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
      toast.success("Profile updated", "Your profile has been updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update profile", error.message);
    },
  });
}

export function useChangePassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Password changed", "Your password has been updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to change password", error.message);
    },
  });
}

// ============================================
// Session Management Hooks
// ============================================

export function useSessions() {
  const toast = useToast();
  const setSessions = useSettingsStore((s: SettingsState) => s.setSessions);
  const setLoading = useSettingsStore((s: SettingsState) => s.setLoadingSessions);

  const query = useQuery({
    queryKey: settingsKeys.sessions(),
    queryFn: () => settingsService.getActiveSessions(),
  });

  useEffect(() => {
    setLoading(query.isLoading);
    if (query.data) {
      setSessions(query.data);
    }
    if (query.error) {
      toast.error("Failed to load sessions", (query.error as Error).message);
    }
  }, [query.data, query.isLoading, query.error, setSessions, setLoading, toast]);

  return query;
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const removeSession = useSettingsStore((s: SettingsState) => s.removeSession);

  return useMutation({
    mutationFn: (sessionId: string) => settingsService.revokeSession(sessionId),
    onSuccess: (_, sessionId) => {
      removeSession(sessionId);
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() });
      toast.success("Session revoked", "The device has been signed out");
    },
    onError: (error: Error) => {
      toast.error("Failed to revoke session", error.message);
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const clearAllSessions = useSettingsStore((s: SettingsState) => s.clearAllSessions);

  return useMutation({
    mutationFn: () => settingsService.revokeAllSessions(),
    onSuccess: () => {
      clearAllSessions();
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() });
      toast.success("Sessions revoked", "All other devices have been signed out");
    },
    onError: (error: Error) => {
      toast.error("Failed to revoke sessions", error.message);
    },
  });
}

// ============================================
// Account Actions Hooks
// ============================================

export function useExportData() {
  const toast = useToast();

  return useMutation({
    mutationFn: () => settingsService.exportUserData(),
    onSuccess: (data) => {
      // Trigger download
      window.open(data.download_url, "_blank");
      toast.success("Export ready", "Your data export is being downloaded");
    },
    onError: (error: Error) => {
      toast.error("Failed to export data", error.message);
    },
  });
}

export function useDeleteAccount() {
  const toast = useToast();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: (password: string) => settingsService.confirmAccountDeletion(password),
    onSuccess: () => {
      toast.info("Account deleted", "Your account has been permanently deleted");
      logout();
    },
    onError: (error: Error) => {
      toast.error("Failed to delete account", error.message);
    },
  });
}
