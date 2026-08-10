// Custom hooks exports

// Auth hooks
export {
  useAuth,
  useLogout,
  useRequireAuth,
  useRedirectIfAuthenticated,
} from "./use-auth";

// Jobs hooks
export {
  useJobs,
  useJob,
  useToggleSaveJob,
  useToggleAppliedJob,
  useSavedJobs,
  useAppliedJobs,
  useUserStats,
  useNewJobs,
  useRecommendedJobs,
  useDashboardStats,
  jobsKeys,
} from "./use-jobs";

// Alerts hooks
export {
  useAlerts,
  useMarkAlertRead,
  useToggleAlertSaved,
  useMarkAlertApplied,
  useMarkAllAlertsRead,
  alertsKeys,
} from "./use-alerts";

// Dashboard analytics hooks
export {
  useJobsTimeline,
  useScrapeActivity,
  useSourcePerformance,
  useActivity,
  dashboardKeys,
} from "./use-dashboard";

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

// CV hooks
export {
  useCVs,
  useUploadCV,
  useDeleteCV,
  useGetCVDownloadUrl,
  useSkills,
  useAddSkill,
  useRemoveSkill,
  useAnalyzeCv,
  useTailorCv,
  useTaskStatus,
  useAiUsage,
  useCurateCv,
  useDrafts,
  useDraft,
  useUpdateDraft,
  useApproveDraft,
  useDraftDownload,
  cvKeys,
} from "./use-cv";

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
