"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck, CheckCircle2, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Pagination,
} from "@/components/ui";
import { EmptyState, CardSkeleton } from "@/components/shared";
import {
  useSavedJobs,
  useAppliedJobs,
  useToggleSaveJob,
  useToggleAppliedJob,
} from "@/hooks";
import { formatRelativeTime } from "@/lib/utils";
import type { Job } from "@/types";

const PAGE_SIZE = 10;

export function MyJobsTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "applied" ? "applied" : "saved";
  const [tab, setTab] = React.useState<"saved" | "applied">(initialTab);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const next = value as "saved" | "applied";
        setTab(next);
        router.replace(next === "applied" ? "/my-jobs?tab=applied" : "/my-jobs", {
          scroll: false,
        });
      }}
      className="space-y-6"
    >
      <TabsList>
        <TabsTrigger value="saved" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Saved
        </TabsTrigger>
        <TabsTrigger value="applied" className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Applied
        </TabsTrigger>
      </TabsList>

      <TabsContent value="saved">
        <SavedTab />
      </TabsContent>
      <TabsContent value="applied">
        <AppliedTab />
      </TabsContent>
    </Tabs>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function SavedTab() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useSavedJobs({ page, page_size: PAGE_SIZE });
  const toggleSave = useToggleSaveJob();

  if (isLoading) return <TabSkeleton />;
  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        variant="jobs"
        title="No saved jobs yet"
        description="Bookmark jobs while browsing and they'll collect here for quick access."
        actionLabel="Browse jobs"
        onAction={() => router.push("/jobs")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((job) => (
        <MyJobRow
          key={job.id}
          job={job}
          action={
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => toggleSave.mutate({ id: job.id, saved: false })}
              disabled={toggleSave.isPending}
            >
              <BookmarkCheck className="h-4 w-4 text-primary" />
              Unsave
            </Button>
          }
        />
      ))}
      <ListPagination page={page} totalPages={data.total_pages} onChange={setPage} />
    </div>
  );
}

function AppliedTab() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useAppliedJobs({ page, page_size: PAGE_SIZE });
  const toggleApplied = useToggleAppliedJob();

  if (isLoading) return <TabSkeleton />;
  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        variant="jobs"
        title="No applications tracked yet"
        description='Use "Mark as applied" on a job page after applying, and track everything here.'
        actionLabel="Browse jobs"
        onAction={() => router.push("/jobs")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((job) => (
        <MyJobRow
          key={job.id}
          job={job}
          badge={
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Applied
            </Badge>
          }
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleApplied.mutate({ id: job.id, applied: false })}
              disabled={toggleApplied.isPending}
            >
              Undo
            </Button>
          }
        />
      ))}
      <ListPagination page={page} totalPages={data.total_pages} onChange={setPage} />
    </div>
  );
}

function MyJobRow({
  job,
  badge,
  action,
}: {
  job: Job;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="truncate font-medium hover:text-primary hover:underline"
            >
              {job.title}
            </Link>
            {badge}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {job.company?.name}
            {job.location ? ` • ${job.location}` : ""}
            {job.first_seen_at
              ? ` • ${formatRelativeTime(job.first_seen_at)}`
              : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          {job.application_url && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => window.open(job.application_url, "_blank")}
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

function ListPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center pt-2">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onChange}
      />
    </div>
  );
}
