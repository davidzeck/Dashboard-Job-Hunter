/**
 * Dashboard Service — real overview analytics (admin-only endpoints).
 * No demo mode: these read the backend exclusively.
 */

import { apiClient } from "./api-client";

export interface JobsTimelinePoint {
  [key: string]: string | number; // recharts generic accessor
  date: string; // short weekday label
  jobs: number;
  newJobs: number;
}

export interface ScrapeActivityPoint {
  [key: string]: string | number; // recharts generic accessor
  hour: string; // hour label
  scrapes: number;
  success: number;
  failed: number;
}

export interface SourcePerformance {
  data: { active: number; error: number; paused: number; inactive: number };
  successRate: number;
}

export type ActivityType =
  | "job_found"
  | "scrape_completed"
  | "scrape_failed"
  | "source_added"
  | "alert_sent"
  | "company_added";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    companyName?: string;
    jobCount?: number;
    sourceName?: string;
    errorMessage?: string;
  };
}

const weekday = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
const hourLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric" });

export const dashboardService = {
  async getJobsTimeline(days = 7): Promise<JobsTimelinePoint[]> {
    const rows = await apiClient.get<
      Array<{ date: string; jobs: number; new_jobs: number }>
    >("/dashboard/jobs-timeline", { days });
    return rows.map((r) => ({ date: weekday(r.date), jobs: r.jobs, newJobs: r.new_jobs }));
  },

  async getScrapeActivity(hours = 24): Promise<ScrapeActivityPoint[]> {
    const rows = await apiClient.get<
      Array<{ hour: string; scrapes: number; success: number; failed: number }>
    >("/dashboard/scrape-activity", { hours });
    return rows.map((r) => ({
      hour: hourLabel(r.hour),
      scrapes: r.scrapes,
      success: r.success,
      failed: r.failed,
    }));
  },

  async getSourcePerformance(): Promise<SourcePerformance> {
    const res = await apiClient.get<{
      data: { active: number; error: number; paused: number; inactive: number };
      success_rate: number;
    }>("/dashboard/source-performance");
    return { data: res.data, successRate: res.success_rate };
  },

  async getActivity(limit = 15): Promise<ActivityItem[]> {
    return apiClient.get<ActivityItem[]>("/dashboard/activity", { limit });
  },
};
