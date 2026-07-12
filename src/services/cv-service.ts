/**
 * CV Service - CV upload, management, and skills API calls
 * Follows the 3-step presigned POST flow: presign → S3 direct upload → confirm
 */

import { apiClient } from "./api-client";
import { useAuthStore } from "@/stores";

// ============================================
// Types
// ============================================

export interface CVPresignRequest {
  filename: string;
  file_size_bytes: number;
  file_hash: string; // SHA-256 hex, 64 chars
}

export interface CVPresignResponse {
  cv_id: string;
  upload_url: string;
  fields: Record<string, string>;
  expires_at: string;
}

export interface CVResponse {
  id: string;
  filename: string;
  file_size_bytes: number | null;
  file_hash: string | null;
  upload_status: "pending_upload" | "uploaded" | "processing" | "ready" | "failed";
  skills_extracted: number;
  is_active: boolean;
  created_at: string;
  processed_at: string | null;
}

export interface CVDownloadUrlResponse {
  cv_id: string;
  download_url: string;
  expires_in_seconds: number;
}

// ── AI/ATS Types ──────────────────────────────────────────────

export interface CVAnalysisResult {
  cv_id: string;
  job_id: string;
  match_score: number; // 0.0–1.0
  present_keywords: string[];
  missing_keywords: string[];
  suggested_additions: string[];
  cached: boolean;
  analyzed_at: string;
}

export interface CVTailorResult {
  cv_id: string;
  job_id: string;
  tailored_summary: string;
  tailored_skills: string[];
  keywords_added: string[];
  original_summary: string;
}

export interface CVTaskStatusResponse<T = CVAnalysisResult | CVTailorResult> {
  task_id: string;
  status: "pending" | "started" | "success" | "failure";
  result?: T | null;
  error?: string | null;
}

/** GET /users/me/ai-usage — daily quota snapshot for analyze/tailor calls. */
export interface AiUsage {
  used: number;
  limit: number;
  remaining: number;
  warn: boolean;
  exhausted: boolean;
  resets_in_seconds: number | null;
}

// ── Curated CV drafts & document export ──────────────────────

/** Structured CV — mirrors backend CVStructure (app/schemas/cv.py). */
export interface CVStructure {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  summary: string;
  skills: { category: string; items: string[] }[];
  experience: {
    title: string;
    company: string;
    location: string;
    start: string;
    end: string;
    bullets: string[];
  }[];
  education: { degree: string; institution: string; year: string }[];
  certifications: string[];
}

export type CVDraftStatus =
  | "generating"
  | "review"
  | "approved"
  | "rendered"
  | "failed"
  | "superseded";

export interface CVDraft {
  id: string;
  cv_id: string;
  job_id: string;
  status: CVDraftStatus;
  content: {
    original: CVStructure;
    tailored: CVStructure;
    keywords_injected: string[];
  } | null;
  error?: string | null;
  docx_ready: boolean;
  pdf_ready: boolean;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurateStartResponse {
  task_id: string;
  draft_id: string;
  status: string;
}

export interface DraftDownload {
  draft_id: string;
  format: "docx" | "pdf";
  download_url: string;
  expires_in: number;
}

// ============================================
// Helpers
// ============================================

/** Compute SHA-256 of a File using the Web Crypto API. Returns 64-char hex string. */
async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Upload a File directly to S3 using a presigned POST URL (no JWT header). */
async function uploadToS3(
  uploadUrl: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    // S3 policy fields MUST come before the file binary
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded / e.total);
        }
      };
    }

    xhr.onload = () => {
      // S3 presigned POST returns 204 on success
      if (xhr.status < 400) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("S3 upload failed: network error"));
    xhr.send(formData);
  });
}

// ============================================
// CV Service
// ============================================

