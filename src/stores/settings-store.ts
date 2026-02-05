/**
 * Settings Store - API-driven store for user settings and preferences
 * Follows the pattern: Store holds API responses + UI state
 * Hooks read params via typed selectors, pass to API, write response to store
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  NotificationSettings,
  JobAlertPreferences,
  UserPreferences,
  Session,
} from "@/services/settings-service";

// ============================================
// State Types
// ============================================

export interface SettingsState {
  // API Response Data (read-only, set by hooks)
  notificationSettings: NotificationSettings | null;
  jobAlertPreferences: JobAlertPreferences | null;
  userPreferences: UserPreferences | null;
  sessions: Session[];

  // Loading & Error States
  isLoadingNotifications: boolean;
  isLoadingSessions: boolean;
  isLoadingPreferences: boolean;
  isSaving: boolean;
  error: string | null;

  // UI State
  activeTab: "profile" | "notifications" | "security" | "preferences";

  // Actions (for hooks to write API responses)
  setNotificationSettings: (settings: NotificationSettings | null) => void;
  setJobAlertPreferences: (prefs: JobAlertPreferences | null) => void;
  setUserPreferences: (prefs: UserPreferences | null) => void;
  setSessions: (sessions: Session[]) => void;
  removeSession: (sessionId: string) => void;
  clearAllSessions: () => void;

  // Loading Actions
  setLoadingNotifications: (loading: boolean) => void;
  setLoadingSessions: (loading: boolean) => void;
  setLoadingPreferences: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;

  // UI Actions
  setActiveTab: (tab: "profile" | "notifications" | "security" | "preferences") => void;

  // Reset
  resetStore: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  notificationSettings: null,
  jobAlertPreferences: null,
  userPreferences: null,
  sessions: [],
  isLoadingNotifications: false,
  isLoadingSessions: false,
  isLoadingPreferences: false,
  isSaving: false,
  error: null,
  activeTab: "profile" as const,
};

// ============================================
// Store
// ============================================

export const useSettingsStore = create<SettingsState>()(
  immer((set) => ({
    ...initialState,

    // ==========================================
    // Data Setters (for hooks to write API responses)
    // ==========================================

    setNotificationSettings: (settings) =>
      set((state) => {
        state.notificationSettings = settings;
      }),

    setJobAlertPreferences: (prefs) =>
      set((state) => {
        state.jobAlertPreferences = prefs;
      }),

    setUserPreferences: (prefs) =>
      set((state) => {
        state.userPreferences = prefs;
      }),

    setSessions: (sessions) =>
      set((state) => {
        state.sessions = sessions;
      }),

    removeSession: (sessionId) =>
      set((state) => {
        state.sessions = state.sessions.filter((s) => s.id !== sessionId);
      }),

    clearAllSessions: () =>
      set((state) => {
        // Keep only current session
        state.sessions = state.sessions.filter((s) => s.is_current);
      }),

    // ==========================================
    // Loading State Actions
    // ==========================================

    setLoadingNotifications: (loading) =>
      set((state) => {
        state.isLoadingNotifications = loading;
      }),

    setLoadingSessions: (loading) =>
      set((state) => {
        state.isLoadingSessions = loading;
      }),

    setLoadingPreferences: (loading) =>
      set((state) => {
        state.isLoadingPreferences = loading;
      }),

    setSaving: (saving) =>
      set((state) => {
        state.isSaving = saving;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    // ==========================================
    // UI Actions
    // ==========================================

    setActiveTab: (tab) =>
      set((state) => {
        state.activeTab = tab;
      }),

    // ==========================================
    // Reset
    // ==========================================

    resetStore: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);

// ============================================
// Typed Selectors
// ============================================

export const selectNotificationSettings = (state: SettingsState) =>
  state.notificationSettings;

export const selectJobAlertPreferences = (state: SettingsState) =>
  state.jobAlertPreferences;

export const selectUserPreferences = (state: SettingsState) =>
  state.userPreferences;

export const selectSessions = (state: SettingsState) => state.sessions;

export const selectCurrentSession = (state: SettingsState) =>
  state.sessions.find((s) => s.is_current);

export const selectOtherSessions = (state: SettingsState) =>
  state.sessions.filter((s) => !s.is_current);

export const selectIsLoadingNotifications = (state: SettingsState) =>
  state.isLoadingNotifications;

export const selectIsLoadingSessions = (state: SettingsState) =>
  state.isLoadingSessions;

export const selectIsLoadingPreferences = (state: SettingsState) =>
  state.isLoadingPreferences;

export const selectIsSaving = (state: SettingsState) => state.isSaving;

export const selectSettingsError = (state: SettingsState) => state.error;

export const selectActiveTab = (state: SettingsState) => state.activeTab;

// Computed selectors
export const selectHasPushEnabled = (state: SettingsState) =>
  state.notificationSettings?.push_enabled ?? false;

export const selectHasEmailEnabled = (state: SettingsState) =>
  state.notificationSettings?.email_enabled ?? false;

export const selectSessionCount = (state: SettingsState) =>
  state.sessions.length;
