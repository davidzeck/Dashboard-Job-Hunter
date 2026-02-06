/**
 * Mock API Service - Provides demo data when backend is unavailable
 * Simulates API responses with realistic delays
 */

import {
  mockCompanies,
  mockJobs,
  mockSources,
  mockDashboardStats,
  mockScrapeLogs,
  mockUser,
  getNewJobs,
  getErrorSources,
  getJobsByCompany,
  getSourcesByCompany,
  getCompanyById,
  getJobById,
  getSourceById,
} from "@/lib/mock-data";
import type {
  Company,
  Job,
  JobSource,
  DashboardStats,
  ScrapeLog,
  PaginatedResponse,
  User,
  AuthTokens,
  JobFilters,
  SourceFilters,
} from "@/types";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(200 + Math.random() * 300);

// ============================================
// Check if Demo Mode
// ============================================

export const isDemoMode = () => {
  // Demo mode is enabled when:
  // 1. NEXT_PUBLIC_DEMO_MODE is set to 'true'
  // 2. Or when the API URL is not configured (fallback)
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      !process.env.NEXT_PUBLIC_API_URL
    );
  }
  return true;
};

// ============================================
// Auth Mock Service
// ============================================

export const mockAuthService = {
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    await randomDelay();

    // Accept any demo credentials
    if (email && password) {
      return {
        user: { ...mockUser, email },
        tokens: {
          access_token: "demo_access_token_" + Date.now(),
          refresh_token: "demo_refresh_token_" + Date.now(),
          token_type: "bearer",
        },
      };
    }
    throw new Error("Invalid credentials");
  },

  async register(data: { email: string; password: string; full_name: string }) {
    await randomDelay();
    return {
      user: { ...mockUser, email: data.email, full_name: data.full_name },
      tokens: {
        access_token: "demo_access_token_" + Date.now(),
        refresh_token: "demo_refresh_token_" + Date.now(),
        token_type: "bearer",
      },
    };
  },

  async getCurrentUser(): Promise<User> {
    await randomDelay();
    return mockUser;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    await randomDelay();
    return { ...mockUser, ...data };
  },

  async changePassword(): Promise<{ message: string }> {
    await randomDelay();
    return { message: "Password changed successfully" };
  },
};

// ============================================
// Jobs Mock Service
// ============================================

export const mockJobsService = {
  async getJobs(params: {
    page?: number;
    page_size?: number;
    search?: string;
    company_id?: string;
    source_id?: string;
    status?: string;
    experience_level?: string;
    job_type?: string;
    sort_by?: string;
    sort_direction?: string;
  }): Promise<PaginatedResponse<Job>> {
    await randomDelay();

    let filteredJobs = [...mockJobs];

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.company?.name.toLowerCase().includes(search) ||
          j.location?.toLowerCase().includes(search)
      );
    }

    if (params.company_id) {
      filteredJobs = filteredJobs.filter((j) => j.company_id === params.company_id);
    }

    if (params.source_id) {
      filteredJobs = filteredJobs.filter((j) => j.source_id === params.source_id);
    }

    if (params.status) {
      filteredJobs = filteredJobs.filter((j) => j.status === params.status);
    }

    if (params.experience_level) {
      filteredJobs = filteredJobs.filter((j) => j.experience_level === params.experience_level);
    }

    if (params.job_type) {
      filteredJobs = filteredJobs.filter((j) => j.job_type === params.job_type);
    }

    // Apply sorting
    if (params.sort_by) {
      const sortKey = params.sort_by as keyof Job;
      filteredJobs.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const direction = params.sort_direction === "desc" ? -1 : 1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal) * direction;
        }
        return 0;
      });
    }

    // Paginate
    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const start = (page - 1) * pageSize;
    const paginatedJobs = filteredJobs.slice(start, start + pageSize);

    return {
      items: paginatedJobs,
      total: filteredJobs.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filteredJobs.length / pageSize),
    };
  },

  async getJob(id: string): Promise<Job> {
    await randomDelay();
    const job = getJobById(id);
    if (!job) throw new Error("Job not found");
    return job;
  },

  async getNewJobs(limit: number = 10): Promise<Job[]> {
    await randomDelay();
    return getNewJobs(limit);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await randomDelay();
    return mockDashboardStats;
  },

  async updateJobStatus(id: string, status: string): Promise<Job> {
    await randomDelay();
    const job = getJobById(id);
    if (!job) throw new Error("Job not found");
    return { ...job, status: status as Job["status"] };
  },
};

// ============================================
// Sources Mock Service
// ============================================

