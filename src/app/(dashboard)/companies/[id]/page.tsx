"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Power,
  ExternalLink,
  Globe,
  Clock,
  Settings,
  Briefcase,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  CompanyAvatar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  EmptyState,
} from "@/components/ui";
import {
  useCompany,
  useDeleteCompany,
  useToggleCompanyActive,
} from "@/hooks";
import { sourcesService, jobsService } from "@/services";
import { useUIStore, useToast } from "@/stores";
import { formatDistanceToNow, cn } from "@/lib/utils";
import type { JobSource, Job } from "@/types";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const companyId = params.id as string;

  const openModal = useUIStore((state) => state.openModal);

  // Fetch company details
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId);

  // Fetch company's sources
  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["companies", companyId, "sources"],
    queryFn: () => sourcesService.getSourcesByCompany(companyId),
    enabled: !!companyId,
  });

  // Fetch company's jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["companies", companyId, "jobs"],
    queryFn: () => jobsService.getJobsByCompany(companyId, { page_size: 10 }),
    enabled: !!companyId,
  });

  // Mutations
  const deleteCompany = useDeleteCompany();
  const toggleActive = useToggleCompanyActive();

  // Handlers
  const handleBack = () => {
    router.push("/companies");
  };

  const handleEdit = () => {
    if (company) {
      openModal("edit-company", { company });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this company? This will also delete all associated sources and jobs.")) {
      deleteCompany.mutate(companyId, {
        onSuccess: () => {
          router.push("/companies");
        },
      });
    }
  };

  const handleToggleActive = () => {
    if (company) {
      toggleActive.mutate({ id: companyId, isActive: !company.is_active });
    }
  };

  const handleAddSource = () => {
    openModal("add-source", { companyId });
  };

  // Loading state
  if (companyLoading) {
    return <CompanyDetailSkeleton />;
  }

  // Error state
  if (companyError || !company) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <EmptyState
          icon={AlertCircle}
          title="Company not found"
          description="The company you're looking for doesn't exist or has been deleted."
          action={
            <Button onClick={handleBack}>
              Go to Companies
            </Button>
          }
        />
      </div>
    );
  }

  const scraperTypeLabels: Record<string, string> = {
    static: "Static HTML",
    dynamic: "Dynamic JavaScript",
    api: "API Integration",
  };

  const activeSourcesCount = sources?.filter((s) => s.is_active).length || 0;
  const errorSourcesCount = sources?.filter((s) => s.scraper_status === "error").length || 0;
  const jobs = jobsData?.items || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={handleBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start gap-6"
      >
        <CompanyAvatar
          name={company.name}
          logoUrl={company.logo_url}
          size="xl"
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <Badge variant={company.is_active ? "success" : "secondary"}>
              {company.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              {scraperTypeLabels[company.scraper_type] || company.scraper_type}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Every {company.scrape_frequency_hours}h
            </span>
            {company.last_scraped_at && (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Last scraped {formatDistanceToNow(new Date(company.last_scraped_at))}
              </span>
            )}
          </div>
          <div className="mt-3">
            <a
              href={company.careers_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Globe className="h-4 w-4" />
              {company.careers_url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
          >
            <Power className="h-4 w-4 mr-2" />
            {company.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sources?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSourcesCount}</p>
                <p className="text-sm text-muted-foreground">Active Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{jobsData?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Jobs Found</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {errorSourcesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">
              {errorSourcesCount} source{errorSourcesCount > 1 ? "s" : ""} with errors
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/sources?company_id=${companyId}&status=error`)}
          >
            View Errors
          </Button>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">
            Sources ({sources?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="jobs">
            Recent Jobs ({jobsData?.total || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Job Sources</h3>
            <Button size="sm" onClick={handleAddSource}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>

          {sourcesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Globe}
              title="No sources yet"
              description="Add a source to start tracking jobs from this company."
              action={
                <Button onClick={handleAddSource}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Recent Jobs</h3>
            {jobsData && jobsData.total > 10 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => router.push(`/jobs?company_id=${companyId}`)}
              >
                View all {jobsData.total} jobs
              </Button>
            )}
          </div>

          {jobsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-5 w-64 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="Jobs will appear here once the sources have been scraped."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Source card component
function SourceCard({ source }: { source: JobSource }) {
  const router = useRouter();

  const statusColors: Record<string, string> = {
    active: "text-green-500",
    error: "text-destructive",
    paused: "text-yellow-500",
    inactive: "text-muted-foreground",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    active: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    paused: <Clock className="h-4 w-4" />,
    inactive: <Power className="h-4 w-4" />,
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/sources/${source.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-muted", statusColors[source.scraper_status])}>
              {statusIcons[source.scraper_status]}
            </div>
            <div>
              <p className="font-medium">{source.source_type.replace("_", " ")}</p>
              <p className="text-sm text-muted-foreground truncate max-w-md">
                {source.source_url}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={source.is_active ? "success" : "secondary"}>
              {source.scraper_status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {source.jobs_found_count} jobs found
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Job card component
function JobCard({ job }: { job: Job }) {
  const router = useRouter();

  const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    new: "success",
    active: "default",
    expired: "secondary",
    filled: "warning",
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/jobs/${job.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{job.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {job.location && <span>{job.location}</span>}
              {job.job_type && (
                <>
                  <span>•</span>
                  <span>{job.job_type.replace("_", " ")}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge variant={statusColors[job.status]}>{job.status}</Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(job.first_seen_at))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
function CompanyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-40 animate-pulse rounded bg-muted" />
      <div className="flex gap-6">
        <div className="h-20 w-20 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-3 flex-1">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