export const cvService = {
  /**
   * Full 3-step CV upload:
   * 1. Presign  — API creates a DB record and returns S3 presigned POST details
   * 2. Upload   — File goes directly to S3 (no JWT, no API bandwidth)
   * 3. Confirm  — API verifies the S3 object and enqueues Celery processing
   */
  async uploadCV(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<CVResponse> {
    // Step 1: Compute hash + request presigned URL
    const fileHash = await sha256Hex(file);

    const presign = await apiClient.post<CVPresignResponse>(
      "/users/me/cv/presign",
      {
        filename: file.name,
        file_size_bytes: file.size,
        file_hash: fileHash,
      }
    );

    // Step 2: Upload directly to S3 (plain XHR — no auth header)
    await uploadToS3(presign.upload_url, presign.fields, file, onProgress);

    // Step 3: Confirm with API to trigger Celery processing
    const cv = await apiClient.post<CVResponse>(
      `/users/me/cv/${presign.cv_id}/confirm`,
      { file_hash: fileHash }
    );

    return cv;
  },

  /** List all active CVs for the current user. */
  async listCVs(): Promise<CVResponse[]> {
    return apiClient.get<CVResponse[]>("/users/me/cv");
  },

  /** Get a time-limited presigned download URL for a CV. */
  async getDownloadUrl(cvId: string): Promise<CVDownloadUrlResponse> {
    return apiClient.get<CVDownloadUrlResponse>(
      `/users/me/cv/${cvId}/download-url`
    );
  },

  /** Soft-delete a CV and remove its S3 object. */
  async deleteCV(cvId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/me/cv/${cvId}`);
  },

  // ──────────────────────────────────────────
  // Skills
  // ──────────────────────────────────────────

  /** List all skill names for the current user. */
  async getSkills(): Promise<string[]> {
    return apiClient.get<string[]>("/users/me/skills");
  },

  /** Add a skill manually (upserts — safe to call if skill already exists). */
  async addSkill(skill: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/users/me/skills", { skill });
  },

  /** Remove a skill by name. */
  async removeSkill(skill: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/me/skills/${encodeURIComponent(skill)}`);
  },

  // ──────────────────────────────────────────
  // AI / ATS
  // ──────────────────────────────────────────

  /** Analyze a CV against a job description. Returns cached result or task_id for polling. */
  async analyzeCv(cvId: string, jobId: string): Promise<CVTaskStatusResponse<CVAnalysisResult>> {
    return apiClient.post<CVTaskStatusResponse<CVAnalysisResult>>(
      `/users/me/cv/${cvId}/analyze`,
      { job_id: jobId }
    );
  },

  /** Tailor a CV for a specific job. Always async — returns task_id for polling. */
  async tailorCv(cvId: string, jobId: string): Promise<CVTaskStatusResponse<CVTailorResult>> {
    return apiClient.post<CVTaskStatusResponse<CVTailorResult>>(
      `/users/me/cv/${cvId}/tailor`,
      { job_id: jobId }
    );
  },

  /** Poll a Celery task by ID. */
  async getTaskStatus<T = CVAnalysisResult | CVTailorResult>(
    taskId: string
  ): Promise<CVTaskStatusResponse<T>> {
    return apiClient.get<CVTaskStatusResponse<T>>(`/users/me/cv/tasks/${taskId}`);
  },

  /** Daily AI quota snapshot — drives the nearing-limit / limit-reached banner. */
  async getAiUsage(): Promise<AiUsage> {
    return apiClient.get<AiUsage>("/users/me/ai-usage");
  },

  // ──────────────────────────────────────────
  // Curated CV drafts & document export
  // ──────────────────────────────────────────

  /** Start a full-CV curation draft against a job (supersedes any live draft). */
  async curateCv(cvId: string, jobId: string): Promise<CurateStartResponse> {
    return apiClient.post<CurateStartResponse>(`/users/me/cv/${cvId}/curate`, {
      job_id: jobId,
    });
  },

  /** The caller's drafts, newest first (superseded excluded). */
  async listDrafts(): Promise<CVDraft[]> {
    return apiClient.get<CVDraft[]>("/users/me/cv/drafts");
  },

  async getDraft(draftId: string): Promise<CVDraft> {
    return apiClient.get<CVDraft>(`/users/me/cv/drafts/${draftId}`);
  },

  /** Save user edits to the tailored structure (review stage only). */
  async updateDraft(draftId: string, tailored: CVStructure): Promise<CVDraft> {
    return apiClient.patch<CVDraft>(`/users/me/cv/drafts/${draftId}`, { tailored });
  },

  /** Approve a reviewed draft — enqueues DOCX+PDF generation. */
  async approveDraft(draftId: string): Promise<CurateStartResponse> {
    return apiClient.post<CurateStartResponse>(
      `/users/me/cv/drafts/${draftId}/approve`,
      {}
    );
  },

  /** Presigned download URL for a rendered document. 409 until rendered. */
  async getDraftDownloadUrl(
    draftId: string,
    format: "docx" | "pdf"
  ): Promise<DraftDownload> {
    return apiClient.get<DraftDownload>(
      `/users/me/cv/drafts/${draftId}/download`,
      { format }
    );
  },
};
