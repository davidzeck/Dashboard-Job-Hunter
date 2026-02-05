// Custom hooks exports

// Auth hooks
export {
  useAuth,
  useRequireAuth,
  useRedirectIfAuthenticated,
} from "./use-auth";

// Jobs hooks
export {
  useJobs,
  useJob,
  useUpdateJobStatus,
  useNewJobs,
  useDashboardStats,
  jobsKeys,
} from "./use-jobs";

// Sources hooks
export {
  useSources,
  useSource,
  useCreateSource,
  useUpdateSource,
  useDeleteSource,
  useTriggerScrape,
  useScrapeLogs,
  useErrorSources,
  sourcesKeys,
} from "./use-sources";

// Companies hooks
export {
  useCompanies,
  useCompany,
  useActiveCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useToggleCompanyActive,
  companiesKeys,
} from "./use-companies";

// Settings hooks
export {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useTestNotification,
  useJobAlertPreferences,
  useUpdateJobAlertPreferences,
  useUserPreferences,
  useUpdateUserPreferences,
  useUpdateProfile,
  useChangePassword,
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
  useExportData,
  useDeleteAccount,
  settingsKeys,
} from "./use-settings";
