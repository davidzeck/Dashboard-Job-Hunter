"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Switch,
  Pagination,
} from "@/components/ui";
import { EmptyState, CardSkeleton } from "@/components/shared";
import {
  useAlerts,
  useMarkAlertRead,
  useToggleAlertSaved,
  useMarkAlertApplied,
  useMarkAllAlertsRead,
  useUserStats,
} from "@/hooks";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { UserJobAlert } from "@/types";

const PAGE_SIZE = 10;

export function AlertsList() {
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useAlerts({ unreadOnly, page, pageSize: PAGE_SIZE });
  const { data: stats } = useUserStats();
  const markAllRead = useMarkAllAlertsRead();
  const router = useRouter();

  const unread = stats?.unread_alerts ?? 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={unreadOnly}
            onCheckedChange={(checked) => {
              setUnreadOnly(checked);
              setPage(1);
            }}
          />
          Unread only
        </label>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || unread === 0}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? "No unread alerts" : "No alerts yet"}
          description={
            unreadOnly
              ? "You're all caught up."
              : "Alerts arrive when newly scraped jobs match your skills or preferences. Upload a CV and set preferences to start receiving them."
          }
          actionLabel={unreadOnly ? undefined : "Browse jobs"}
          onAction={unreadOnly ? undefined : () => router.push("/jobs")}
        />
      ) : (
        <div className="space-y-3">
          {data.items.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
          {data.total_pages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                currentPage={page}
                totalPages={data.total_pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert }: { alert: UserJobAlert }) {
  const router = useRouter();
  const markRead = useMarkAlertRead();
  const toggleSaved = useToggleAlertSaved();
  const markApplied = useMarkAlertApplied();

  const openJob = () => {
    if (!alert.is_read) markRead.mutate(alert.id);
    router.push(`/jobs/${alert.job.id}`);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:border-primary/40",
        !alert.is_read && "border-primary/30 bg-primary/[0.03]"
      )}
      onClick={openJob}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Unread dot */}
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            alert.is_read ? "bg-transparent" : "bg-primary"
          )}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${alert.job.id}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "truncate hover:text-primary hover:underline",
                alert.is_read ? "font-normal" : "font-semibold"
              )}
            >
              {alert.job.title}
            </Link>
            {alert.is_applied && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Applied
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {alert.job.company?.name}
            {" • "}
            {formatRelativeTime(alert.notified_at)}
            {alert.notification_channel ? ` • via ${alert.notification_channel}` : ""}
          </p>
        </div>

        {/* Quick actions */}
        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={alert.is_saved ? "Unsave" : "Save"}
            onClick={() => toggleSaved.mutate(alert.id)}
            disabled={toggleSaved.isPending}
          >
            {alert.is_saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          {!alert.is_applied && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markApplied.mutate(alert.id)}
              disabled={markApplied.isPending}
            >
              Applied
            </Button>
          )}
          {alert.job.application_url && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => window.open(alert.job.application_url, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
