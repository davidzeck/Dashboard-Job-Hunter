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
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
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
}

// Scrape Log Types
export type ScrapeStatus = "success" | "partial" | "failed";

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
export interface UserJobAlert {
  id: string;
  user_id: string;
  job_id: string;
  job?: Job;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
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
  company_id?: string;
  source_id?: string;
  status?: JobStatus;
  experience_level?: ExperienceLevel;
  job_type?: JobType;
  location?: string;
  date_from?: string;
  date_to?: string;
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
