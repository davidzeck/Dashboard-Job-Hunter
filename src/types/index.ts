// ============================================
// Job Scout Type Definitions
// ============================================

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  has_cv: boolean;
  skills_count: number;
  /** Raw preferences dict from the backend: roles[], locations[], companies[], notifications{} */
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  // null for web clients — the refresh token lives in an httpOnly cookie
  refresh_token?: string | null;
  token_type: string;
  expires_in?: number; // access-token lifetime in seconds
}

// Company Types
export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  careers_url: string;
  description?: string;
  is_active: boolean;
  jobs_count: number;
  sources_count: number;
  // Scraper metadata shown on company cards/detail (mock-era fields; the
  // backend keeps these on job_sources, so they are optional here)
  scraper_type?: string;
  scrape_frequency_hours?: number;
  last_scraped_at?: string;
  created_at: string;
  updated_at: string;
}

// Job Source Types
export type JobSourceType = "careers_page" | "linkedin" | "indeed" | "glassdoor" | "other";
export type ScraperStatus = "active" | "inactive" | "error" | "paused";

export interface JobSource {
  id: string;
  company_id: string;
  company?: Company;
  source_type: JobSourceType;
  source_url: string;
  is_active: boolean;
  scraper_status: ScraperStatus;
  last_scraped_at?: string;
  last_error?: string;
  jobs_found_count: number;
  created_at: string;
  updated_at: string;
}

// Job Types
export type JobStatus = "new" | "active" | "expired" | "filled";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";
export type JobType = "full_time" | "part_time" | "contract" | "internship" | "remote";

export interface Job {
  id: string;
  title: string;
  company_id: string;
  company?: Company;
  source_id: string;
  source?: JobSource;
  description?: string;
  requirements?: string[];
  location?: string;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  application_url: string;
  external_id?: string;
  status: JobStatus;
  first_seen_at: string;
  last_seen_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Current user's persisted actions on this job
  saved?: boolean;
  applied?: boolean;
  // Backend validation gate (suspect/dead surface in the UI; dead excluded from feeds)
  validation_status?: ValidationStatus;
}

export type ValidationStatus = "unverified" | "valid" | "suspect" | "dead";

// GET /jobs/recommended item — Job + skill-overlap score
export interface RecommendedJob extends Job {
  match_score: number; // 0-100 weighted skill coverage
  matched_skills: string[];
}

// Response from PUT /jobs/:id/saved | /jobs/:id/applied
export interface JobInteraction {
  job_id: string;
  saved: boolean;
  applied: boolean;
}

// Scrape Log Types
export type ScrapeStatus =
  | "success"
  | "partial"
  | "failed"
  | "completed"
  | "started";

export interface ScrapeLog {
  id: string;
  source_id: string;
  source?: JobSource;
  status: ScrapeStatus;
  jobs_found: number;
  jobs_new: number;
  jobs_updated: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
}

// Alert Types
/** Matches the backend AlertResponse (GET /alerts). */
export interface UserJobAlert {
  id: string;
  job: Job;
  is_read: boolean;
  is_saved: boolean;
  is_applied: boolean;
  notified_at: string;
  notification_channel?: string | null;
  is_delivered: boolean;
  applied_at?: string | null;
  created_at: string;
}

/** GET /users/me/stats — per-user activity counts. */
export interface UserStats {
  saved_count: number;
  applied_count: number;
  unread_alerts: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_jobs: number;
  new_jobs_today: number;
  active_sources: number;
  total_sources: number;
  scrapes_today: number;
  failed_scrapes_today: number;
  alerts_sent_today: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

// Filter Types
export interface JobFilters {
  search?: string;
  company?: string; // company slug — backend `company` filter
  company_id?: string;
  source_id?: string;
  status?: JobStatus;
  experience_level?: ExperienceLevel;
  job_type?: JobType;
  location?: string;
  location_type?: string; // 'remote' | 'onsite' | 'hybrid' — backend filter
  days_ago?: number; // jobs discovered in the last N days ("New" = 1)
  date_from?: string;
  date_to?: string;
  validation_status?: ValidationStatus; // admin-only review filter (honored server-side for admins)
}

export interface SourceFilters {
  search?: string;
  company_id?: string;
  source_type?: JobSourceType;
  scraper_status?: ScraperStatus;
  is_active?: boolean;
}

// Sort Types
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// Form Types
export interface CreateCompanyInput {
  name: string;
  slug: string;
  logo_url?: string;
  careers_url: string;
  description?: string;
  scraper_type?: string;
  scrape_frequency_hours?: number;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  is_active?: boolean;
}

export interface CreateJobSourceInput {
  company_id: string;
  source_type: JobSourceType;
  source_url: string;
}

export interface UpdateJobSourceInput {
  source_url?: string;
  is_active?: boolean;
}
