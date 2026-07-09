// Store exports

// Auth store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectIsRefreshing,
  selectAuthError,
  selectAccessToken,
  selectShouldRefreshToken,
  selectIsAdmin,
} from "./auth-store";

// Jobs store
export {
  useJobsStore,
  selectJobs,
  selectSelectedJob,
  selectJobsLoading,
  selectJobsError,
  selectJobsPagination,
  selectJobsFilters,
  selectJobsSort,
  type JobsState,
} from "./jobs-store";

// Sources store
export {
  useSourcesStore,
  selectSources,
  selectSelectedSource,
  selectScrapeLogs,
  selectSourcesLoading,
  selectSourcesError,
  selectSourcesPagination,
  selectSourcesFilters,
  selectSourcesSort,
  type SourcesState,
} from "./sources-store";

// Companies store
export {
  useCompaniesStore,
  selectCompanies,
  selectSelectedCompany,
  selectCompaniesLoading,
  selectCompaniesError,
  selectCompaniesPagination,
  selectCompaniesFilters,
  selectCompaniesSort,
  type CompaniesState,
  type CompanyFilters,
} from "./companies-store";

// UI store
export {
  useUIStore,
  useToast,
  selectSidebarOpen,
  selectSidebarCollapsed,
  selectTheme,
  selectModal,
  selectToasts,
  selectCommandPaletteOpen,
  selectGlobalLoading,
} from "./ui-store";

// Settings store
export {
  useSettingsStore,
  selectNotificationSettings,
  selectJobAlertPreferences,
  selectUserPreferences,
  selectSessions,
  selectCurrentSession,
  selectOtherSessions,
  selectIsLoadingNotifications,
  selectIsLoadingSessions,
  selectIsLoadingPreferences,
  selectIsSaving,
  selectSettingsError,
  selectActiveTab,
  selectHasPushEnabled,
  selectHasEmailEnabled,
  selectSessionCount,
  type SettingsState,
} from "./settings-store";

// ============================================
// Cross-store reset (account isolation)
// ============================================

import { useJobsStore as _jobsStore } from "./jobs-store";
import { useSourcesStore as _sourcesStore } from "./sources-store";
import { useCompaniesStore as _companiesStore } from "./companies-store";
import { useSettingsStore as _settingsStore } from "./settings-store";

/**
 * Reset every user-scoped store (filters, cached lists, selections, settings).
 *
 * MUST be called on every auth transition — logout, session expiry, and login —
 * so one account's state (e.g. job filters, saved selections) never leaks into
 * another account in the same browser tab. The ui-store (theme/sidebar) is
 * deliberately excluded: it's device-level preference, not user data.
 * The React Query cache is cleared separately (needs the queryClient).
 */
export function resetUserScopedStores(): void {
  _jobsStore.getState().reset();
  _sourcesStore.getState().reset();
  _companiesStore.getState().reset();
  _settingsStore.getState().resetStore();
}
