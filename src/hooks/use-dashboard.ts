/**
 * Dashboard analytics hooks — real overview charts (admin-only).
 * Gated on isAdmin like useDashboardStats; non-admins never fetch.
 */

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";
import { useAuthStore, selectIsAdmin } from "@/stores";

export const dashboardKeys = {
  all: ["dashboard-charts"] as const,
  jobsTimeline: (days: number) => [...dashboardKeys.all, "jobs-timeline", days] as const,
  scrapeActivity: (hours: number) => [...dashboardKeys.all, "scrape-activity", hours] as const,
  sourcePerformance: () => [...dashboardKeys.all, "source-performance"] as const,
  activity: (limit: number) => [...dashboardKeys.all, "activity", limit] as const,
};

export function useJobsTimeline(days = 7) {
  const isAdmin = useAuthStore(selectIsAdmin);
  return useQuery({
    queryKey: dashboardKeys.jobsTimeline(days),
    queryFn: () => dashboardService.getJobsTimeline(days),
    enabled: isAdmin,
    refetchInterval: 60000,
  });
}

export function useScrapeActivity(hours = 24) {
  const isAdmin = useAuthStore(selectIsAdmin);
  return useQuery({
    queryKey: dashboardKeys.scrapeActivity(hours),
    queryFn: () => dashboardService.getScrapeActivity(hours),
    enabled: isAdmin,
    refetchInterval: 60000,
  });
}

export function useSourcePerformance() {
  const isAdmin = useAuthStore(selectIsAdmin);
  return useQuery({
    queryKey: dashboardKeys.sourcePerformance(),
    queryFn: () => dashboardService.getSourcePerformance(),
    enabled: isAdmin,
    refetchInterval: 60000,
  });
}

export function useActivity(limit = 15) {
  const isAdmin = useAuthStore(selectIsAdmin);
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => dashboardService.getActivity(limit),
    enabled: isAdmin,
    refetchInterval: 60000,
  });
}
