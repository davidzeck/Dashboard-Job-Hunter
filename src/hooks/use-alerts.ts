/**
 * Alerts hooks — the user's job-alert feed.
 * Mutations invalidate both the feed and the user-stats counts
 * (the unread badge lives on user-stats).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsService } from "@/services";
import { useToast } from "@/stores";
import { jobsKeys } from "./use-jobs";

export const alertsKeys = {
  all: ["alerts"] as const,
  list: (params: { unreadOnly?: boolean; page?: number }) =>
    [...alertsKeys.all, "list", params] as const,
};

export function useAlerts(
  params: { unreadOnly?: boolean; page?: number; pageSize?: number } = {}
) {
  return useQuery({
    queryKey: alertsKeys.list({ unreadOnly: params.unreadOnly, page: params.page }),
    queryFn: () =>
      alertsService.getAlerts({
        unread_only: params.unreadOnly,
        page: params.page,
        page_size: params.pageSize,
      }),
  });
}

function useAlertMutation(
  mutationFn: (alertId: string) => Promise<{ message: string }>,
  errorTitle: string
) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.invalidateQueries({ queryKey: [...jobsKeys.all, "user-stats"] });
    },
    onError: (error: Error) => {
      toast.error(errorTitle, error.message);
    },
  });
}

export function useMarkAlertRead() {
  return useAlertMutation((id) => alertsService.markRead(id), "Failed to mark read");
}

export function useToggleAlertSaved() {
  return useAlertMutation((id) => alertsService.toggleSaved(id), "Failed to update");
}

export function useMarkAlertApplied() {
  return useAlertMutation(
    (id) => alertsService.markApplied(id),
    "Failed to mark applied"
  );
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: () => alertsService.markAllRead(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.invalidateQueries({ queryKey: [...jobsKeys.all, "user-stats"] });
      toast.success(res.message);
    },
    onError: (error: Error) => {
      toast.error("Failed to mark all read", error.message);
    },
  });
}
