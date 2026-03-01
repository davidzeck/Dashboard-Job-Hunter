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
};
