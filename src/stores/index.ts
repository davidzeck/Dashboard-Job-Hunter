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
  selectRefreshToken,
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
