"use client";

import * as React from "react";
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import { useCVs, useUploadCV, useDeleteCV, useGetCVDownloadUrl, useSkills, useAddSkill, useRemoveSkill } from "@/hooks";
import type { CVResponse } from "@/services/cv-service";

// ──────────────────────────────────────────────────────────────
// CV Management
// ──────────────────────────────────────────────────────────────

export function CVManagement() {
  return (
    <div className="space-y-6">
      <CVUploadCard />
      <CVListCard />
      <SkillsCard />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Upload Card
// ──────────────────────────────────────────────────────────────

function CVUploadCard() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const upload = useUploadCV((p) => setProgress(Math.round(p * 100)));
  const { data: cvs } = useCVs();
  const cvCount = cvs?.length ?? 0;
  const atLimit = cvCount >= 10;

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      return; // toast shown by service on error
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    setProgress(0);
    upload.mutate(file, { onSettled: () => setProgress(0) });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload CV</CardTitle>
        <CardDescription>
          Upload a PDF (max 5 MB). Skills are extracted automatically.{" "}
          <span className="text-muted-foreground">{cvCount}/10 CVs used.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={upload.isPending || atLimit}
        />

        {/* Drop zone */}
        <div
          className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer
            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            ${atLimit || upload.isPending ? "pointer-events-none opacity-60" : ""}
          `}
          onClick={() => !atLimit && !upload.isPending && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {upload.isPending ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Uploading…</p>
              {progress > 0 && (
                <div className="w-full max-w-xs">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-center text-muted-foreground">{progress}%</p>
                </div>
              )}
            </>
          ) : atLimit ? (
            <>
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-medium text-destructive">CV limit reached (10/10)</p>
              <p className="text-xs text-muted-foreground">Delete an existing CV to upload a new one</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Drop your CV here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF only · Max 5 MB</p>
              </div>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                Choose file
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────
// CV List Card
// ──────────────────────────────────────────────────────────────

function CVListCard() {
  const { data: cvs, isLoading } = useCVs();
  const deleteCV = useDeleteCV();
  const downloadCV = useGetCVDownloadUrl();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!cvs || cvs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your CVs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No CVs uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your CVs</CardTitle>
        <CardDescription>{cvs.length} CV{cvs.length !== 1 ? "s" : ""} on file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {cvs.map((cv) => (
          <CVRow
            key={cv.id}
            cv={cv}
            onDelete={() => deleteCV.mutate(cv.id)}
            onDownload={() => downloadCV.mutate(cv.id)}
            isDeleting={deleteCV.isPending && deleteCV.variables === cv.id}
            isDownloading={downloadCV.isPending && downloadCV.variables === cv.id}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface CVRowProps {
  cv: CVResponse;
  onDelete: () => void;
  onDownload: () => void;
  isDeleting: boolean;
  isDownloading: boolean;
}

function CVRow({ cv, onDelete, onDownload, isDeleting, isDownloading }: CVRowProps) {
  const statusConfig = {
    ready: { icon: CheckCircle2, label: "Ready", className: "text-success bg-success/10" },
    processing: { icon: Clock, label: "Processing", className: "text-warning bg-warning/10" },
    uploaded: { icon: Clock, label: "Processing", className: "text-warning bg-warning/10" },
    pending_upload: { icon: Clock, label: "Pending", className: "text-muted-foreground bg-muted" },
    failed: { icon: AlertCircle, label: "Failed", className: "text-destructive bg-destructive/10" },
  };

  const { icon: StatusIcon, label, className } = statusConfig[cv.upload_status];

  const formattedDate = new Date(cv.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedSize = cv.file_size_bytes
    ? cv.file_size_bytes < 1024 * 1024
      ? `${Math.round(cv.file_size_bytes / 1024)} KB`
      : `${(cv.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`
    : null;

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="h-5 w-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{cv.filename}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          {formattedSize && (
            <span className="text-xs text-muted-foreground">· {formattedSize}</span>
          )}
          {cv.upload_status === "ready" && cv.skills_extracted > 0 && (
            <span className="text-xs text-muted-foreground">· {cv.skills_extracted} skills</span>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
        <StatusIcon className="h-3 w-3" />
        {label}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDownload}
          disabled={isDownloading || cv.upload_status !== "ready"}
          title="Download CV"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete CV"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Skills Card
// ──────────────────────────────────────────────────────────────

function SkillsCard() {
  const { data: skills, isLoading } = useSkills();
  const addSkill = useAddSkill();
  const removeSkill = useRemoveSkill();
  const [input, setInput] = React.useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || skills?.includes(trimmed)) return;
    addSkill.mutate(trimmed, { onSuccess: () => setInput("") });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skills</CardTitle>
        <CardDescription>
          Skills are extracted from your CV automatically. You can also add them manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add skill input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a skill (e.g. Python)"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!input.trim() || addSkill.isPending}
            className="gap-1 shrink-0"
          >
            {addSkill.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </Button>
        </div>

        {/* Skills list */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading skills…
          </div>
        ) : !skills || skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skills yet. Upload a CV or add skills manually above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="gap-1 pr-1 text-sm font-normal"
              >
                {skill}
                <button
                  onClick={() => removeSkill.mutate(skill)}
                  disabled={removeSkill.isPending && removeSkill.variables === skill}
                  className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                  title={`Remove ${skill}`}
                >
                  {removeSkill.isPending && removeSkill.variables === skill ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
