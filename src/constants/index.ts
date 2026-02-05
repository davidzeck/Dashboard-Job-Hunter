// Application constants

export const APP_NAME = "Job Scout";
export const APP_DESCRIPTION = "Speed-to-application job alerts platform";

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    ME: "/users/me",
  },
  JOBS: {
    LIST: "/jobs",
    DETAIL: (id: string) => `/jobs/${id}`,
  },
  SOURCES: {
    LIST: "/sources",
    DETAIL: (id: string) => `/sources/${id}`,
    SCRAPE: (id: string) => `/sources/${id}/scrape`,
    LOGS: (id: string) => `/sources/${id}/logs`,
  },
  COMPANIES: {
    LIST: "/companies",
    DETAIL: (id: string) => `/companies/${id}`,
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
  },
} as const;

// Job status options
export const JOB_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "filled", label: "Filled" },
] as const;

// Experience level options
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
] as const;

// Job type options
export const JOB_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
] as const;

// Source type options
export const SOURCE_TYPE_OPTIONS = [
  { value: "careers_page", label: "Careers Page" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "glassdoor", label: "Glassdoor" },
  { value: "other", label: "Other" },
] as const;

// Scraper status options
export const SCRAPER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "error", label: "Error" },
  { value: "paused", label: "Paused" },
] as const;

// Scraper type options
export const SCRAPER_TYPE_OPTIONS = [
  { value: "static", label: "Static (HTML)" },
  { value: "dynamic", label: "Dynamic (JS)" },
  { value: "api", label: "API" },
] as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date format
export const DATE_FORMAT = "MMM dd, yyyy";
export const DATETIME_FORMAT = "MMM dd, yyyy HH:mm";

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD_STATS: 30000, // 30 seconds
  NEW_JOBS: 60000, // 1 minute
  ERROR_SOURCES: 60000, // 1 minute
  SCRAPE_LOGS: 10000, // 10 seconds
} as const;
