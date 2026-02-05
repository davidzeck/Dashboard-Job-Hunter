"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  CheckCircle,
  Globe,
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatSalary, formatDate } from "@/lib/utils";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CompanyAvatar,
  Skeleton,
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { useJobsStore, useToast } from "@/stores";
import type { Job } from "@/types";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const jobId = params.id as string;

  // Get job from store or fetch
  const jobs = useJobsStore((state) => state.jobs);
  const selectedJob = useJobsStore((state) => state.selectedJob);
  const setSelectedJob = useJobsStore((state) => state.setSelectedJob);

  // Local state
  const [job, setJob] = React.useState<Job | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaved, setIsSaved] = React.useState(false);

  // Find or fetch job
  React.useEffect(() => {
    const foundJob = jobs.find((j) => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
      setSelectedJob(foundJob);
      setIsLoading(false);
    } else if (selectedJob?.id === jobId) {
      setJob(selectedJob);
      setIsLoading(false);
    } else {
      // Simulate API fetch with mock data
      setTimeout(() => {
        const mockJob: Job = {
          id: jobId,
          title: "Senior Software Engineer",
          company_id: "company-1",
          company: {
            id: "company-1",
            name: "Safaricom",
            logo_url: undefined,
            careers_url: "https://safaricom.co.ke/careers",
            is_active: true,
            scraper_type: "dynamic",
            scrape_frequency_hours: 12,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          source_id: "source-1",
          description: `We are looking for a Senior Software Engineer to join our team at Safaricom. You will be responsible for designing, developing, and maintaining high-quality software solutions that power our mobile money and communications services.

## Key Responsibilities
- Design and implement scalable backend systems
- Lead technical discussions and code reviews
- Mentor junior developers and contribute to engineering best practices
- Collaborate with product managers and designers to deliver user-centric solutions
- Optimize application performance and ensure system reliability
- Participate in on-call rotations for production systems

## What We're Looking For
- 5+ years of experience in software development
- Strong proficiency in Python, Go, or Java
- Experience with microservices architecture and distributed systems
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Excellent problem-solving and communication skills
- Bachelor's degree in Computer Science or related field`,
          requirements: [
            "5+ years of software development experience",
            "Proficiency in Python, Go, or Java",
            "Experience with microservices and distributed systems",
            "Cloud platform experience (AWS/GCP/Azure)",
            "Strong communication skills",
            "Bachelor's degree in CS or related field",
          ],
          location: "Nairobi, Kenya",
          job_type: "full_time",
          experience_level: "senior",
          salary_min: 300000,
          salary_max: 500000,
          salary_currency: "KES",
          application_url: "https://safaricom.co.ke/careers/apply/12345",
          status: "new",
          first_seen_at: new Date(Date.now() - 86400000).toISOString(),
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setJob(mockJob);
        setSelectedJob(mockJob);
        setIsLoading(false);
      }, 500);
    }
  }, [jobId, jobs, selectedJob, setSelectedJob]);

  // Handlers
  const handleBack = () => {
    router.back();
  };

  const handleApply = () => {
    if (job) {
      window.open(job.application_url, "_blank");
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(
      isSaved ? "Job removed" : "Job saved",
      isSaved ? "Job removed from saved list" : "Job added to your saved list"
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied", "Job link copied to clipboard");
  };

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Job not found</h2>
        <p className="text-muted-foreground mb-4">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row gap-6"
      >
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Job header card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <CompanyAvatar
                  name={job.company?.name || "Company"}
                  logoUrl={job.company?.logo_url}
                  size="xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        {job.status === "new" && (
                          <Badge variant="urgent">New</Badge>
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground">
                        {job.company?.name || "Unknown Company"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSave}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {formatJobType(job.job_type)}
                      </span>
                    )}
                    {job.experience_level && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {formatExperienceLevel(job.experience_level)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Posted {formatRelativeTime(job.first_seen_at)}
                    </span>
                  </div>

                  {/* Salary */}
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-2 mt-4">
                      <DollarSign className="h-5 w-5 text-success" />
                      <span className="text-lg font-semibold text-success">
                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                      </span>
                      <span className="text-sm text-muted-foreground">/ month</span>
                    </div>
                  )}

                  {/* Apply button */}
                  <div className="mt-6">
                    <Button size="lg" onClick={handleApply} className="gap-2">
                      Apply Now
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {job.description ? (
                  <div className="whitespace-pre-wrap">
                    {formatDescription(job.description)}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No description available. Visit the application page for more details.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-4">
          {/* Company info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CompanyAvatar
                  name={job.company?.name || "Company"}
                  logoUrl={job.company?.logo_url}
                  size="md"
                />
                <div>
                  <p className="font-medium">{job.company?.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">Technology</p>
                </div>
              </div>
              {job.company?.careers_url && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open(job.company?.careers_url, "_blank")}
                >
                  <Globe className="h-4 w-4" />
                  View Careers Page
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Job details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={job.status} />
                  </dd>
                </div>
                {job.job_type && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{formatJobType(job.job_type)}</dd>
                  </div>
                )}
                {job.experience_level && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Level</dt>
                    <dd className="font-medium">
                      {formatExperienceLevel(job.experience_level)}
                    </dd>
                  </div>
                )}
                {job.location && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium">{job.location}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Posted</dt>
                  <dd className="font-medium">
                    {formatDate(job.first_seen_at)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd className="font-medium">{formatDate(job.last_seen_at)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button className="w-full gap-2" onClick={handleApply}>
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleSave}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {isSaved ? "Saved" : "Save Job"}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

// Helper components
function StatusBadge({ status }: { status: Job["status"] }) {
  const variants: Record<Job["status"], { label: string; className: string }> = {
    new: { label: "New", className: "bg-urgent/10 text-urgent" },
    active: { label: "Active", className: "bg-success/10 text-success" },
    expired: { label: "Expired", className: "bg-warning/10 text-warning" },
    filled: { label: "Filled", className: "bg-muted text-muted-foreground" },
  };

  const { label, className } = variants[status];
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", className)}>
      {label}
    </span>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-5 w-1/3" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatJobType(type: string): string {
  const labels: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    internship: "Internship",
    remote: "Remote",
  };
  return labels[type] || type;
}

function formatExperienceLevel(level: string): string {
  const labels: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead",
    executive: "Executive",
  };
  return labels[level] || level;
}

function formatDescription(description: string): React.ReactNode {
  // Convert markdown-like headers to styled elements
  const lines = description.split("\n");
  return lines.map((line, index) => {
    if (line.startsWith("## ")) {
      return (
        <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
          {line.replace("## ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={index} className="ml-4">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (line.trim() === "") {
      return <br key={index} />;
    }
    return <p key={index}>{line}</p>;
  });
}