export const mockSourcesService = {
  async getSources(params: {
    page?: number;
    page_size?: number;
    search?: string;
    company_id?: string;
    source_type?: string;
    scraper_status?: string;
    sort_by?: string;
    sort_direction?: string;
  }): Promise<PaginatedResponse<JobSource>> {
    await randomDelay();

    let filteredSources = [...mockSources];

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredSources = filteredSources.filter(
        (s) =>
          s.source_url.toLowerCase().includes(search) ||
          s.company?.name.toLowerCase().includes(search)
      );
    }

    if (params.company_id) {
      filteredSources = filteredSources.filter((s) => s.company_id === params.company_id);
    }

    if (params.source_type) {
      filteredSources = filteredSources.filter((s) => s.source_type === params.source_type);
    }

    if (params.scraper_status) {
      filteredSources = filteredSources.filter((s) => s.scraper_status === params.scraper_status);
    }

    // Paginate
    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const start = (page - 1) * pageSize;
    const paginatedSources = filteredSources.slice(start, start + pageSize);

    return {
      items: paginatedSources,
      total: filteredSources.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filteredSources.length / pageSize),
    };
  },

  async getSource(id: string): Promise<JobSource> {
    await randomDelay();
    const source = getSourceById(id);
    if (!source) throw new Error("Source not found");
    return source;
  },

  async getErrorSources(): Promise<JobSource[]> {
    await randomDelay();
    return getErrorSources();
  },

  async createSource(data: Partial<JobSource>): Promise<JobSource> {
    await randomDelay();
    const company = getCompanyById(data.company_id || "");
    return {
      id: "src-new-" + Date.now(),
      company_id: data.company_id || "",
      company,
      source_type: data.source_type || "careers_page",
      source_url: data.source_url || "",
      is_active: true,
      scraper_status: "active",
      jobs_found_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async updateSource(id: string, data: Partial<JobSource>): Promise<JobSource> {
    await randomDelay();
    const source = getSourceById(id);
    if (!source) throw new Error("Source not found");
    return { ...source, ...data };
  },

  async deleteSource(id: string): Promise<void> {
    await randomDelay();
  },

  async triggerScrape(id: string): Promise<{ message: string }> {
    await randomDelay();
    return { message: "Scrape triggered successfully" };
  },

  async getScrapeLogs(sourceId: string): Promise<ScrapeLog[]> {
    await randomDelay();
    return mockScrapeLogs.filter((l) => l.source_id === sourceId);
  },
};

// ============================================
// Companies Mock Service
// ============================================

export const mockCompaniesService = {
  async getCompanies(params: {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
    sort_by?: string;
    sort_direction?: string;
  }): Promise<PaginatedResponse<Company>> {
    await randomDelay();

    let filteredCompanies = [...mockCompanies];

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredCompanies = filteredCompanies.filter((c) =>
        c.name.toLowerCase().includes(search)
      );
    }

    if (params.is_active !== undefined) {
      filteredCompanies = filteredCompanies.filter((c) => c.is_active === params.is_active);
    }

    // Apply sorting
    if (params.sort_by) {
      const sortKey = params.sort_by as keyof Company;
      filteredCompanies.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const direction = params.sort_direction === "desc" ? -1 : 1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal) * direction;
        }
        return 0;
      });
    }

    // Paginate
    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const start = (page - 1) * pageSize;
    const paginatedCompanies = filteredCompanies.slice(start, start + pageSize);

    return {
      items: paginatedCompanies,
      total: filteredCompanies.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filteredCompanies.length / pageSize),
    };
  },

  async getCompany(id: string): Promise<Company> {
    await randomDelay();
    const company = getCompanyById(id);
    if (!company) throw new Error("Company not found");
    return company;
  },

  async getActiveCompanies(): Promise<Company[]> {
    await randomDelay();
    return mockCompanies.filter((c) => c.is_active);
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    await randomDelay();
    return {
      id: "comp-new-" + Date.now(),
      name: data.name || "",
      logo_url: data.logo_url,
      careers_url: data.careers_url || "",
      is_active: true,
      scraper_type: data.scraper_type || "static",
      scrape_frequency_hours: data.scrape_frequency_hours || 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    await randomDelay();
    const company = getCompanyById(id);
    if (!company) throw new Error("Company not found");
    return { ...company, ...data };
  },

  async deleteCompany(id: string): Promise<void> {
    await randomDelay();
  },

  async toggleCompanyActive(id: string, isActive: boolean): Promise<Company> {
    await randomDelay();
    const company = getCompanyById(id);
    if (!company) throw new Error("Company not found");
    return { ...company, is_active: isActive };
  },

  async getCompanySources(companyId: string): Promise<JobSource[]> {
    await randomDelay();
    return getSourcesByCompany(companyId);
  },

  async getCompanyJobs(companyId: string): Promise<Job[]> {
    await randomDelay();
    return getJobsByCompany(companyId);
  },
};

// ============================================
// Settings Mock Service
// ============================================

export const mockSettingsService = {
  async getNotificationSettings() {
    await randomDelay();
    return {
      push_enabled: true,
      email_enabled: true,
      email_frequency: "daily" as const,
      alert_on_new_jobs: true,
      alert_on_matching_jobs: false,
      alert_on_scrape_errors: true,
      quiet_hours_enabled: false,
    };
  },

  async updateNotificationSettings(data: Record<string, unknown>) {
    await randomDelay();
    return { ...data };
  },

  async getActiveSessions() {
    await randomDelay();
    return [
      {
        id: "session-001",
        device: "MacBook Pro",
        browser: "Chrome 120",
        ip_address: "192.168.1.100",
        location: "Nairobi, Kenya",
        last_active: new Date().toISOString(),
        is_current: true,
      },
      {
        id: "session-002",
        device: "iPhone 15",
        browser: "Safari",
        ip_address: "192.168.1.101",
        location: "Nairobi, Kenya",
        last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_current: false,
      },
    ];
  },

  async revokeSession(sessionId: string) {
    await randomDelay();
    return { message: "Session revoked" };
  },

  async revokeAllSessions() {
    await randomDelay();
    return { message: "All sessions revoked" };
  },
};
