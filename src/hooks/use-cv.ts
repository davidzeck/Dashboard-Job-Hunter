/**
 * CV Hooks - Data fetching layer for CV management and skills
 *
 * ARCHITECTURE: API-driven pattern (same as use-settings.ts)
 * - useQuery for reads, useMutation for writes
 * - Mutations invalidate the relevant queries on success
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/stores";
import { cvService } from "@/services/cv-service";
import type { CVResponse } from "@/services/cv-service";

// ============================================
// Query Keys
// ============================================

export const cvKeys = {
  all: ["cv"] as const,
  list: () => [...cvKeys.all, "list"] as const,
  skills: () => [...cvKeys.all, "skills"] as const,
};

// ============================================
// CV Hooks
// ============================================

/** Fetch all active CVs for the current user. */
export function useCVs() {
  return useQuery({
    queryKey: cvKeys.list(),
    queryFn: () => cvService.listCVs(),
  });
}

/**
 * Upload a CV via the 3-step presigned POST flow.
 * Pass an optional `onProgress` callback to track S3 upload progress.
 */
export function useUploadCV(onProgress?: (progress: number) => void) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (file: File) => cvService.uploadCV(file, onProgress),
    onSuccess: (cv: CVResponse) => {
      queryClient.invalidateQueries({ queryKey: cvKeys.list() });
      // Also invalidate auth user so has_cv / skills_count refresh on the overview banner
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success(
        "CV uploaded",
        `"${cv.filename}" is being processed. Skills will appear shortly.`
      );
    },
    onError: (error: Error) => {
      toast.error("Upload failed", error.message);
    },
  });
}

/** Soft-delete a CV. */
export function useDeleteCV() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (cvId: string) => cvService.deleteCV(cvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.list() });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success("CV deleted", "The CV has been removed from your account");
    },
    onError: (error: Error) => {
      toast.error("Delete failed", error.message);
    },
  });
}

/** Get a time-limited presigned download URL for a CV. */
export function useGetCVDownloadUrl() {
  const toast = useToast();

  return useMutation({
    mutationFn: (cvId: string) => cvService.getDownloadUrl(cvId),
    onSuccess: (data) => {
      window.open(data.download_url, "_blank");
    },
    onError: (error: Error) => {
      toast.error("Download failed", error.message);
    },
  });
}

// ============================================
// Skills Hooks
// ============================================

/** Fetch all skill names for the current user. */
export function useSkills() {
  return useQuery({
    queryKey: cvKeys.skills(),
    queryFn: () => cvService.getSkills(),
  });
}

/** Add a skill manually. */
export function useAddSkill() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (skill: string) => cvService.addSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.skills() });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add skill", error.message);
    },
  });
}

/** Remove a skill by name. */
export function useRemoveSkill() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (skill: string) => cvService.removeSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.skills() });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to remove skill", error.message);
    },
  });
}
